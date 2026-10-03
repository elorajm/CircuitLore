# F12 — Learning Content Management

## Purpose

CircuitLore needs a way to organize and manage the educational content used throughout the application.

This includes historical sections, electricity lessons, quiz questions, activities, and circuit challenges.

The goal is to keep learning content organized and allow appropriate content to be created, viewed, updated, and deleted without requiring major changes to the application code.

---

## Main Goals

The content management system should allow authorized management of:

- Historical content
- Electricity lessons
- Quiz questions
- Activities
- Circuit challenges
- Lesson order
- Learning stages

This feature also provides additional CRUD functionality for CircuitLore.

---

## Administrative Access

Normal student and adult accounts should not be able to change CircuitLore learning content.

Content management should be restricted to an authorized administrator.

An `admin` role may be added to the user role system from F1.

An administrator may be able to:

- Create content
- View content
- Edit content
- Delete content
- Change content order
- Publish or unpublish content

For the senior project, I may be the primary administrator.

---

## Content Dashboard

An administrator should have a simple place to manage CircuitLore content.

Possible sections include:

- Historical Content
- Lessons
- Questions
- Activities
- Circuit Challenges

The dashboard does not need to be a complex professional content management system.

Its purpose is to demonstrate that CircuitLore content can be managed without directly changing database records.

---

## Historical Content

Historical sections may contain:

- Title
- Historical figure
- Time period
- Description
- Story/dialogue
- Discovery
- What We Learned section
- Modern connection
- Source information
- Display order
- Published status

Historical content connects to F3.

---

## Electricity Lessons

Lesson information may include:

- Lesson ID
- Title
- Learning stage
- Description
- Main content
- Learning objective
- Historical connection
- Modern connection
- Display order
- Published status

Lessons connect to F4.

---

## Quiz Questions

Questions may contain:

- Question ID
- Lesson ID
- Question type
- Question text
- Answer choices
- Correct answer
- Explanation
- Display order
- Published status

Questions connect to F5.

---

## Activities

Interactive activities may contain information such as:

- Activity ID
- Lesson ID
- Activity type
- Instructions
- Required information
- Completion requirement
- Display order

More complicated interactive activities may still require application code.

The content system does not need to dynamically create every possible interaction.

---

## Circuit Challenges

Circuit challenges may contain:

- Challenge ID
- Title
- Instructions
- Learning concept
- Available components
- Component limits
- Required components
- Success requirements
- Difficulty
- Display order
- Published status

Circuit challenge definitions will connect to F7 and F8.

---

## Create Content

An administrator should be able to create appropriate learning content.

Examples:

- Add a lesson
- Add a historical section
- Add a quiz question
- Add a circuit challenge

Required fields should be validated before the content is saved.

---

## Read Content

The application should retrieve stored content from the database.

Students should only see content appropriate to their learning journey and publication status.

Administrators may see additional information needed for content management.

---

## Update Content

An administrator should be able to edit existing content.

Examples:

- Fix lesson wording
- Correct a historical detail
- Change a quiz answer
- Update a challenge
- Change display order

Updating content should not unnecessarily remove existing student progress.

---

## Delete Content

An administrator may need to remove content.

Deleting learning content can affect student progress, so deletion should be handled carefully.

Possible options include:

- Confirmation before deletion
- Prevent deletion when important related data exists
- Archive/unpublish instead of permanently deleting

The final behavior will depend on the database design.

---

## Publish / Unpublish

If time allows, content may have a published status.

### Published

Available to appropriate students.

### Unpublished

Stored in the system but hidden from students.

This would allow content to be prepared before adding it to the live learning journey.

---

## Content Ordering

Lessons and historical sections need a defined order.

Administrators should be able to control where content appears in the learning journey.

Possible fields include:

- Stage
- Order number
- Previous required lesson

The exact unlocking system will connect with F2.

---

## Source Information

Historical and scientific content should be based on reliable sources.

CircuitLore may store source information for important educational content.

Possible information:

- Source title
- Organization or author
- URL or citation information
- Date accessed if appropriate

Source information does not necessarily need to be displayed prominently to students, but it should be available for verification.

---

## Content Validation

The system should validate content before saving.

Examples:

- Required title
- Required lesson association
- Valid question type
- Correct answer exists
- Valid display order
- Required challenge information

Invalid content should not silently enter the learning journey.

---

## Student Experience

Students should not see the content-management interface.

They should simply receive the appropriate published content through:

- Learning Journey
- Historical Storytelling
- Electricity Lessons
- Quizzes
- Circuit Challenges

---

## CRUD Functionality

F12 provides clear CRUD functionality.

### Create

Create lessons, questions, historical content, or challenges.

### Read

Retrieve and display learning content.

### Update

Edit existing learning content.

### Delete

Delete or appropriately archive learning content.

This works alongside the CRUD functionality already included in user profiles, student progress, and adult-student relationships.

---

## Permissions

Only authorized administrators should be able to modify learning content.

Students should not be able to create, edit, or delete official CircuitLore lessons.

Adult accounts should not automatically receive administrative access.

Authorization should be checked by the application and database where appropriate.

---

## Error Handling

The content system should handle:

- Missing required fields
- Invalid content type
- Failed content creation
- Failed content update
- Failed deletion
- Content not found
- Unauthorized access
- Database failure

Errors should clearly explain what the administrator needs to correct.

---

## Accessibility

The administration interface should still follow basic accessibility practices.

This includes:

- Clear labels
- Keyboard-accessible forms
- Visible focus states
- Readable error messages
- Proper form structure

---

## Acceptance Criteria

F12 will be considered complete when:

1. Authorized administrators can access content management.
2. Students and normal adults cannot access content management.
3. Historical content can be stored and retrieved.
4. Electricity lessons can be stored and retrieved.
5. Quiz questions can be stored and retrieved.
6. Circuit challenges can be stored and retrieved.
7. Appropriate content can be created.
8. Existing content can be viewed.
9. Existing content can be edited.
10. Appropriate content can be deleted or archived.
11. Content order can be controlled.
12. Published content can appear in the learning journey.
13. Unpublished content can remain hidden if publishing is implemented.
14. Invalid content is handled appropriately.
15. CRUD functionality can be demonstrated.

---

## Testing

Test:

- Administrator access
- Student access attempt
- Adult access attempt
- Create lesson
- Edit lesson
- Delete/archive lesson
- Create historical section
- Edit historical section
- Create quiz question
- Edit quiz question
- Create circuit challenge
- Edit circuit challenge
- Change content order
- Missing required field
- Unauthorized request
- Database failure
- Published content display
- Unpublished content behavior if implemented

---

## Dependencies

F12 connects with:

- F1 Authentication and User Profiles
- F2 Learning Journey
- F3 Historical Storytelling
- F4 Electricity Lessons
- F5 Interactive Activities and Quizzes
- F7 Virtual Circuit Lab
- F8 Circuit Logic and Feedback

---

## Out of Scope for F12

The first version does not need:

- A professional publishing platform
- Multiple administrator permission levels
- Complex approval workflows
- Version history for every edit
- Collaborative content editing
- Automatic AI-generated lessons

The goal is a simple management system appropriate for the CircuitLore senior project.

---

## Definition of Done

F12 is done when authorized administration can manage the core educational content used by CircuitLore through clear Create, Read, Update, and Delete operations.

Students should receive the correct learning content without being able to modify official lessons, questions, historical information, or circuit challenges.