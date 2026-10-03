# F6 — Student Progress

## Purpose

CircuitLore needs to remember what each student has completed so they can leave the application, return later, and continue their learning journey.

This feature handles saved lesson progress, activities, quizzes, circuit challenges, completion status, and overall progress.

It will also provide an important part of CircuitLore's full CRUD functionality.

---

## Main Goals

The progress system should allow CircuitLore to:

- Know where a student is in the learning journey
- Save completed lessons
- Save completed activities
- Save quiz results
- Save circuit challenge completion
- Show overall progress
- Unlock appropriate content
- Let students continue where they stopped
- Allow appropriate progress to be updated or reset

---

## Student Progress Record

Each student's progress should be connected to their user account.

Possible information may include:

- Student ID
- Lesson ID
- Completion status
- Completion date
- Quiz score
- Number of attempts
- Challenge completion
- Last activity
- Updated date

The exact database structure will be determined during database design.

---

## Lesson Progress

CircuitLore should know whether a lesson is:

- Locked
- Available
- In progress
- Completed

When a student completes a lesson, the application should save that completion.

Completed lessons should remain available for review.

---

## Activity Progress

Important learning activities may also be saved.

CircuitLore may record:

- Activity completed
- Attempts
- Result
- Completion date

Not every small click or interaction needs to be stored.

Only information that is useful for learning progress should be saved.

---

## Quiz Progress

Quiz information may include:

- Quiz ID
- Student ID
- Score
- Number of attempts
- Completion status
- Best score if needed
- Most recent score if needed
- Completion date

Students should be able to retry quizzes where appropriate.

---

## Circuit Challenge Progress

CircuitLore should save whether required circuit challenges have been completed.

Possible information:

- Challenge ID
- Student ID
- Completion status
- Number of attempts
- Completion date

The application does not necessarily need to save every circuit the student creates.

Saving individual circuits may be added later if it provides enough educational value.

---

## Continue Your Journey

When a student returns to CircuitLore, the application should determine the most appropriate place for them to continue.

The student dashboard should provide a clear:

**Continue Your Journey**

option.

This should use the student's saved progress to return them to the next appropriate lesson or activity.

---

## Overall Progress

Students should be able to see a simple representation of how far they have progressed.

Possible displays include:

- Progress bar
- Percentage
- Completed stages
- Journey map

Example:

**Journey Progress: 45%**

The calculation should be based on required learning content rather than optional activities.

---

## Unlocking Content

Progress will help determine which lessons or stages are available.

Example:

Lesson 1 completed
↓
Activity completed
↓
Lesson 2 unlocked

The exact unlocking rules will be defined with F2 Learning Journey.

---

## CRUD Functionality

Student progress will provide clear CRUD operations.

### Create

When a student begins or completes learning content, a progress record can be created.

### Read

CircuitLore can retrieve the student's saved progress.

Examples:

- Current lesson
- Completed lessons
- Quiz results
- Challenge completion

### Update

Progress records can be updated when the student:

- Completes a lesson
- Retakes a quiz
- Improves a score
- Completes a challenge
- Moves forward in the journey

### Delete

Appropriate progress information can be deleted or reset.

For example, a student may be allowed to reset certain learning progress.

Deleting an account should also handle the student's related progress appropriately.

---

## Reset Progress

Students may be given an option to reset learning progress.

Because this could remove a large amount of saved information, CircuitLore should require confirmation.

Example:

**Reset your learning journey?**

This will remove your saved lesson progress and results. This action cannot be easily undone.

The exact reset behavior will be decided during implementation.

---

## Data Ownership

Students should only be able to access their own private progress information.

An authenticated student should not be able to change a URL or request and retrieve another student's progress.

Adults may later receive limited access to appropriate student progress through F9.

---

## Progress Dashboard

The student dashboard may display:

- Current stage
- Current lesson
- Overall progress
- Recently completed lesson
- Quiz progress
- Circuit challenges completed
- Continue Your Journey button

The dashboard should stay simple and easy to understand.

---

## Progress Feedback

Completing an important section should provide clear feedback.

Examples:

- Lesson Complete
- New Discovery Unlocked
- Challenge Complete
- Next Stage Unlocked

Feedback can include animation but should not depend entirely on animation.

---

## Database Relationships

The progress system will likely connect several types of data.

Possible relationships include:

Student
↓
Lesson Progress

Student
↓
Quiz Attempts

Student
↓
Challenge Progress

Student
↓
Learning Journey

The final structure will be designed after Supabase research and database planning.

---

## Parent/Teacher Access

F9 Parent/Teacher Dashboard will use student progress information.

Adults may eventually be able to view:

- Overall progress
- Completed lessons
- Quiz results
- Completed challenges
- Areas needing additional practice

F6 stores and manages the progress.

F9 determines how adults see it.

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

Test:

- New student with no progress
- First lesson completion
- Multiple lesson completions
- Quiz result saving
- Quiz retry
- Circuit challenge completion
- Progress update
- Log out and return
- Continue Your Journey
- Progress percentage
- Reset progress
- Failed progress save
- Failed progress load
- Unauthorized progress request
- Account deletion and related progress

---

## Dependencies

F6 depends on:

- F1 Authentication and User Profiles
- F2 Learning Journey
- F4 Electricity Lessons
- F5 Interactive Activities and Quizzes

It will also connect with:

- F7 Virtual Circuit Lab
- F8 Circuit Logic and Feedback
- F9 Parent/Teacher Dashboard

---

## Out of Scope for F6

F6 does not handle:

- Authentication itself
- Lesson content
- Quiz question logic
- Circuit simulation
- AI tutoring
- Historical animations

Those belong to other features.

---

## Definition of Done

F6 is done when CircuitLore can reliably create, read, update, and delete appropriate student learning progress.

A student should be able to complete learning content, log out, return later, and continue from the correct place without losing their progress.

The progress system should also provide the information needed for lesson unlocking, the student dashboard, and the future parent/teacher dashboard.