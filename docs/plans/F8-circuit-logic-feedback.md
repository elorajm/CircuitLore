# F8 — Circuit Logic and Feedback

## Purpose

Circuit Logic and Feedback determines whether the circuits students build in the Virtual Circuit Lab work.

F7 handles the visual circuit-building experience. F8 handles the logic behind that experience.

The system should be able to look at the components and connections in a student's circuit, determine what is happening, and provide simple feedback that helps the student understand why the circuit works or does not work.

---

## Main Goals

The circuit logic should be able to:

- Understand which components are connected
- Identify a complete electrical path
- Identify an incomplete electrical path
- Recognize open and closed switches
- Determine whether a light bulb should turn on
- Validate circuit challenges
- Explain common circuit problems
- Support basic series circuits
- Support basic parallel circuits if project scope allows

The goal is educational accuracy for basic circuits rather than professional electrical engineering simulation.

---

## Circuit Model

CircuitLore will need an internal representation of the circuit.

The circuit may contain:

- Components
- Connection points
- Connections
- Component states

Each component should have a unique ID.

Possible component types include:

- Battery
- Wire
- Light bulb
- Switch
- Resistor

---

## Components

A component may contain information such as:

- ID
- Type
- Connection points
- Current state
- Other properties needed for validation

Example concept:

Battery

- ID: battery-1
- Type: battery
- Positive terminal
- Negative terminal

Switch

- ID: switch-1
- Type: switch
- Terminal A
- Terminal B
- State: open or closed

The exact data structure will be decided during development.

---

## Connections

The system needs to know which component terminals are connected.

A connection may contain:

- Starting component
- Starting terminal
- Ending component
- Ending terminal

The visual position of components should not determine whether they are electrically connected.

A connection must exist in the circuit data.

---

## Closed Circuit

A basic circuit should work when there is a complete path from one battery terminal through the required components and back to the other battery terminal.

Example:

Battery
↓
Wire
↓
Light Bulb
↓
Wire
↓
Battery

If the path is complete, the circuit can be considered closed.

---

## Open Circuit

If the electrical path is broken, the circuit should be considered open.

Possible causes include:

- Missing wire
- Unconnected component
- Open switch
- Incomplete path back to the battery

The light bulb should remain off.

---

## Switch Logic

A switch should affect whether a path is complete.

### Closed Switch

The connection can continue through the switch.

### Open Switch

The path is broken.

Changing the switch should cause CircuitLore to reevaluate the circuit.

---

## Light Bulb Logic

For the first version, a light bulb should turn on when:

- A valid power source exists
- The bulb is part of a complete path
- Required connections are valid
- Any switch in the required path is closed

The bulb should remain off when those requirements are not met.

---

## Battery Logic

The battery acts as the basic power source.

For the first version, CircuitLore does not need to simulate every real battery behavior.

The system mainly needs to recognize:

- Battery exists
- Required terminals are connected
- A complete path exists

More detailed voltage behavior may be added if it supports the lessons and remains within project scope.

---

## Resistor Logic

The resistor should be represented as part of the electrical path.

The first version may use simplified resistor behavior.

Possible later behavior could demonstrate that changing resistance affects the circuit.

Exact electrical calculations are not required for the first working version unless research shows they can be implemented within the project scope.

---

## Circuit Validation

When the student tests a circuit, F8 should analyze the circuit data.

A simplified validation process may be:

1. Check that a battery exists.
2. Check that the required component exists.
3. Read all component connections.
4. Follow the possible path through the circuit.
5. Check switch states.
6. Determine whether a complete path returns to the battery.
7. Determine the resulting component states.
8. Return the result to the Circuit Lab.

The exact algorithm will be researched and prototyped before final implementation.

---

## Graph-Based Representation

One possible approach is to represent the circuit as a graph.

In this model:

- Components or terminals can act as nodes.
- Connections can act as edges.

CircuitLore could then search through the graph to determine whether a valid path exists.

This is a new area I will research as part of the project.

The final implementation may use this approach or another approach if research shows a better solution for the project.

---

## Circuit Results

F8 should return useful information to F7.

Possible result information:

- Circuit valid or invalid
- Circuit open or closed
- Bulb on or off
- Problem detected
- Feedback message
- Challenge complete or incomplete

---

## Student Feedback

Feedback should explain the problem in simple language.

The system should avoid only saying:

"Incorrect circuit."

Instead, it should try to explain what the student should investigate.

---

## Feedback Examples

### Missing Power Source

"Your circuit needs a power source. Try adding a battery."

### Open Switch

"Your switch is open, so the electrical path is broken. What happens if you close it?"

### Incomplete Path

"You're close! Electricity needs a complete path back to the battery."

### Unconnected Bulb

"Check the light bulb. Is it connected on both sides?"

### Working Circuit

