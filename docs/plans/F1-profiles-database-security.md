# F1 Part 2 — Student Profiles and Database Security Proposal

**Status: review only.** The SQL migration in `supabase/migrations/20261010000000_profiles_security.sql` has not been executed. No users or database objects were created by preparing this proposal.

## Scope and requirements

This proposal follows F1's profile fields and account CRUD requirements, the initial functional requirements for private account data and role permissions, and Build Plan Phase 2. It covers profiles, ownership, RLS, role defaults, adult approval, and profile cleanup. It does not implement lesson progress, parent/student links, authentication UI, or administrator content management.

## Proposed `public.profiles` table

| Column | Type | Rules |
|---|---|---|
| `id` | `uuid` | Primary key and foreign key to `auth.users(id)`; `ON DELETE CASCADE` |
| `display_name` | `text` | Required, defaults to `Student`, trimmed length 1–80 |
| `role` | `text` | Required, defaults to `student`, constrained to `student` or `adult` |
| `created_at` | `timestamptz` | Required, defaults to `now()`; set from Auth account creation for backfilled users |
| `updated_at` | `timestamptz` | Required, defaults to `now()`; maintained by a database trigger |

Passwords and authentication secrets remain exclusively in Supabase Auth; they are not profile columns. No `admin` role is introduced in this migration. Add it later only with a separately reviewed authorization design.

The migration creates the table, indexes it through its primary key, enables RLS, installs narrowly scoped grants and policies, installs timestamp and sensitive-field guards, creates profiles for future Auth accounts, and backfills profiles for existing Auth users. New profiles always receive the literal database-side role `student`; the Auth user's client-editable metadata field `requested_role` is intentionally ignored.

## Access control

- `anon` receives no table privileges or policies.
- `authenticated` receives `SELECT` on the table, with an RLS policy restricting visible rows to `id = auth.uid()`.
- `authenticated` receives column-level `UPDATE(display_name)` only, with matching `USING` and `WITH CHECK` ownership conditions. Users cannot insert or delete profile rows directly.
- The Auth insert trigger creates the profile. It is `SECURITY DEFINER` with an empty `search_path`, schema-qualifies its table reference, and has direct execution revoked from API roles.
- A second trigger rejects changes to `id`, `role`, or `created_at` unless the database execution role is `postgres` or `service_role`. Column grants also prevent ordinary authenticated API requests from updating those columns.
- The `role` check constraint rejects values outside the current F1 roles. Neither a form selection nor editable Auth user metadata is trusted as authorization.

The frontend must continue to use only the publishable/anon key. Never place a service-role key in Vite variables or browser code. The service role bypasses RLS and is suitable only for appropriately protected server-side operations.

## Account roles and adult approval plan

1. Every signup starts as `student` at the database layer, regardless of submitted metadata or form selection.
2. A request to be an adult is not proof of identity, parental status, or authorization to view a student.
3. Before granting an adult role, define an approval process appropriate to the institution and privacy obligations. A designated trusted operator can review/approve the adult using a server-side administrative workflow; the role change must not be exposed through a normal profile update endpoint.
4. Keep adult account verification distinct from authorization to access a particular student's records. F9 will require a separate consented adult-student relationship and RLS policies scoped to that relationship.
5. There is no administrator role in this proposal. Any future administrator role needs a separate trusted provisioning process and policies; users must never be able to self-assign it.

This migration allows trusted database operators to change a role because the field guard permits `postgres` and `service_role`. Do not expose service-role operations in the client. A later server-side approval mechanism should be separately threat-modeled and audited.

## Account and profile deletion

The foreign key's `ON DELETE CASCADE` removes the profile automatically when the corresponding `auth.users` record is deleted. Profile deletion must be part of an authenticated account-deletion workflow that verifies the caller and uses a protected server-side Supabase Admin API operation; the service-role key must not be sent to the browser. Re-authentication or recent-session confirmation should be considered before deletion. Future progress and relationship tables must define their own retention/cascade behavior before F6/F9 data is added. Account deletion and data-retention policy are not implemented by this migration.

## Child privacy and parental consent

CircuitLore targets ages 10–14, including children under 13. Do not enable public child self-registration until the project has resolved applicable COPPA obligations, including whether verifiable parental consent is required before collecting personal information, how consent is recorded/withdrawn, and how parent requests and deletion are handled. Obtain institutional/privacy/legal review; this document is not legal advice. Minimize collection, use adult-created or institution-approved accounts if required, publish a clear privacy notice, establish retention/deletion practices, and use fictional accounts during development. Email and display name are personal information in this context; a display name should not be assumed anonymous.

