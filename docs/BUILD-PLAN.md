# CircuitLore Build Plan

## Purpose

This document defines the order CircuitLore will be developed.

The project has many planned features, but development will focus on creating a working core application first and then adding more advanced features.

The goal is to always have a working project while gradually adding functionality.

---

# MVP

The Minimum Viable Product (MVP) is the smallest version of CircuitLore that demonstrates the main idea of the project.

The MVP should allow a student to:

1. Create an account and log in.
2. Enter the CircuitLore learning journey.
3. Complete at least one historical learning experience.
4. Complete electricity lessons.
5. Complete an activity or quiz.
6. Build a basic electrical circuit.
7. Receive feedback about whether the circuit works.
8. Have progress saved.
9. Log out and return later.
10. Continue from saved progress.

The MVP should demonstrate:

- Authentication
- Database usage
- CRUD operations
- Educational content
- Interactive learning
- Student progress
- Circuit building
- Circuit validation
- Responsive interface

---

# Development Phases

## Phase 1 — Project Foundation

Set up the basic application and development environment.

Tasks:

- Select technology stack
- Initialize application
- Install dependencies
- Create project structure
- Configure environment variables
- Connect GitHub repository
- Create Supabase project
- Connect application to Supabase
- Create basic routing
- Create basic layout
- Confirm local application runs

Goal:

A clean working application connected to GitHub and Supabase.

---

## Phase 2 — Authentication and Database Foundation

Primary Feature:

F1 — Authentication and User Profiles

Tasks:

- Create database structure
- Configure Supabase authentication
- Student registration
- Adult registration
- Login
- Logout
- Profiles
- User roles
- Protected routes
- Profile editing
- Account deletion

Goal:

Users can securely create accounts, log in, and manage basic profile information.

---

## Phase 3 — Basic Learning System

Primary Features:

F2 — Learning Journey  
F4 — Electricity Lessons  
F6 — Student Progress

Tasks:

- Create learning stages
- Create lesson structure
- Display lessons
- Create student dashboard
- Track lesson completion
- Save progress
- Calculate progress
- Continue Your Journey
- Lock/unlock lessons

Goal:

A student can move through lessons and return later without losing progress.

---

## Phase 4 — Historical Experience

Primary Features:

F3 — Historical Storytelling  
F11 — Animation and Visual Experience

Tasks:

- Research historical figures
- Research discoveries
- Create first historical scene
- Add character
- Add dialogue
- Add historical experiment
- Connect discovery to electrical concept
- Create historical-to-modern transition
- Add basic animations

Goal:

At least one polished historical learning sequence demonstrates the main CircuitLore storytelling idea.

---

## Phase 5 — Activities and Quizzes

Primary Feature:

F5 — Interactive Activities and Quizzes

Tasks:

- Multiple-choice questions
- True/false questions
- Interactive activity
- Immediate feedback
- Retry behavior
- Quiz scoring
- Save quiz results
- Connect results to student progress

Goal:

Students can practice concepts and receive useful feedback.

---

## Phase 6 — Virtual Circuit Lab

Primary Feature:

F7 — Virtual Circuit Lab

Tasks:

- Create circuit workspace
- Create component toolbox
- Add battery
- Add wire
- Add bulb
- Add switch
- Add resistor
- Place components
- Move components
- Remove components
- Connect components
- Clear circuit
- Reset circuit

Goal:

Students can visually construct a basic electrical circuit.

---

## Phase 7 — Circuit Logic

Primary Feature:

F8 — Circuit Logic and Feedback

Tasks:

- Design circuit data model
- Research graph/path logic
- Detect connections
- Detect complete path
- Detect open circuit
- Detect closed circuit
- Add switch logic
- Control bulb state
- Generate feedback
- Validate circuit challenges
- Add automated logic tests

Goal:

CircuitLore can determine whether a student's basic circuit works and explain common problems.

---

## Phase 8 — Content Management

Primary Feature:

F12 — Learning Content Management

Tasks:

- Add administrator role
- Create content dashboard
- Create lessons
- Edit lessons
- Delete/archive lessons
- Manage questions
- Manage historical content
- Manage circuit challenges
- Manage content order

Goal:

Core CircuitLore learning content can be managed through the application.

---

## Phase 9 — Parent/Teacher Experience

Primary Feature:

F9 — Parent/Teacher Dashboard

Tasks:

- Connect adult to student
- Create student connection system
- Display student progress
- Display completed lessons
- Display quiz results
- Display circuit challenge progress
- Remove student connection
- Test privacy and permissions

Goal:

An approved adult can securely view appropriate student progress.

---

## Phase 10 — AI Learning Assistant

Primary Feature:

F10 — AI Learning Assistant

Tasks:

- Research AI service
- Create secure server-side AI request
- Design tutoring prompt
- Add lesson hints
- Add circuit hints
- Add hint levels
- Add safety instructions
- Add usage limits
- Add fallback behavior
- Test responses

Goal:

Students can request extra educational help without the core application depending on AI.

---

## Phase 11 — Polish and Accessibility

Primary Feature:

F11 — Animation and Visual Experience

Tasks:

- Improve historical scenes
- Improve character consistency
- Improve transitions
- Add educational animations
- Optimize images
- Improve responsive design
- Add reduced-motion support
- Improve keyboard accessibility
- Review contrast and readability
- Improve loading and error states

Goal:

CircuitLore feels like one polished educational application rather than separate features.

---

## Phase 12 — Testing and Finalization

Tasks:

- Test complete student journey
- Test adult journey
- Test administrator journey
- Test CRUD operations
- Test authentication
- Test authorization
- Test progress saving
- Test circuit logic
- Test AI fallback
- Test responsive design
- Test accessibility
- Fix bugs
- Review educational content
- Review historical accuracy
- Review scientific accuracy
- Prepare final demonstration
- Complete project documentation

Goal:

CircuitLore is stable, understandable, demonstrable, and ready for final CSE 499 review.

---

# Feature Priority

## Must Have

These features define the core CircuitLore project:

- F1 Authentication and User Profiles
- F2 Learning Journey
- F3 Historical Storytelling
- F4 Electricity Lessons
- F5 Interactive Activities and Quizzes
- F6 Student Progress
- F7 Virtual Circuit Lab
- F8 Circuit Logic and Feedback

---

## Should Have

These significantly improve the finished project:

- F9 Parent/Teacher Dashboard
- F11 Animation and Visual Experience
- F12 Learning Content Management

---

## Could Have / Scope Dependent

These can be reduced if the core project needs more development time:

- F10 AI Learning Assistant
- Advanced character animation
- Free-build circuit saving
- Parallel circuit simulation
- Large number of historical figures
- Large number of lessons
- Advanced adult reporting
- Advanced circuit components

---

# Scope Rule

A smaller polished feature is better than a large unfinished feature.

If development takes longer than expected, CircuitLore should prioritize:

1. Working authentication
2. Working learning journey
3. Working saved progress
4. One polished historical learning sequence
5. Core electricity lessons
6. Working activities and quizzes
7. Working basic circuit lab
8. Working circuit validation

Advanced features should not prevent the core learning experience from being completed.

---

# Development Rule

Each major feature should follow this process:

Plan
↓
Research
↓
Prototype
↓
Implement
↓
Test
↓
Review
↓
Commit

Major features should be committed separately when practical.

---

# Definition of Project Success

CircuitLore will be successful when a student can move from a historical electricity discovery into a modern electrical concept, interact with the lesson, build a basic circuit, receive meaningful feedback, and have their learning progress saved.

The final project should demonstrate that I learned and applied new technical concepts while building a complete educational web application.