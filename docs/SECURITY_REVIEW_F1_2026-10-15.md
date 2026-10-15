# CircuitLore F1 Database Security Review — Changes Summary

**Date**: 2026-10-15  
**Status**: Ready for approval and controlled deployment  
**No changes applied to live Supabase database**

---

## Changes Made

### 1. Migration SQL: Added Missing Function Privilege Revocations

**File**: `supabase/migrations/20261010000000_profiles_security.sql`

**Changes**:
- Added `REVOKE ALL ON FUNCTION public.set_profile_updated_at() FROM PUBLIC, anon, authenticated;` after the function definition (line 43).
- Added `REVOKE ALL ON FUNCTION public.prevent_untrusted_profile_identity_changes() FROM PUBLIC, anon, authenticated;` after the function definition (line 68).

**Why**: These trigger functions execute with elevated privileges but should not be directly callable by unauthenticated or authenticated users. Explicit revocation follows the principle of least privilege. The third function (`create_profile_for_auth_user()`) already had this revocation (now line 100).

**Security impact**: Prevents accidental or malicious direct invocation of internal trigger functions. Reduces attack surface by closing unnecessary function permissions.

---

### 2. New Pre-Migration Checklist Script

**File**: `supabase/migrations/20261010000000_profiles_security_precheck.sql`

**Purpose**: Safe, read-only verification script to identify database conflicts before migration.

**What it checks**:
- Existence of `public.profiles` table
- Existence of the three required functions:
  - `set_profile_updated_at()`
  - `prevent_untrusted_profile_identity_changes()`
  - `create_profile_for_auth_user()`
- Existence of the three required triggers:
  - `profiles_set_updated_at` (on `public.profiles`)
  - `profiles_protect_identity_fields` (on `public.profiles`)
  - `on_auth_user_created_create_profile` (on `auth.users`)

**Output includes**:
- Whether each object exists (yes/no)
- Conflict warnings if any object already exists
- Current table schema (if table exists)
- Current RLS status and policies (if table exists)
- Column-level grants (if table exists)
- Final migration readiness summary

**Safety**: Uses only `SELECT` and catalog queries; contains no `INSERT`, `UPDATE`, `DELETE`, or `CREATE` statements. Wraps entire script in `BEGIN; ... ROLLBACK;` to ensure no changes persist.

**Usage**: Run this against the target Supabase database before applying the main migration to identify any conflicts or existing partial state.

---

### 3. Security Documentation: Expanded Adult Approval Workflow

**File**: `docs/plans/F1-profiles-database-security.md`

**Section**: "Account roles and adult approval plan" (updated)

**Changes**:
- Clarified that **all signups create `student` profiles**, even if user selects "Parent/Teacher".
- Documented the **adult role promotion workflow**:
  1. User requests role after signup (authenticated endpoint)
  2. Institutional staff reviews request outside the application
  3. Staff uses protected server-side workflow to promote role
  4. User re-authenticates to see updated role
- Emphasized that service-role operations must never be exposed in client code.
- Added explicit note that this prevents privilege escalation and self-assignment of adult role.

**Why**: Clarifies the gap between signup selection and actual role assignment. Ensures the constraint that all accounts default to `student` is understood and not bypassed through UI design mistakes.

---

### 4. Security Documentation: Signup Trigger Design and Failure Handling

**File**: `docs/plans/F1-profiles-database-security.md`

**Section**: "Signup trigger design and failure handling" (new)

**Covers**:
- How `create_profile_for_auth_user()` is triggered automatically after auth user creation
- **Idempotent design**: Uses `ON CONFLICT (id) DO NOTHING` to prevent duplicate key errors
- **Safe defaults**: Sanitizes and validates display_name; defaults to `'Student'` if missing/invalid
- **Always creates `student` role**: Explicitly ignores any metadata-based role requests
- **SECURITY DEFINER and permission safety**: How the function executes safely during Auth account creation
- **Potential failure modes**:
  - Metadata validation (handled by defaulting)
  - Constraint violations (causes auth user creation to fail atomically)
  - Database permission failures (causes atomic rollback)
- **Backfill behavior**: How existing Auth users are created as students during migration
- **Testing requirements**: Approved non-production accounts should verify trigger behavior

**Why**: Documents the design decisions around trigger safety and explains why failures roll back the entire auth user creation (correct behavior). Makes explicit what happens when names are invalid.

---

### 5. Functional Requirements: Clarified Signup and Account Deletion

**File**: `docs/plans/F1-authentication-profiles.md`

**Section**: "Sign Up" (updated)

**Changes**:
- Added explicit note: "All accounts are created as `student` role in the database, regardless of selection."
- Explained that adult role requires a separate approval workflow
- Added new section "Adult Role Approval Workflow" describing the complete flow

**Why**: The original text said "user selects Student, Parent/Teacher" without explaining that the selection does not immediately grant the role. This update clarifies the workflow for developers.

---

**Section**: "Database" (updated)

**Changes**:
- Documented all columns and their constraints
- Explained that role defaults to `student` and uses database-level privilege escalation checks
- Added note that role changes happen through server-side approval, not client API

**Section**: "Delete" (expanded to "Account Deletion Workflow")

**Changes**:
- Added detailed account deletion workflow:
  1. User initiates deletion via authenticated endpoint
  2. Application verifies identity (re-auth, OTP, or recent session)
  3. Server-side Admin API uses protected key to delete auth account
  4. Database cascade removes profile row
  5. Associated data follows own retention policy

**Why**: Original text just said "Delete the user's account/profile" without explaining the security requirements. The updated version clarifies that deletion requires identity verification and protected server-side operations.

