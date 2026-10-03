# F7 — Virtual Circuit Lab

## Purpose

The Virtual Circuit Lab gives students a safe place to experiment with the electrical concepts they learn throughout CircuitLore.

Students will be able to place electrical components on a workspace, connect them, move them, remove them, and test their circuit.

The goal is to make electricity more visual and hands-on without requiring students to work with real electricity.

---

## Main Experience

A student should be able to:

1. Open the Circuit Lab.
2. See available electrical components.
3. Add components to the workspace.
4. Move components around.
5. Connect components together.
6. Change interactive components such as switches.
7. Test the circuit.
8. See what happens.
9. Receive feedback.
10. Change the circuit and try again.

---

## Circuit Lab Layout

The Circuit Lab should have three main areas.

### Component Toolbox

Contains the electrical components available to the student.

### Circuit Workspace

The main area where the student builds the circuit.

### Controls and Feedback

Contains options such as:

- Test Circuit
- Reset
- Clear
- Challenge instructions
- Feedback

The layout should remain simple enough for students around ages 10–14.

---

## Initial Components

The first version of the Circuit Lab will focus on a small number of components.

### Battery

Provides the electrical source for the circuit.

The battery should have identifiable connection points.

---

### Wire

Connects components together.

Students should be able to create connections between compatible connection points.

---

### Light Bulb

Provides a clear visual result.

If the circuit is valid and powered, the bulb should visually turn on.

If the circuit is not working, the bulb should remain off.

---

### Switch

Allows the student to open or close the circuit.

The switch should clearly show whether it is:

- Open
- Closed

Changing the switch should affect the circuit.

---

### Resistor

Introduces resistance into the circuit.

The first version may use simplified resistor behavior rather than attempting a complete physics simulation.

---

## Component Toolbox

Students should be able to see which components are available.

Each component should include:

- Visual representation
- Name
- Clear way to add it to the workspace

Depending on the final interface, students may:

- Drag a component into the workspace

or

- Select a component and place it

Accessibility should be considered when choosing the final interaction.

---

## Adding Components

Students should be able to add allowed components to the workspace.

When a component is added:

- It should appear clearly.
- It should become part of the current circuit.
- The student should be able to move or remove it.

Challenges may limit which components are available.

---

## Moving Components

Students should be able to reposition components inside the workspace.

Moving a component should not accidentally delete it.

If a connected component moves, the interface should update its visible connections appropriately.

---

## Connecting Components

Components should have clear connection points.

Students should be able to create a wire or connection between compatible points.

The interface should make it clear:

- Where a connection can begin
- Where it can end
- Which components are connected

Invalid connections should either be prevented or clearly explained.

---

## Removing Connections

Students should be able to remove a wire or connection without clearing the entire circuit.

This allows students to correct mistakes and experiment.

---

## Removing Components

Students should be able to remove individual components.

If a component is removed, any connections attached to it should also be handled correctly.

The application should not leave broken invisible connections behind.

---

## Switch Interaction

The student should be able to change the switch between:

- Open
- Closed

The visual appearance should change so the student understands the current state.

The circuit should then be reevaluated by F8 Circuit Logic and Feedback.

---

## Light Bulb State

The light bulb should have at least two clear visual states:

- Off
- On

When the circuit works, the bulb should visibly light.

The interface should not rely only on color to communicate whether the bulb is on.

---

## Test Circuit

Depending on the final design, circuits may be checked automatically or through a:

**Test Circuit**

button.

When tested, CircuitLore will send the circuit information to the F8 circuit logic.

F8 will determine what happens and return feedback.

---

## Reset Circuit

Students should have a way to reset the current activity.

Reset may return the challenge to its original starting state.

If resetting would remove significant work, the application may ask for confirmation.

---

## Clear Workspace

Students should be able to remove all components and start over.

Example:

**Clear Circuit**

A confirmation may be used to prevent accidental clearing.

---

## Challenge Mode

The Circuit Lab can be used as part of F5 challenges.

A challenge may provide:

- Goal
- Available components
- Component limits
- Instructions
- Success condition

Example:

### Challenge

Make the light bulb turn on.

### Available

- 1 battery
- 1 bulb
- Wires

The student builds the circuit and tests it.

F8 determines whether the challenge has been completed successfully.

---

## Free Experiment Mode

If time allows, students may also have a free-build area where they can experiment without completing a specific challenge.

This could allow students to:

- Add components
- Try different arrangements
- Open and close switches
- Compare circuits

