# F11 — Animation and Visual Experience

## Purpose

CircuitLore should feel like an interactive educational adventure rather than a normal school website.

The Animation and Visual Experience feature controls the overall visual style, historical characters, environments, transitions, educational animations, and visual feedback used throughout the application.

The visual style should help students feel like they are moving through the history of electricity and eventually into the modern world.

---

## Visual Style

CircuitLore will use a realistic-cartoon style.

The goal is to combine:

- Realistic people and environments
- Cartoon-style warmth and expression
- Clear educational visuals
- Colorful but not childish design
- Consistent characters and environments

The application is intended for students around ages 10–14, so it should feel engaging without looking like it was designed for very young children.

---

## Historical Characters

Historical figures should be recognizable while matching the CircuitLore art style.

Characters may:

- Enter a scene
- Introduce themselves
- Change facial expressions
- Point toward objects
- Demonstrate experiments
- React to student choices
- Guide students toward the next activity

Character movement should support the lesson rather than distract from it.

---

## Character Consistency

A historical figure should look consistent throughout CircuitLore.

For example, if a character appears in multiple scenes, important features should remain consistent:

- Face
- Hair
- Clothing
- General proportions
- Art style

Character reference images may be created to help maintain consistency.

---

## Historical Accuracy

Historical characters and environments should be inspired by reliable references when possible.

Important details may include:

- Clothing
- Time period
- Laboratory equipment
- Tools
- Buildings
- Technology

CircuitLore does not need to recreate every historical detail perfectly, but visuals should avoid obvious historical inaccuracies.

---

## Historical Environments

Early CircuitLore scenes may include environments such as:

- Historical laboratories
- Workshops
- Studies
- Outdoor experiments
- Early electrical demonstrations

These environments should help establish where the student is in the story.

---

## Character Dialogue

When a character speaks, the interface may use:

- Dialogue box
- Character portrait
- Full character
- Speech bubble
- Caption area

Students should control when they move to the next part of the dialogue.

Dialogue should not automatically disappear before the student has time to read it.

---

## Educational Animation

Animations should help explain electricity.

Possible examples include:

- Showing a circuit path
- Opening and closing a switch
- Lighting a bulb
- Showing attraction and repulsion
- Demonstrating a historical experiment
- Showing the effect of changing resistance

Animation should make an idea easier to understand.

It should not exist only for decoration.

---

## Historical-to-Modern Transition

One of CircuitLore's main visual ideas is showing the development of electricity over time.

The environment should gradually change as the student moves through the learning journey.

Example:

Historical Discovery
↓
Early Electrical Experiment
↓
Understanding Electrical Concepts
↓
Early Electrical Technology
↓
Modern Electricity
↓
Virtual Circuit Lab

Transitions may use:

- Timeline movement
- Environmental changes
- Changing equipment
- Scene transitions
- Lighting changes
- Animated technology development

The transition should help students understand that modern electrical technology developed over time.

---

## Modern Environments

Later sections of CircuitLore should visually connect electricity to the student's world.

Possible environments include:

- Modern home
- Classroom
- Electrical system
- Technology workspace
- Circuit laboratory
- Renewable energy environment

Modern scenes should still use the same overall CircuitLore visual style.

---

## Virtual Circuit Lab Style

The Virtual Circuit Lab should feel connected to the rest of CircuitLore.

Components should be:

- Easy to recognize
- Visually consistent
- Clearly labeled
- Large enough to interact with
- Simple enough to understand

The circuit lab does not need to look like professional engineering software.

It should look like an educational workspace designed for students.

---

## Component States

Electrical components should have clear visual states.

Examples:

### Light Bulb

- Off
- On

### Switch

- Open
- Closed

### Selected Component

- Clearly selected

### Connection Point

- Available
- Connected

Visual states should not depend only on color.

---

## Feedback Animation

Small animations may help confirm student actions.

Examples:

- Lesson completion
- Challenge completion
- New section unlocked
- Correct answer
- Circuit successfully completed

Animations should be short and should not interrupt the learning experience.

---

## Scene Transitions

Moving between major sections should feel smooth.

Possible transitions include:

- Fade
- Slide
- Timeline movement
- Camera-style movement
- Environment transformation

Transitions should remain short enough that students do not become frustrated waiting for them.

---

## Animation Technology