## Review and application procedure

1. Review the table columns, role lifecycle, cascade behavior, RLS policies, function privileges, and SQL verification plan below.
2. Decide whether account creation should remain closed until adult verification and child-consent procedures are defined.
3. Back up/confirm the target Supabase project and inspect existing `auth.users` data before applying; the migration backfills existing accounts as students and does not promote metadata-requested adults.
4. Apply the migration only through the reviewed Supabase migration workflow after approval. Do not paste service-role credentials into the frontend.
5. Run the verification queries with dedicated test accounts or approved existing test users. Do not use real children's accounts for testing.

## SQL verification plan (not run)

These are manual checks to run only after explicit approval and application of the migration. They do not create users. Replace UUID placeholders with test identities that already exist in the project; never use a real child's account. Run the role-specific checks in separate transactions because an expected permission error aborts its transaction.

### Inspect table RLS, policies, and grants

```sql
SELECT c.relrowsecurity AS rls_enabled
FROM pg_class AS c
WHERE c.oid = 'public.profiles'::regclass;

SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

SELECT
  has_table_privilege('anon', 'public.profiles', 'SELECT') AS anon_can_select,
  has_table_privilege('authenticated', 'public.profiles', 'SELECT') AS authenticated_can_select,
  has_table_privilege('authenticated', 'public.profiles', 'INSERT') AS authenticated_can_insert,
  has_table_privilege('authenticated', 'public.profiles', 'DELETE') AS authenticated_can_delete,
  has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE') AS can_update_display_name,
  has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE') AS can_update_role;
```

Expected: RLS enabled; policies are own-row SELECT and UPDATE only; `anon_can_select`, authenticated INSERT/DELETE, and `can_update_role` are false; authenticated SELECT and `can_update_display_name` are true.

### Verify own-row visibility and update

Use a non-child test identity. In a SQL session that supports Supabase `auth.uid()` claims, replace the UUID and execute:

```sql
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '<TEST_USER_UUID>', true);

SELECT id, display_name, role, created_at, updated_at
FROM public.profiles;
-- Expected: exactly the current test user's row, never another user's row.

UPDATE public.profiles
SET display_name = 'Updated Test Name'
WHERE id = '<TEST_USER_UUID>';
-- Expected: one row updated; updated_at is refreshed.

ROLLBACK;
```

### Verify other-row isolation

Run separately with `TEST_USER_UUID` set to one test user and `OTHER_TEST_USER_UUID` to another existing test user:

```sql
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '<TEST_USER_UUID>', true);

SELECT id FROM public.profiles WHERE id = '<OTHER_TEST_USER_UUID>';
-- Expected: zero rows.

UPDATE public.profiles
SET display_name = 'Should Not Change'
WHERE id = '<OTHER_TEST_USER_UUID>';
-- Expected: zero rows updated.

ROLLBACK;
```

### Verify role escalation is denied

Run this expected-failure check in its own transaction. It should fail with a permission error because authenticated has no UPDATE grant for `role`; if it unexpectedly succeeds, immediately roll back and do not proceed:

```sql
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '<TEST_USER_UUID>', true);
UPDATE public.profiles SET role = 'adult' WHERE id = '<TEST_USER_UUID>';
ROLLBACK;
```

Also verify the database default and constraint in an approved test environment: trusted operator-created test profiles with omitted role default to `student`; an invalid role such as `admin` is rejected. Do not insert test rows into production. The trigger-created profile path should be verified only with an approved test Auth account in a non-production project, since account creation is a side effect.

## Approval required before execution

Please approve the schema and migration as a whole, specifically:

- whether roles remain limited to `student` and `adult` for this phase (proposed: yes; no `admin` role);
- the 80-character display-name limit and fallback value `Student`;
- automatic profile deletion via `ON DELETE CASCADE`;
- allowing trusted `postgres`/server-side `service_role` operations to promote adults while denying client changes;
- the adult verification workflow and child-registration/parental-consent gate;
- the migration backfill that creates student profiles for existing Auth users.

No migration, SQL verification query, user creation, or dashboard change has been executed as part of this proposal.
