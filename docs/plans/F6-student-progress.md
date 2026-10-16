# F6 — Student Progress

**Status: Schema applied to the live Supabase project. `progressService.js` is connected to the history-001 lesson (`LessonPage` and `LessonSession`). The start, quiz, and completion saves have been browser-tested against the live project, and the Learning Journey shows a Completed badge from the saved record. The compare-and-set conflict path is covered only by unit tests with a mocked client.**

## Purpose

CircuitLore needs to remember what each student has completed so they can leave the application, return later, and continue their learning journey.

This feature handles saved lesson progress, completion tracking, overall progress calculation, and the foundation for future activity and quiz tracking.

It will also provide an important part of CircuitLore's full CRUD functionality.

---

## Main Goals

The progress system should allow CircuitLore to:

- Save which lessons each student has completed
- Track when lessons were completed
- Save the number of attempts (for restart counting)
- Store lesson-specific metadata (quiz scores, time spent, circuit attempts)
- Show overall progress as a percentage
- Unlock appropriate content based on completed lessons
- Let students continue where they stopped
- Allow students to restart and complete lessons again
- Support full CRUD operations (Create, Read, Update, Delete)

---

## Student Progress Record

Each student's progress is connected to their user account. The `public.lesson_progress` table in Supabase tracks this.

### Database Schema: `public.lesson_progress`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Unique progress record ID |
| `student_id` | uuid | Foreign key to `public.profiles(id)` |
| `lesson_id` | text | Stable lesson identifier (e.g., `history-001`) |
| `status` | text | One of: `not_started`, `in_progress`, `completed` |
| `completed_at` | timestamptz | When the lesson was finished (null if not completed) |
| `last_accessed_at` | timestamptz | Last time student opened this lesson |
| `attempts_count` | integer | Number of attempts started. Starts at 1 on the first real start and increments when a new attempt begins (see Attempt Counting). Not reset by restarts. |
| `metadata` | jsonb | Flexible storage for lesson-specific data (quiz scores, time spent, etc.) |
| `created_at` | timestamptz | When progress record was created |
| `updated_at` | timestamptz | Last update timestamp |

**Unique constraint**: One progress record per student per lesson (`student_id`, `lesson_id`)

**Cascade delete**: If a student's account is deleted, all their progress is automatically removed

### Progress States

Each lesson has three states:

- **`not_started`** — Student hasn't opened this lesson yet
- **`in_progress`** — Student started but hasn't completed
- **`completed`** — Student finished the lesson

When a student restarts a lesson, it returns to `not_started`. The row and `attempts_count` are kept, and the next save starts a new attempt.

---

## Lesson Progress

Each lesson in the learning journey has a progress record for every student.

### Progress Lifecycle

```
not_started → in_progress → completed
    ↓                             ↓
  (student            (student clicks
   opens lesson)      "Mark Complete")

completed → in_progress
    ↓
(student restarts)
```

### Saving Progress

When a student starts a lesson, reaches the end, or clicks "Mark Complete," the application calls `saveProgress(lessonId, status, metadata?)`. Internally it:

1. Reads the student's existing row for that lesson, if there is one
2. Inserts a row if none exists; otherwise updates the row with a compare-and-set (see Concurrency and Atomicity)
3. Sets `completed_at` when the status becomes `completed`, keeps the original value on later completed saves, and clears it on restart
4. Increments `attempts_count` only when a new attempt starts (see Attempt Counting)
5. Sets `last_accessed_at` on every save; the database trigger maintains `updated_at`
6. Writes `metadata` only when it is passed. Omitting it leaves stored metadata unchanged. Passing an object replaces the stored metadata entirely; there is no merge.

Completed lessons remain available for review. Students can restart and complete them again.

### Attempt Counting

| Stored state | Save with | Increments? |
|---|---|---|
| No row | `in_progress` or `completed` | Yes (first attempt, count = 1) |
| No row | `not_started` | No (row is created with count 0) |
| `not_started` | `in_progress` or `completed` | Yes |
| `in_progress` | any status | No |
| `completed` | `in_progress` (restart) | Yes |
| `completed` | `completed` | No |
| any | `not_started` | No |

### Concurrency and Atomicity

`saveProgress()` is not a single atomic database statement. It reads the row, then writes with a compare-and-set:

- The update filters on `student_id`, `lesson_id`, and the `status` and `attempts_count` that were read. If another save changed either value in between, the update matches zero rows. That is treated as a conflict: the row is re-read and the save is retried, up to 3 times. After that it fails with "record changed during save, please retry."
- If two first saves race to insert, the loser gets unique violation `23505` on `(student_id, lesson_id)` and retries as an update.
- Concurrent saves do not lose an increment, because each successful write counts from the value it read. The increment is not a single `attempts_count = attempts_count + 1` expression. That would need a database function (RPC) and a migration, which are not implemented.
- `status` and `attempts_count` are `NOT NULL`, so `.eq()` is a correct filter on them. A nullable filter column would need `.is()`, since `.eq(column, null)` matches nothing.
- Update payloads never include `student_id` or `lesson_id`. The `authenticated` role has no UPDATE privilege on those columns, and a PostgREST upsert would put them in the `SET` list and fail. The app does not use upsert.
- `resetProgress()` and `resetAllProgress()` are unconditional updates. A save running at the same moment as a reset may land after it.
- These paths are covered by unit tests with a mocked Supabase client. The conflict-retry path has not been run against the live database. The basic save and completion path has been (see status above).

### Progress API

The application provides these operations via Supabase client:

**Save/Update Progress**
```javascript
saveProgress(lessonId, status, metadata?)
// Inserts or updates the lesson_progress row (see Saving Progress)
// metadata is optional: omitted keeps stored metadata; supplied replaces it
// Returns: saved progress object
```

**Get All Student Progress**
```javascript
getProgress()
// SELECT all progress records for current student
// Returns: array of progress objects
```

**Get Single Lesson Progress**
```javascript
getLessonProgress(lessonId)
// SELECT one progress record
// Returns: progress object or null
```

**Calculate Overall Progress**
```javascript
getProgressSummary()
// COUNT completed lessons / total lessons
// Returns: { completed, total, percentage }
```

**Restart Lesson**
```javascript
resetProgress(lessonId)
// Sets status to not_started; clears completed_at and metadata; keeps the row and attempts_count
// Returns: confirmation
```

**Restart All Lessons**
```javascript
resetAllProgress()
// Applies the same reset to every lesson for the student; keeps attempts_count
// Returns: confirmation
```

**Permanently Delete All Progress** (account deletion and privacy requests only)
```javascript
permanentlyDeleteAllProgress()
// DELETE every lesson_progress row for the student, including attempt history
// Not a student restart action; not exposed in student UI
// Returns: confirmation
```

Each operation is protected by Row Level Security (RLS); students can only access their own progress.

---

## Activity Progress

Future lessons may include interactive activities (simulations, experiments, etc.).

For now, activities are not tracked separately. Activity completion will be recorded in the lesson's `metadata` field and can be expanded later when activities are implemented.

Initial design supports storing activity metadata for future use.

---

## Quiz Progress

Future lessons will include quizzes and interactive activities.

F6 provides the metadata storage structure; actual quiz logic will be implemented later.

Quiz results can be saved in the `metadata` field:

```javascript
{
  "quiz_score": 85,
  "quiz_attempts": 2,
  "best_score": 95,
  "completion_date": "2026-10-15T14:30:00Z"
}
```

This design allows quizzes to be added without changing the database schema.

---

## Circuit Challenge Progress

Future lessons will include circuit-building challenges (part of F7 Virtual Circuit Lab).

For now, circuit challenges are not implemented.

F6 provides the foundation to track challenge completion in metadata:

```javascript
{
  "circuit_challenge_status": "completed",
  "circuit_attempts": 3,
  "circuit_completed_date": "2026-10-15T14:30:00Z"
}
```

Circuit challenge tracking will be implemented when F7 is built.

---

## Continue Your Journey

When a student logs in, the application uses saved progress to determine the best place to continue.

**Decision logic**:
1. Find the highest `order` lesson with `status = 'completed'`
2. Recommend the next lesson (`order + 1`) if not locked
3. If no lessons completed, start with `history-001`
4. If all lessons completed, show "You've completed the journey!"

The student dashboard displays:

```
Welcome back, [Name]!
You've completed 8 of 23 lessons (35%)

Continue Your Journey →
Next: Lesson X - [Lesson Title]
```