Challenge Mode is a higher priority than Free Experiment Mode.

---

## Circuit Representation

Behind the visual interface, CircuitLore will need a way to represent the student's circuit.

A component may contain information such as:

- Component ID
- Component type
- Position
- Connection points
- State

For example, a switch would also need an open or closed state.

Connections may contain information such as:

- Starting component
- Starting connection point
- Ending component
- Ending connection point

The exact structure will be researched and designed during implementation.

---

## Visual Feedback

The lab should make actions easy to understand.

Possible feedback includes:

- Highlighting a selected component
- Showing valid connection points
- Showing when a connection is created
- Bulb turning on
- Switch visibly opening or closing
- Simple animation showing circuit activity

The lab should not become visually overwhelming.

---

## Circuit Animation

CircuitLore may use simple animation to help students visualize what is happening.

For example, the interface may show movement through a completed circuit.

This animation is educational rather than a claim that electricity literally looks that way.

Students should still be able to understand the circuit when reduced motion is enabled.

---

## Undo

If time allows, the Circuit Lab may include an Undo option.

Undo could reverse actions such as:

- Add component
- Remove component
- Move component
- Add connection
- Remove connection

Undo is useful but is not required for the first working version.

---

## Saving Circuits

Saving custom circuit designs is optional.

The main required saved information is whether a student successfully completed a required circuit challenge.

If time allows, students may later be able to save and reopen their own circuit designs.

---

## Mobile and Screen Size

The Circuit Lab may work best on larger screens because students need space to arrange components.

The overall CircuitLore application should remain responsive.

If full circuit building is difficult on very small screens, the application should clearly communicate the limitation rather than providing a broken interface.

Tablet support would be useful because the application is intended for educational use.

---

## Accessibility

Drag-and-drop should not be the only possible way to interact with important features if an accessible alternative can reasonably be provided.

The lab should consider:

- Keyboard controls
- Clearly labeled components
- Visible focus states
- Instructions that do not depend only on color
- Reduced-motion support
- Clear button labels
- Adequate size for interactive controls

---

## Error Handling

The Circuit Lab should handle:

- Invalid connection
- Missing component
- Component fails to load
- Invalid circuit data
- Challenge fails to load
- Circuit validation failure
- Reset failure
- Unexpected application state

Students should receive simple feedback instead of technical error messages.

---

## Scope Limits

CircuitLore is an educational application, not professional electrical engineering software.

The first version does NOT need to simulate:

- Every electrical component
- Complex AC systems
- Professional circuit design
- Advanced electronics
- Real-world electrical hazards
- Exact behavior of every possible circuit
- Complete electrical engineering calculations

The focus is basic educational circuits for students around ages 10–14.

---

## Acceptance Criteria

F7 will be considered complete when:

1. Students can open the Circuit Lab.
2. Available components are displayed.
3. Students can add components.
4. Students can move components.
5. Students can connect compatible components.
6. Students can remove connections.
7. Students can remove components.
8. Students can interact with a switch.
9. A bulb has clear on and off states.
10. Students can reset or clear a circuit.
11. Challenge instructions can be displayed.
12. Circuit data can be passed to F8 for validation.
13. The interface provides clear visual feedback.
14. The lab works with the student's learning journey.
15. Basic accessibility is considered.

---

## Testing

Test:

- Opening the Circuit Lab
- Adding each component
- Moving components
- Connecting components
- Removing a connection
- Removing a component
- Opening a switch
- Closing a switch
- Bulb on state
- Bulb off state
- Resetting a circuit
- Clearing a circuit
- Loading a challenge
- Invalid connection
- Multiple components
- Different screen sizes
- Keyboard interaction where supported
- Reduced-motion behavior

---

## Dependencies

F7 depends on:

- F4 Electricity Lessons
- F5 Interactive Activities and Quizzes
- F6 Student Progress

F7 works very closely with:

- F8 Circuit Logic and Feedback

Visual behavior will also connect with:

- F11 Animation and Visual Experience

---

## Out of Scope for F7

F7 does not decide whether a circuit is electrically correct.

That belongs to F8.

F7 also does not handle:

- Authentication
- Overall student progress
- Quiz scoring
- Parent/teacher reports
- AI tutoring

---

## Definition of Done

F7 is done when a student can open the Virtual Circuit Lab, add basic electrical components, arrange them, connect them, interact with them, remove or reset them, and submit the circuit for validation.

The Circuit Lab should provide a visual, understandable, and safe way for students to experiment with the electrical concepts they have learned in CircuitLore.