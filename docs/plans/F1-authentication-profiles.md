# F1 — Authentication and User Profiles

## Purpose

CircuitLore needs accounts so students can save their learning progress and return later.

Adult accounts will also be needed so a parent or teacher can view appropriate student progress.

This feature will create the foundation for user authentication, profiles, roles, and account management.

---

## Users

### Student

A student should be able to:

- Create an account
- Log in
- Log out
- View their profile
- Edit appropriate profile information
- Delete their account
- Return later and continue using the same account

### Parent/Teacher

A parent or teacher should be able to:

- Create an account
- Log in
- Log out
- View their profile
- Edit appropriate profile information
- Delete their account

Student progress viewing will be handled later in F9.

---

## User Roles

CircuitLore will initially support:

- `student`
- `adult`

The adult role can represent a parent or teacher.

An administrator role may be added later if needed for learning content management.

---

## Sign Up

The sign-up page should ask for only the information CircuitLore actually needs.

Possible fields:

- Display name
- Email
- Password
- Account type

The user selects:

- Student
- Parent/Teacher

Because CircuitLore is designed for younger users, unnecessary personal information should not be collected.

---

## Log In

Users should be able to log in using their registered credentials.

After successful login:

### Student

Send the student to their learning dashboard.

### Parent/Teacher

Send the adult to their dashboard.

If login fails, show a simple error message without exposing sensitive authentication information.

---

## Log Out

A logged-in user should be able to log out from anywhere appropriate in the application.

After logging out, return the user to the public home page or login page.

---

## Profile

Each user will have a profile associated with their authentication account.

Possible profile information:

- User ID
- Display name
- Account role
- Created date
- Updated date

Authentication information such as passwords should not be stored in the profile table.

---

## CRUD Operations

This feature contributes to CircuitLore's required CRUD functionality.

### Create

Create a user account and profile.

### Read

View the user's profile.

### Update

Edit allowed profile information.

### Delete

Delete the user's account/profile.

Student learning progress will have additional CRUD functionality in F6.

---

## Database

A possible `profiles` table could include:

- `id`
- `display_name`
- `role`
- `created_at`
- `updated_at`

The exact database structure will be finalized after researching Supabase.

---

## Pages / Views

F1 will likely need:

### Sign Up

Allows a new user to create an account.

### Log In

Allows an existing user to access CircuitLore.

### Profile

Shows basic account information.

### Edit Profile

Allows appropriate profile information to be changed.

---

## Authentication Protection

Pages containing saved user information should require authentication.

A user should not be able to access another user's private profile information by changing a URL or request.

Role checks should also prevent students from accessing adult-only areas.

---

## Error States

The application should handle:

- Invalid email
- Incorrect password
- Duplicate account
- Missing required information
- Failed account creation
- Failed profile update
- Expired or invalid session
- Database/network failure

Error messages should be understandable without revealing sensitive information.

---

## Privacy

CircuitLore is intended for younger users, so privacy will be considered throughout development.

The application should:

- Collect as little personal information as possible
- Avoid collecting addresses, phone numbers, or other unnecessary information
- Protect private account information
- Avoid exposing student information publicly
- Use fictional/test accounts during development

---

## Acceptance Criteria

F1 will be considered complete when:

1. A new user can create an account.
2. A user can select the appropriate account type.
3. A profile is created for the user.
4. A registered user can log in.
5. A logged-in user can log out.
6. A user can view their own profile.
7. A user can edit allowed profile information.
8. A user can delete their account.
9. Protected pages cannot be accessed while logged out.
10. Users cannot access another user's private profile.
11. Student and adult roles can be identified by the application.
12. Authentication errors are handled clearly.

---

## Testing

Test:

- Successful student registration
- Successful adult registration
- Duplicate registration
- Successful login
- Incorrect login
- Logout
- Profile retrieval
- Profile editing
- Account deletion
- Protected routes
- Role restrictions
- Invalid sessions
- Database failure handling

---

## Dependencies

This feature will likely depend on:

- Supabase Authentication
- Supabase database
- Application routing
- Environment variables

The exact implementation will be decided after the technology setup and prototype.

---

## Out of Scope for F1

F1 will NOT handle:

- Lesson progress
- Quizzes
- Circuit progress
- Parent/teacher student reports
- AI
- Historical lessons
- Circuit simulation

Those belong to later features.

---

## Definition of Done

F1 is done when authentication and basic account management work from beginning to end and the application can reliably identify whether the current user is a student or an adult.

The feature should also have enough testing to demonstrate that users cannot access account information that does not belong to them.