The exact animation technology will be researched during development.

Possible approaches may include:

- CSS animations
- JavaScript animation
- SVG animation
- Canvas
- Animation libraries
- Pre-created visual assets

Different techniques may be used for different parts of CircuitLore.

The simplest technology that meets the learning goal should be preferred.

---

## AI-Generated Visual Assets

AI image tools may be explored for creating concept art or visual assets.

If AI-generated assets are used, they should be reviewed for:

- Character consistency
- Historical accuracy
- Appropriate appearance
- Visual quality
- Strange or incorrect details
- Consistency with the CircuitLore style

AI-generated visuals should not automatically be assumed to be historically accurate.

---

## Asset Organization

Visual assets should be organized clearly.

Possible organization:

assets/
  characters/
  environments/
  components/
  icons/
  animations/

File names should be understandable and consistent.

Large unused assets should not remain in the final application.

---

## Performance

Animations and images should not make CircuitLore unnecessarily slow.

Visual assets should be optimized where possible.

The application should consider:

- Image size
- Animation size
- Loading time
- Number of assets loaded at once
- Performance on average devices

Animations should not prevent the student from using the application while unnecessary assets are loading.

---

## Reduced Motion

CircuitLore should support students who prefer reduced motion.

When reduced motion is enabled:

- Large transitions should be reduced or removed.
- Important information should still appear.
- Learning activities should remain usable.
- Animation should never be required to understand the lesson.

---

## Accessibility

Visual design should consider:

- Readable text
- Sufficient contrast
- Alternative text
- Keyboard navigation
- Reduced motion
- Clear focus indicators
- Information that does not rely only on color
- Text alternatives for important animation

Decorative images should not create unnecessary screen-reader noise.

---

## Responsive Design

CircuitLore should work across reasonable screen sizes.

The visual experience may adjust depending on available space.

For example:

Desktop:
Character and lesson content may appear side by side.

Tablet:
Layout may become more compact.

Mobile:
Content may stack vertically.

The Virtual Circuit Lab may require a larger screen for the best experience.

---

## Visual Consistency

CircuitLore should use a consistent design system.

This may include:

- Typography
- Buttons
- Cards
- Dialogue boxes
- Icons
- Spacing
- Border styles
- Background treatments
- Component design

A small style guide may be created during development.

---

## Acceptance Criteria

F11 will be considered complete when:

1. CircuitLore has a consistent visual direction.
2. Historical scenes use the realistic-cartoon style.
3. Historical characters are visually consistent.
4. Characters can visually support storytelling.
5. Historical environments support the learning content.
6. Educational animations help explain concepts.
7. The experience visually transitions from history toward modern electricity.
8. Modern scenes match the overall CircuitLore style.
9. Circuit Lab components have clear visual states.
10. Important student actions receive clear visual feedback.
11. Animations do not block students from progressing.
12. Reduced-motion behavior is supported.
13. Important information is understandable without animation.
14. Visual assets are reasonably optimized.
15. The interface remains usable across appropriate screen sizes.

---

## Testing

Test:

- Historical scene loading
- Character display
- Character consistency
- Dialogue display
- Educational animations
- Scene transitions
- Historical-to-modern transition
- Bulb states
- Switch states
- Challenge completion feedback
- Reduced-motion mode
- Keyboard navigation
- Slow connection
- Different screen sizes
- Missing visual asset

Also review visuals for:

- Age appropriateness
- Historical accuracy
- Consistency
- Readability
- Educational usefulness

---

## Dependencies

F11 connects closely with:

- F2 Learning Journey
- F3 Historical Storytelling
- F4 Electricity Lessons
- F5 Interactive Activities and Quizzes
- F7 Virtual Circuit Lab
- F8 Circuit Logic and Feedback

---

## Out of Scope for F11

F11 does not require:

- Movie-quality animation
- Fully animated characters in every scene
- Photorealistic graphics
- 3D environments
- Complex video-game animation
- Animation for every interaction

The goal is a polished educational web experience that can realistically be completed within the senior project.

---

## Definition of Done

F11 is done when CircuitLore has a consistent realistic-cartoon visual style that supports the historical storytelling, electricity lessons, and circuit-building experience.

Students should be able to visually experience the transition from the history of electricity into modern electrical technology without animations interfering with usability, accessibility, or performance.