Clicking "Continue Your Journey" opens the recommended next lesson.

---

## Overall Progress

Students can see a simple representation of their progress as a percentage.

**Progress Calculation**:
```
progress_percent = (completed_lessons / total_lessons) * 100
```

Example display:
```
Journey Progress: 8/23 lessons (35%)

████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 16%
```

The percentage is based on all required lessons in the curriculum.

Later versions may support weighted lessons or optional sections, but the initial design uses equal weight for all lessons.

---

## Unlocking Content

Initially, all lessons are available (no locking). Once F2 Learning Journey is complete, this will be implemented.

**Future locking logic**:
- Student must complete lesson A to unlock lesson B
- Defined by `requiredToUnlockNext` flag in lesson definitions
- Checked before displaying lesson content

For now, F6 simply tracks progress; unlocking will be implemented in a future update.

---

## CRUD Functionality

F6 provides full CRUD (Create, Read, Update, Delete) operations on student progress.

### Create

**When**: Student starts a lesson or completes one for the first time

**Operation**: `saveProgress()` inserts a row when none exists (see Saving Progress). The app never writes `id`, `created_at`, or `updated_at`.

**Result**: Progress record created with `attempts_count` 1 (or 0 for `not_started`)

### Read

**When**: Student views progress (dashboard, lesson page)

**Operations**:
- Get all progress: `SELECT * FROM lesson_progress WHERE student_id = auth.uid()`
- Get one lesson: `SELECT * FROM lesson_progress WHERE student_id = auth.uid() AND lesson_id = $1`
- Get summary: `SELECT status, COUNT(*) FROM lesson_progress WHERE student_id = auth.uid() GROUP BY status`

**Result**: Student sees their completion status and overall percentage

### Update

**When**: Student completes a lesson, restarts it, or returns to it

**Operation**: `saveProgress()` updates the existing row with the compare-and-set described above. The app sends only `status`, `completed_at`, `last_accessed_at`, `attempts_count`, and `metadata` when it is supplied.

**Result**: Lesson status and timestamps updated; `attempts_count` increases only for a new attempt

### Delete

**When**: Account deletion or a privacy request. Students never delete progress through a restart action.

**Operation**: `permanentlyDeleteAllProgress()` deletes all of the student's rows. The app has no per-lesson delete.

```sql
DELETE FROM public.lesson_progress
WHERE student_id = auth.uid()
```

**Result**: All progress and attempt history removed. Deleting the account also removes these rows through `ON DELETE CASCADE`.

---

## Reset and Deletion

Restarting and deleting are different operations. Restarts keep attempt history; only permanent deletion removes it.

### Restart a Lesson: `resetProgress(lessonId)`

Student clicks "Restart Lesson" on a completed lesson.

```sql
UPDATE public.lesson_progress
SET status = 'not_started', completed_at = NULL, metadata = '{}'
WHERE student_id = auth.uid() AND lesson_id = $1
```

The row is kept, so `attempts_count` survives. The next save as `in_progress` counts as a new attempt. If the student has no row for the lesson, the update matches zero rows and the call still succeeds.

**Confirmation**: "Are you sure? You can always start this lesson again later." (no warning for single lessons)

### Restart the Whole Journey: `resetAllProgress()`

Student clicks "Start Over" on the dashboard.

```sql
UPDATE public.lesson_progress
SET status = 'not_started', completed_at = NULL, metadata = '{}'
WHERE student_id = auth.uid()
```

Every lesson returns to `not_started`, and its completion time and metadata are cleared. Rows and `attempts_count` are kept.

**Confirmation**: "Start your learning journey over? Completed lessons will be marked not started. Your attempt history is kept."

### Permanently Delete Progress: `permanentlyDeleteAllProgress()`

Reserved for account deletion and privacy requests, such as a future "delete my data" control. It is not a student restart action and is not exposed in the student UI.

```sql
DELETE FROM public.lesson_progress
WHERE student_id = auth.uid()
```

Removes every row and the attempt history.

The RLS DELETE policy lets any authenticated user delete their own rows. Keeping this function off student-facing screens is an application rule, not a database restriction.

---

## Data Ownership and Security

### Row Level Security (RLS)