"You did it! You created a complete circuit, so the bulb can turn on."

---

## Hint Levels

If possible, feedback may become more specific after repeated attempts.

### First Attempt

Give a general hint.

"Something is keeping the circuit from making a complete path."

### Second Attempt

Give a more specific hint.

"Take a closer look at the switch."

### Later Attempt

Provide a stronger explanation without automatically building the circuit for the student.

This may later connect with F10 AI Learning Assistant.

---

## Challenge Validation

Circuit challenges from F5 may have specific requirements.

Example challenge:

**Make one light bulb turn on using one battery.**

Validation may check:

- Correct required components exist
- A complete path exists
- Bulb is powered
- Challenge limits were followed

Another challenge may require:

- A switch
- A resistor
- Two bulbs
- A particular circuit type

Challenge rules should be stored separately from the general circuit logic where possible.

---

## Series Circuits

CircuitLore should support basic series circuits if the core circuit system is stable.

A series circuit has a single path through the required components.

Students should be able to observe that breaking that path stops the circuit.

---

## Parallel Circuits

Basic parallel circuits may be added if project scope allows.

Parallel circuits introduce multiple paths.

This will require more advanced circuit traversal and validation.

Parallel circuit support should not prevent completion of the simpler required circuit system.

---

## Invalid Circuit Data

The logic should safely handle unexpected data.

Examples:

- Missing component ID
- Connection to a component that no longer exists
- Invalid terminal
- Duplicate connection
- Missing component type
- Unknown component type

The application should not crash because of invalid circuit data.

---

## Separation of Visuals and Logic

Circuit validation should not depend on where a component appears on the screen.

For example, placing a bulb visually next to a battery does not mean they are connected.

The logic should use the actual circuit data.

This separation will make the system easier to test and maintain.

---

## Educational Accuracy

The circuit system will intentionally simplify some real electrical behavior.

However, simplified behavior should not teach students something that is clearly incorrect.

Electrical concepts used in the simulation should be researched and checked against reliable educational sources.

---

## AI and Circuit Logic

AI should not determine whether the basic circuit works.

Core circuit validation should use predictable application logic.

The AI Learning Assistant may use the validation result to provide additional explanations or hints.

For example:

Circuit Logic detects:
`open_switch`

AI may explain:
"Your switch is currently open. An open switch creates a break in the path, so current cannot travel through the complete circuit."

The application must still work if the AI service is unavailable.

---

## Performance

Circuit validation should happen quickly enough that students receive feedback without a noticeable delay.

Basic circuits should not require an outside API to determine whether they work.

---

## Accessibility

Circuit results should not be communicated only through animation or color.

For example, when the bulb turns on, the application may also display:

**Bulb: ON**

Feedback should also be available as readable text.

---

## Acceptance Criteria

F8 will be considered complete when:

1. CircuitLore can read the components in a circuit.
2. CircuitLore can read connections between components.
3. A basic complete circuit can be detected.
4. An incomplete circuit can be detected.
5. Open and closed switch states affect the circuit.
6. A bulb turns on when the required circuit is complete.
7. A bulb remains off when the required circuit is incomplete.
8. Common circuit problems produce useful feedback.
9. Circuit challenges can define success conditions.
10. Challenge completion can be returned to F5 and F6.
11. Invalid circuit data does not crash the application.
12. Circuit validation works independently from AI.
13. Circuit logic does not depend on visual component position.
14. Basic circuit behavior is educationally accurate.

---

## Testing

Test:

- Battery and bulb with complete path
- Missing battery
- Missing bulb
- Missing wire/connection
- Open circuit
- Closed circuit
- Open switch
- Closed switch
- Disconnected bulb
- Disconnected battery terminal
- Extra unused component
- Component removal
- Connection removal
- Valid challenge
- Invalid challenge
- Invalid component ID
- Invalid connection
- Duplicate connection
- Series circuit if implemented
- Parallel circuit if implemented

Circuit logic should have automated tests where practical because the validation rules should produce predictable results.

---

## Dependencies

F8 depends heavily on:

- F7 Virtual Circuit Lab

It also connects with:

- F4 Electricity Lessons
- F5 Interactive Activities and Quizzes
- F6 Student Progress
- F10 AI Learning Assistant

---

## Out of Scope for F8

The first version does not need to provide:

- Professional circuit simulation
- Complex AC calculations
- Advanced electronics
- Every possible electrical component
- Professional schematic analysis
- Exact simulation of all real-world electrical behavior

The goal is to support the electrical concepts taught in CircuitLore.

---

## Definition of Done

F8 is done when CircuitLore can take a basic circuit created in F7, analyze its components and connections, determine whether a valid electrical path exists, update the appropriate component states, and provide understandable feedback to the student.

The logic should be predictable, testable, educationally useful, and independent from the visual position of components.