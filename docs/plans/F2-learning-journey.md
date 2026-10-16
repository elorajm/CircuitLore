# F2 — Learning Journey

## Purpose

The Learning Journey controls how a student moves through CircuitLore.

CircuitLore should not feel like a list of school lessons. The student should feel like they are traveling through the story of electricity, beginning with historical discoveries and gradually moving into modern electricity.

This feature controls the overall learning path, lesson order, unlocking, navigation, and where the student continues when returning to the application.

---

## Main Student Experience

A student's basic journey will be:

1. Log in.
2. Enter the learning journey.
3. Begin with the history of electricity.
4. Meet historical figures connected to important discoveries.
5. Learn what each discovery taught us.
6. Complete an activity, question, or challenge.
7. Unlock the next part of the journey.
8. Gradually transition from historical discoveries into modern electricity.
9. Complete modern electricity lessons.
10. Use the virtual circuit lab.
11. Save progress automatically.
12. Return later and continue where they stopped.

---

## Learning Structure

The journey will be divided into sections with a defined progression order. Each lesson has a unique, readable identifier.

### Lesson Identifier Format

Lessons use readable, stable IDs like:
- `history-001`, `history-002`, ... for historical figure lessons
- `concept-001`, `concept-002`, ... for electricity concept lessons
- `modern-001`, `modern-002`, ... for modern electricity lessons

Lesson IDs never change once assigned, allowing stable progress tracking across sessions.

### Learning Stages

#### Stage 1 — The Beginning

Introduce electricity as something people did not always understand.

The student begins exploring early observations and questions about electricity.

**First lesson**: `history-001` — Introduction to electricity

#### Stage 2 — Discovering Electricity

Historical figures introduce important discoveries and experiments.

Each section should answer:

- Who was this person?
- What were they trying to understand?
- What did they discover?
- What did the experiment teach us?
- Why does it matter today?

**Lessons**: `history-001` through `history-007`

#### Stage 3 — Understanding Electricity

Historical discoveries begin connecting directly to concepts such as:

- Charge
- Current
- Voltage
- Resistance
- Conductors
- Insulators

**Lessons**: `concept-001` through `concept-006`

#### Stage 4 — Building Circuits

Students learn:

- Electrical components
- Open circuits
- Closed circuits
- Switches
- Series circuits
- Parallel circuits

Students begin using the virtual circuit lab.

**Lessons**: `circuit-001` through `circuit-005`

#### Stage 5 — Electricity Today

Students see how earlier discoveries connect to modern uses of electricity.

Possible examples:

- Homes
- Lighting
- Electronics
- Power systems
- Renewable energy
- Everyday technology

**Lessons**: `modern-001` through `modern-005`

---

## Lesson Definitions

Lesson definitions are stored in the React application initially (in a JSON file or constants). Each lesson has:

```javascript
{
  id: "history-001",                    // Unique, stable lesson ID
  title: "Electricity Mysteries",        // Display name
  stage: 1,                              // Learning stage (1-5)
  category: "history",                   // history, concept, circuit, modern
  order: 1,                              // Position in journey (1, 2, 3, ...)
  description: "Early observations of electricity",
  requiredToUnlockNext: true,            // Whether completion unlocks next lesson
  estimatedMinutes: 10
}
```

Lesson definitions define the curriculum structure. Progress tracking (in F6) uses these IDs to record student completion.

Lesson content (text, images, interactive elements) will be added during implementation with the content for each stage.

---

## Historical-to-Modern Transition

One of the main visual ideas behind CircuitLore is watching the world change as the student progresses.

Early sections may include:

- Historical laboratories
- Workshops
- Older equipment
- Period-inspired environments

As the student progresses, the environment should gradually become more modern.

Eventually the student reaches:

- Modern electrical components
- Modern homes or technology
- The virtual circuit lab

The transition should help show that modern electrical technology developed from discoveries made over time.

---

## Journey Map

Students should have a way to see their overall progress.

The journey map may show:

- Current location
- Completed sections
- Available sections
- Locked sections
- Overall progress

The map should be simple enough for the target age group to understand.

---

## Lesson Unlocking

Students should progress through the main learning path in a logical order.

A section may unlock when the previous required section has been completed.

For example:

History Lesson 1
↓
Activity
↓
History Lesson 2
↓
Activity
↓
Electricity Concept
↓
Challenge
↓
Next Section

Not every optional activity needs to block progress.

---

## Locked Content

If a student selects content they have not unlocked yet, CircuitLore should clearly explain what needs to be completed first.

Example:

"Complete the previous discovery to unlock this lesson."

The application should not make the student feel like they caused an error.

---

## Continue Learning

When a student logs back in, CircuitLore should make it easy to continue.

The student dashboard should include a clear option such as:

**Continue Your Journey**

This should take the student to the next appropriate lesson or activity based on saved progress.

---

## Completed Content

Students should be able to revisit lessons they have already completed.

Revisiting a lesson should not accidentally erase their progress.

Students may also be allowed to retry activities and quizzes where appropriate.

---

## Progress Saving

Progress should be saved as the student completes important parts of the journey.

Possible saved information includes:

- Current stage
- Current lesson
- Completed lessons
- Completed activities
- Completed challenges
- Unlock status

The detailed progress system will be planned in F6.

## Lesson Definitions

Lesson definitions are stored in the React application initially (in a JSON file or constants). Each lesson has:

```javascript
{
  id: "history-001",                    // Unique, stable lesson ID
  title: "Electricity Mysteries",        // Display name
  stage: 1,                              // Learning stage (1-5)
  category: "history",                   // history, concept, circuit, modern
  order: 1,                              // Position in journey (1, 2, 3, ...)
  description: "Early observations of electricity",
  requiredToUnlockNext: true,            // Whether completion unlocks next lesson
  estimatedMinutes: 10
}
```

Lesson definitions define the curriculum structure. Progress tracking (in F6) uses these IDs to record student completion.

Lesson content (text, images, interactive elements) will be added during implementation with the content for each stage.

## Progress Tracking Integration (F6)

As the student moves through the journey, their progress is saved in Supabase.

Each lesson has a progress record tracking:

- **Status**: `not_started`, `in_progress`, or `completed`
- **Completed date**: When the student finished the lesson
- **Last accessed**: When they last opened the lesson
- **Attempts**: How many times they've restarted the lesson

This progress data allows:
- Students to resume from their last location when they return
- The dashboard to show "Continue Your Journey" with the next lesson
- Content unlocking based on completed prerequisites
- Overall progress calculation as a percentage

Progress is saved automatically whenever a student reaches the end of a lesson or clicks "Mark Complete."

---

## Navigation

Students should be able to understand:

- Where they are
- What they are learning
- What they have completed
- What comes next

Navigation should remain simple and consistent.

Possible navigation options:

- Journey Map
- Continue
- Previous
- Home/Dashboard
- Circuit Lab when unlocked
- Profile

---

## Student Dashboard

After logging in, a student should see a simple dashboard.

Possible information:

- Welcome message
- Continue Your Journey
- Current stage
- Overall progress
- Recently completed lesson
- Circuit Lab status

The dashboard should focus on getting the student back into learning rather than displaying too much information.

---

## Visual Experience

The learning journey should use the realistic-cartoon style defined for CircuitLore.

Visuals should help students understand:

- The historical time period
- The person speaking
- The experiment being discussed
- The electrical concept
- The transition into modern technology

Animations should support the learning experience without preventing a student from using the application if animations are reduced or unavailable.

---

## Accessibility

The journey should consider:

- Readable text
- Clear navigation
- Keyboard accessibility where possible
- Alternative text for important images
- Reduced-motion support
- Clear visual feedback
- Instructions that do not depend only on color

---

## Error Handling

If progress cannot be loaded, the application should not guess where the student belongs.

The student should receive a simple message and an option to retry.

If progress cannot be saved, the application should notify the user rather than silently losing their work.

---

## Acceptance Criteria

F2 will be considered complete when:

1. A logged-in student can enter the learning journey.
2. The journey has a defined historical-to-modern order.
3. Students can see their current location in the journey.
4. Completed sections are identifiable.
5. Locked sections are identifiable.
6. Required sections unlock in the correct order.
7. Students can revisit completed content.
8. Students can continue from their saved location.
9. The dashboard provides a clear Continue Your Journey option.
10. Progress connects correctly with the student account.
11. Navigation remains consistent throughout the journey.
12. Historical sections clearly connect discoveries to electrical concepts.

---

## Testing

Test:

- New student beginning the journey
- Returning student continuing the journey
- Completing a section
- Unlocking the next section
- Attempting to access locked content
- Revisiting completed content
- Navigation between sections
- Missing progress data
- Failed progress save
- Journey map display
- Student with all available content completed

---

## Dependencies

F2 depends on:

- F1 Authentication and User Profiles
- F3 Historical Storytelling
- F4 Electricity Lessons
- F5 Activities and Quizzes
- F6 Student Progress

F2 defines the overall journey while those features provide the content and progress system inside it.

---

## Out of Scope for F2

F2 does not build:

- Authentication
- Historical lesson content
- Quiz logic
- Circuit simulation
- AI assistance
- Parent/teacher reporting

Those are handled by their own features.

---

## Definition of Done

F2 is done when a student can enter CircuitLore, understand where they are in the learning journey, move through content in the intended order, unlock new sections, revisit completed sections, and return later to continue from their saved progress.