All progress records are protected by RLS policies in Supabase. Students can only access their own progress.

**Policy 1: Select own progress**
```sql
CREATE POLICY lesson_progress_select_own ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());
```

**Policy 2: Update own progress**
```sql
CREATE POLICY lesson_progress_update_own ON public.lesson_progress
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());
```

**Policy 3: Insert own progress**
```sql
CREATE POLICY lesson_progress_insert_own ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
```

**Policy 4: Delete own progress**
```sql
CREATE POLICY lesson_progress_delete_own ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (student_id = auth.uid());
```

### Column-Level Grants

```sql
REVOKE ALL ON TABLE public.lesson_progress FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.lesson_progress TO authenticated;
GRANT INSERT (student_id, lesson_id, status, completed_at, last_accessed_at, attempts_count, metadata)
  ON TABLE public.lesson_progress TO authenticated;
GRANT UPDATE (status, completed_at, last_accessed_at, attempts_count, metadata)
  ON TABLE public.lesson_progress TO authenticated;
```

**Effect**: There is no table-level INSERT or UPDATE, so writes are limited to the listed columns. Clients cannot write `id`, `created_at`, or `updated_at`; the trigger sets `updated_at`. `student_id` and `lesson_id` cannot be changed by UPDATE.

### Protection

- Student cannot view other students' progress: SELECT, UPDATE, and DELETE filter to zero rows
- Student cannot update another student's progress: the row is not matched, so zero rows are updated
- Student cannot insert or move a row to another student's `student_id`: the WITH CHECK fails (403)
- If account is deleted, all related progress is automatically deleted (cascade)

**Result**: Each student's progress is completely private and protected.

---

## Progress Dashboard

The student dashboard displays progress in a simple, focused way.

Example design:

```
Welcome Back, Sarah!
───────────────────────────────────────

Journey Progress
████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 
8 of 23 lessons completed (35%)

Last Completed: Electricity Mysteries (Oct 15)

Continue Your Journey →
Next: Benjamin Franklin's Discovery

[View All Progress] [Settings]
```

The dashboard focuses on getting the student back into learning quickly.

---

## Error Handling

F6 must handle errors gracefully and inform the student clearly.

### Errors to Handle

**Cannot load progress**
- Message: "We couldn't load your progress. Please refresh the page."
- Action: Retry with exponential backoff

**Cannot save progress**
- Message: "Your progress didn't save. Trying again..."
- Action: Retry; if fails, "Your progress may not have been saved. Try again or contact support."
- Note: Don't silently lose work

**Permission denied**
- Message: "You don't have permission to access this."
- Cause: RLS policy preventing access
- Action: Log error; check authentication

**Database connection error**
- Message: "Server connection lost. Please check your internet."
- Action: Retry when connection restored

**Invalid data**
- Message: "Invalid lesson ID. Contact support if this persists."
- Cause: Typo in lesson_id or data corruption
- Action: Log error; don't create invalid progress records

---

## Database Relationships

The progress system connects student accounts to lessons.

```
auth.users
    ↓
public.profiles
    ↓
public.lesson_progress
    ↓
lessons (stored in React initially, added to DB in F12)
```

**Key relationships**:
- One student has many progress records
- One lesson has many progress records (one per student)
- Progress record is unique on (student_id, lesson_id)
- When student deleted, all progress deleted (cascade)

---

## Parent/Teacher Access

F9 Parent/Teacher Dashboard will use student progress information.

Adults may eventually be able to view:

- Overall progress
- Completed lessons
- Quiz results (when added)
- Completed challenges (when added)
- Areas needing additional practice

F6 stores and manages the progress.

F9 will implement read-only RLS policies for adults to view authorized student progress.

---

## Privacy

Student progress should be treated as private information.

CircuitLore should:

- Require authentication
- Restrict progress to the correct user
- Avoid public student progress pages
- Store only information needed by the application
- Avoid unnecessary personal information

---

## Error Handling

The application should handle:

- Progress fails to load
- Progress fails to save
- Missing progress record
- Duplicate progress record
- Invalid lesson or challenge
- Network failure
- Database failure

If progress fails to save, the student should be informed.

The application should not tell the student something was saved if it was not.

---

## Acceptance Criteria

F6 will be considered complete when:

1. Progress is connected to the correct student account.
2. Lesson completion can be saved.
3. Activity completion can be saved where appropriate.
4. Quiz results can be saved.
5. Circuit challenge completion can be saved.
6. Saved progress can be retrieved after the student logs in again.
7. Progress can be updated as the student continues.
8. Appropriate progress can be reset or deleted.
9. Overall progress can be calculated.
10. The student's next learning location can be determined.
11. Locked content can use saved progress.
12. Students cannot access another student's private progress.
13. Database failures are handled clearly.
14. CRUD operations can be demonstrated.

---

## Testing

F6 requires testing at multiple levels to ensure progress is saved correctly and protected.

### Unit Tests

Test progress service functions in isolation:

- `saveProgress()` handles valid inputs correctly, counts attempts only for new attempts, and keeps stored metadata when metadata is omitted
- `getProgress()` returns correct student data only
- `getProgressSummary()` calculates percentage correctly
- `resetProgress()` and `resetAllProgress()` restart lessons and keep `attempts_count`
- `permanentlyDeleteAllProgress()` deletes all rows for the student
- Concurrency: conflicting updates are retried; repeated conflicts fail with a clear error
- Error handling shows appropriate messages
- Retry logic backs off correctly

### Integration Tests

Test with real Supabase database (or local instance):

1. **Create**: Insert new progress record, verify row exists with correct values
2. **Read**: Query progress, verify only current student's data returned
3. **Update**: Update lesson status, verify only changed fields updated
4. **Delete**: `permanentlyDeleteAllProgress()` removes the rows; `resetProgress()` keeps the row and `attempts_count`
5. **RLS Protection**: Query another student's progress and verify zero rows; attempt an INSERT or UPDATE with another student's `student_id` and verify it is rejected
6. **Cascade Delete**: Delete auth user, verify all related progress deleted
7. **Unique Constraint**: Try to insert duplicate (student, lesson), verify handled correctly
8. **Timestamp**: Verify `created_at` and `updated_at` set correctly
9. **Metadata**: Save and retrieve JSONB metadata correctly

### Manual QA Tests

- New student: No progress exists initially
- First lesson: Complete a lesson, verify progress saved and persistent
- Multiple lessons: Complete several, verify all tracked correctly
- Logout/login: Verify progress still there
- Progress percentage: Correct calculation (8/50 = 16%)
- Dashboard: Shows correct next lesson
- Reset: Clear progress, can retake lesson
- Restart: Complete lesson, restart it, redo it
- Performance: Dashboard loads within 1 second
- Error: Network failure, show graceful error

### Test Checklist

```
✓ Student creates account with no progress
✓ Student completes first lesson, progress saved
✓ Student completes multiple lessons
✓ Progress persists after logout/login
✓ Progress percentage calculated correctly
✓ Student cannot view other student's progress (zero rows returned)
✓ Student cannot update other student's progress (zero rows updated)
✓ Progress deleted when account deleted (cascade)
✓ Lesson can be restarted after completion
✓ Metadata (quiz_score, etc.) saved correctly
✓ API error handling: clear user message
✓ Database error handling: retry or show error
✓ RLS policy prevents direct table access
✓ Column-level grants prevent student_id override
✓ Dashboard loads with correct summary stats
✓ Performance: <1s load time
```

---

## Dependencies

F6 depends on:

- **F1 Authentication and User Profiles** ✓ (Complete) — Provides `auth.uid()` and `public.profiles`
- **F2 Learning Journey** — Defines lesson IDs and curriculum structure
- **Supabase JavaScript client** ✓ (Installed) — For database access

F6 enables:

- **F9 Parent/Teacher Dashboard** — Reads student progress
- **F2 Learning Journey** — Uses progress to determine next lesson
- **F5 Interactive Activities** — Stores quiz results in progress metadata
- **F7 Virtual Circuit Lab** — Tracks circuit challenge attempts

### Minimal Implementation

To test F6 independently, you only need:
1. F1 (auth + profiles) ✓
2. Hardcoded lesson list in React
3. F6 database schema and RLS
4. Progress service functions
5. Basic save/load in dashboard

---

## Out of Scope for F6

F6 does not handle:

- Authentication itself (that's F1)
- Lesson content (that's F3, F4, F5)
- Quiz question logic (that's F5)
- Circuit simulation (that's F7, F8)
- AI tutoring (that's F10)
- Historical animations (that's F11)
- Lesson unlocking rules (that's F2 Learning Journey)
- Content management (that's F12)

F6 is the data layer for progress tracking. Other features use this data.

---

## Implementation Timeline

### Phase 1: Database Schema (1 week)

1. Create migration `20261020000000_lesson_progress_schema.sql`
2. Define `lesson_progress` table with RLS policies
3. Write pre-check script to detect conflicts
4. Test on dev Supabase project

### Phase 2: Progress Service (1 week)

1. Create `progressService.js` with CRUD functions
2. Add error handling and retry logic
3. Test with unit and integration tests

### Phase 3: React Integration (1-2 weeks)

1. Create `useProgress()` hook
2. Update StudentDashboard to show progress
3. Add "Mark Complete" button to lessons
4. Add progress display and percentage
5. Test end-to-end with first lesson

### Phase 4: Testing & Validation (1 week)

1. Unit tests for service functions
2. Integration tests against Supabase
3. RLS isolation tests
4. Manual QA tests

### Phase 5: Deployment (1 week)

1. Apply migration to production
2. Deploy React application
3. Monitor for errors
4. Gather feedback

---

## Acceptance Criteria

F6 will be considered complete when:

1. `lesson_progress` table created with correct schema
2. RLS policies enforce student-only access to own progress
3. Students can save lesson progress via API
4. Students can retrieve their saved progress
5. Progress persists after logout/login
6. Progress can be updated when lesson status changes
7. Progress can be restarted by the student. Permanent deletion is available for account and privacy requests.
8. Overall progress percentage calculates correctly
9. Students cannot access other students' progress (zero rows on read/update; 403 on insert/update with another student's ID)
10. Error handling shows clear messages to users
11. Tests verify CRUD operations and RLS
12. Dashboard displays current progress and next lesson
13. Lesson pages show "Mark Complete" button
14. Performance: Dashboard loads within 1 second

---

## Definition of Done

F6 is done when CircuitLore can reliably create, read, update, and delete appropriate student learning progress.

A student should be able to complete learning content, log out, return later, and continue from the correct place without losing their progress.

The progress system should work end-to-end from lesson completion through dashboard display, with all CRUD operations tested.

---

## First Test Lesson: history-001

To verify F6 works end-to-end, build and test this first lesson:

### Lesson Definition

```javascript
{
  id: "history-001",
  title: "Electricity Mysteries",
  stage: 1,
  category: "history",
  order: 1,
  description: "Early observations of electricity",
  requiredToUnlockNext: true,
  estimatedMinutes: 5
}
```

### Minimal Content

A simple page with:

1. **Header**: "Electricity Mysteries"
2. **Body Text**: 
   ```
   For thousands of years, people observed strange electrical phenomena.
   Amber rubbed with fur attracted light objects.
   Lightning struck from the sky.
   
   Yet nobody understood electricity.
   
   Let's explore these mysteries together.
   ```
3. **Button**: "Mark as Complete"
4. **Status Display** (shown after completion):
   ```
   ✓ Completed on Oct 15, 2026 at 2:30 PM
   
   [Restart Lesson] [Next Lesson →]
   ```

### Implementation Steps for Testing F6

1. **Add lesson definition** to React constants
2. **Create lesson page** (ElectricityLessons → history-001)
3. **Add "Mark Complete" button** that calls `saveProgress("history-001", "completed")`
4. **Display progress** on StudentDashboard
5. **Test flow**:
   - New student: no progress, see "Start" button
   - Click "Mark Complete": progress saved
   - Logout/login: progress persists
   - Dashboard shows: "1/23 lessons (4%)" and "Continue → History-001"
   - Click "Restart": lesson returns to not started; attempt count is kept
   - Retry lesson: can complete again

### Why This Lesson is Good for Testing

- **Minimal content**: No external dependencies or complexity
- **Tests full F6 flow**: Create → Read → Update → Delete operations
- **No dependencies**: Doesn't need F3, F4, F5 implemented
- **Quick to build**: ~30 minutes including testing
- **Proves concept**: Once this works, other lessons follow the same pattern