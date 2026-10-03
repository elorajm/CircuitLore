# F9 — Parent/Teacher Dashboard

## Purpose

The Parent/Teacher Dashboard allows an approved adult to view a student's learning progress in CircuitLore.

The goal is to give parents or teachers a simple overview of what the student has completed, how they are doing on activities and quizzes, and which areas may need more practice.

Adults should only be able to view students they have been properly connected to.

---

## Main Goals

The dashboard should allow an adult to:

- Log in to their own account
- Connect to an appropriate student
- View student progress
- View completed lessons
- View quiz results
- View completed circuit challenges
- See overall progress
- Identify areas that may need more practice

The dashboard should remain simple and easy to understand.

---

## Adult Account

Adult authentication will be handled by F1.

The application should recognize that the logged-in user has the `adult` role and direct them to the appropriate dashboard.

Adults should not use a student's login information to view progress.

---

## Connecting an Adult to a Student

CircuitLore needs a safe way to connect an adult account to a student account.

The final method will be determined during implementation.

One possible approach is a student connection code.

Example:

1. Student opens their profile.
2. CircuitLore generates a temporary connection code.
3. Student gives the code to their parent or teacher.
4. Adult enters the code.
5. CircuitLore creates an approved connection between the two accounts.

The code should expire or become unusable after an appropriate amount of time.

The system should not allow an adult to search through all student accounts.

---

## Adult-Student Relationship

The database may need a relationship such as:

- Relationship ID
- Adult user ID
- Student user ID
- Relationship type
- Created date
- Status

Possible relationship types may include:

- Parent/Guardian
- Teacher

The exact database structure will be determined later.

---

## Multiple Students

An adult may eventually be connected to more than one student.

For example:

- A parent may have multiple children.
- A teacher may have multiple students.

The dashboard should allow the adult to choose which connected student they want to view.

For the first working version, this can remain simple.

---

## Student Overview

When an adult selects a student, the dashboard may display:

- Student display name
- Overall progress
- Current learning stage
- Current lesson
- Completed lessons
- Quiz results
- Circuit challenges completed
- Areas that may need additional practice

Only information useful for learning progress should be shown.

---

## Overall Progress

The dashboard should show a simple summary of the student's learning journey.

Possible display:

**CircuitLore Journey: 55% Complete**

The progress information will come from F6 Student Progress.

---

## Completed Lessons

Adults should be able to see which required lessons the student has completed.

Possible information:

- Lesson name
- Completion status
- Completion date

The dashboard does not need to show every small interaction the student performed.

---

## Quiz Results

Adults may view useful quiz information.

Possible information:

- Quiz or lesson name
- Score
- Attempts
- Completion status

The goal is to show learning progress rather than create a complicated grading system.

---

## Circuit Challenges

Adults may see which required circuit challenges have been completed.

Possible information:

- Challenge name
- Completion status
- Attempts if useful
- Completion date

The adult does not necessarily need to see every circuit the student experimented with.

---

## Areas Needing Practice

CircuitLore may identify concepts that could use additional practice.

For example, if a student has difficulty with several questions about resistance, the dashboard may show:

**Suggested Review: Resistance**

This should be based on actual saved student results.

The system should avoid making overly strong claims about a student's ability based on a small amount of data.

---

## Student Selection

If an adult has multiple connected students, the dashboard should provide a simple way to select a student.

Example:

**My Students**

- Student A
- Student B
- Student C

Selecting a student opens that student's progress overview.

---

## Removing a Connection

There should be a way to remove an adult-student connection when appropriate.

Removing the relationship should stop the adult from viewing that student's progress.

This should not delete the student's account or learning progress.

---

## Permissions

Adults should only be able to view progress for students connected to their account.

An adult should NOT be able to:

- View random student accounts
- Change another student's progress
- Delete student progress
- Edit quiz results
- Mark lessons complete
- Change circuit challenge results

The first version of the dashboard should primarily be read-only.

---

## Student Privacy

Because CircuitLore is intended for younger users, student privacy is important.

The application should:

- Collect minimal personal information
- Use display names rather than unnecessary personal information
- Keep student progress private
- Require authentication
- Verify adult-student relationships
- Prevent public student progress pages
- Prevent unauthorized access to progress records

---

## Dashboard Design

The adult dashboard should be simple and visual.

Possible sections include:

### Student Progress

Overall journey progress.

### Lessons

Completed and current lessons.

### Quizzes

Recent quiz results.

### Circuit Challenges

Completed challenges.

### Suggested Review

Topics that may need more practice.

The dashboard should not overwhelm adults with unnecessary technical data.

---

## Empty States

The dashboard should handle situations where there is no information yet.

### No Connected Students

Example:

"You haven't connected a student yet."

Provide instructions for connecting a student.

### New Student

Example:

"This student hasn't started their CircuitLore journey yet."

### No Quiz Results

Example:

"No quiz results yet."

---

## Error Handling

The dashboard should handle:

- Invalid connection code
- Expired connection code
- Student already connected
- Student not found
- Failed relationship creation
- Failed progress loading
- Unauthorized access
- Network failure
- Database failure

Errors should be explained simply without exposing private information.

---

## CRUD Functionality

The adult-student relationship may provide additional CRUD operations.

### Create

Create an approved connection between an adult and student.

### Read

View connected students and their allowed progress information.

### Update

Update appropriate relationship information if needed.

### Delete

Remove the adult-student connection.

Deleting the relationship must not delete the student's learning progress.

---

## Accessibility

The dashboard should include:

- Clear headings
- Readable text
- Keyboard-accessible controls
- Clear labels
- Progress information that does not depend only on color
- Responsive layout

---

## Acceptance Criteria

F9 will be considered complete when:

1. An authenticated adult can access the adult dashboard.
2. A student and adult can be connected through an approved method.
3. Adults cannot freely search all student accounts.
4. An adult can view connected students.
5. An adult can select an appropriate student.
6. Overall student progress can be displayed.
7. Completed lessons can be displayed.
8. Quiz results can be displayed.
9. Circuit challenge completion can be displayed.
10. Suggested review areas can be displayed if enough information exists.
11. Adults cannot edit student learning progress.
12. Adults cannot view unconnected students.
13. An adult-student connection can be removed.
14. Removing the connection does not delete student progress.
15. Empty and error states are handled clearly.

---

## Testing

Test:

- Adult login
- Adult dashboard access
- Student connection
- Valid connection code
- Invalid connection code
- Expired connection code
- Multiple connected students
- Student progress display
- Quiz results display
- Circuit challenge display
- New student with no progress
- Unauthorized student access
- Removing a student connection
- Confirming progress remains after connection removal
- Database failure
- Different screen sizes
- Keyboard navigation

---

## Dependencies

F9 depends on:

- F1 Authentication and User Profiles
- F6 Student Progress

It will also use information created by:

- F4 Electricity Lessons
- F5 Interactive Activities and Quizzes
- F7 Virtual Circuit Lab
- F8 Circuit Logic and Feedback

---

## Out of Scope for F9

F9 does not allow adults to:

- Complete lessons for students
- Change quiz scores
- Change circuit results
- Edit student progress
- Control the circuit simulator

More advanced classroom management features may be added later if project scope allows.

---

## Definition of Done

F9 is done when an authenticated adult can securely connect to an appropriate student and view a simple, useful summary of that student's CircuitLore progress.

Adults should only see students they are authorized to view, and the dashboard should remain primarily read-only so student learning records cannot be accidentally changed.