---

## Security Assessment

### ✓ Six Concerns Addressed

| Concern | Status | Solution |
|---------|--------|----------|
| Migration could fail if objects exist | **RESOLVED** | Pre-migration checklist script identifies conflicts before deployment |
| Two trigger functions missing REVOKE | **RESOLVED** | Added explicit `REVOKE ALL` for both `set_profile_updated_at()` and `prevent_untrusted_profile_identity_changes()` |
| Account deletion requires secure workflow | **DOCUMENTED** | Added detailed account deletion workflow section; explained server-side Admin API requirement |
| Parent/Teacher signup creates student account | **DOCUMENTED** | Clarified all signups create `student` role; explained adult approval workflow |
| Adult role changes must be protected | **VERIFIED & DOCUMENTED** | Confirmed column grants and trigger checks prevent escalation; added documentation |
| Signup trigger failures need handling | **DOCUMENTED** | Added comprehensive trigger design section covering idempotency, failure modes, and atomic rollback behavior |

### Security Strengths Verified

✓ **Principle of Least Privilege**: 
- All trigger functions have explicit REVOKE statements
- `authenticated` users cannot INSERT, DELETE, or modify `role`/`id`/`created_at` columns
- Display name is the only user-editable column

✓ **Secure Defaults**:
- All profiles default to `student` role (database-enforced, not client-trusted)
- Display names are sanitized; invalid names default to `'Student'`
- Signup metadata is never trusted for role assignment

✓ **Privilege Escalation Protection**:
- `prevent_untrusted_profile_identity_changes()` trigger prevents role modification by non-privileged users
- Column-level grants reinforce this; `authenticated` has no UPDATE on `role`
- Only `postgres` and `service_role` can promote adults (server-side only)

✓ **Atomic Operations**:
- Auth user creation and profile creation are transactional
- If trigger fails, entire auth user creation fails (safe default)
- Uses `ON CONFLICT (id) DO NOTHING` for idempotent backfill

✓ **Row-Level Security**:
- RLS enabled on `public.profiles`
- Users can SELECT and UPDATE only their own row
- Policies use `auth.uid()` for ownership checks

✓ **Data Integrity**:
- Foreign key `ON DELETE CASCADE` ensures profile cleanup when auth user deleted
- CHECK constraints validate display_name length and role values
- Trigger maintains `updated_at` timestamp automatically

### Known Limitations (Design by Intention)

⚠ **Adult Role Assignment is Manual**:
- No automatic promotion based on metadata or form selection
- Requires institutional staff review and server-side workflow
- This is intentional to prevent self-assignment and verify identity

⚠ **Account Deletion Not Yet Implemented**:
- Migration provides database-level cascade delete
- Application-level deletion workflow (re-auth, identity verification, audit logging) must be implemented in F2 or later

⚠ **Child Privacy/COPPA Not Addressed**:
- This migration does not implement parental consent or COPPA compliance
- Documentation recommends institutional review before public child registration

---

## What Still Needs Implementation

### Before F1 is Production-Ready

1. **Adult approval workflow** (application layer):
   - Authenticated endpoint to request adult role
   - Admin interface to review and approve requests
   - Protected server-side API call to promote role (using Admin API, not exposed to client)

2. **Account deletion workflow** (application layer):
   - Authenticated endpoint to initiate deletion
   - Identity verification (re-authentication, OTP, or time-based)
   - Protected server-side Supabase Admin API call to delete auth account
   - Audit logging of deletion events

3. **Profile update error handling** (application layer):
   - Handle display_name validation errors from CHECK constraint
   - Handle permission errors if trigger fails
   - Clear user-facing error messages

4. **Testing**:
   - Run pre-migration checklist on target Supabase project
   - Verify RLS policies with test accounts (own-row SELECT/UPDATE succeeds, other-row fails)
   - Verify role escalation attempt fails
   - Test signup trigger with valid/invalid display names
   - Test backfill behavior if existing users exist

5. **Child privacy/COPPA review**:
   - Obtain institutional/legal review of privacy practices
   - Define parental consent requirements
   - Define data retention and deletion policies
   - Update privacy notice

### Deployment Checklist

Before applying this migration to any Supabase project:

- [ ] Run `20261010000000_profiles_security_precheck.sql` to identify conflicts
- [ ] Review output; confirm no existing tables/functions/triggers conflict
- [ ] Back up the target Supabase project
- [ ] Confirm no critical Auth users exist that should not be backfilled
- [ ] Apply `20261010000000_profiles_security.sql` through Supabase migration system
- [ ] Run manual verification queries from security plan (own-row access, other-row isolation, role escalation denial)
- [ ] Verify existing Auth users were backfilled as students
- [ ] Confirm no production impact; no users/accounts created
- [ ] Proceed to F2 implementation (adult approval, account deletion, UI)

---

## Files Changed

| File | Changes |
|------|---------|
| `supabase/migrations/20261010000000_profiles_security.sql` | Added 2 REVOKE statements (lines 43, 68) |
| `supabase/migrations/20261010000000_profiles_security_precheck.sql` | **NEW** — Pre-migration conflict detection script |
| `docs/plans/F1-profiles-database-security.md` | Updated adult approval workflow, added signup trigger design section, updated review procedure |
| `docs/plans/F1-authentication-profiles.md` | Clarified signup process, added adult approval workflow, expanded account deletion workflow, documented database constraints |

---

## No SQL Applied to Live Database

✓ No changes made to any Supabase project  
✓ No accounts created  
✓ No deployments  
✓ No commits  
✓ No pushes  

All changes are local review and documentation updates, ready for controlled deployment after approval.
