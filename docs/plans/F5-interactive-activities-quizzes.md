# F5 — Interactive Activities and Quizzes

## Purpose

CircuitLore should give students opportunities to interact with what they are learning instead of only reading or watching.

This feature handles the activities, questions, quizzes, challenges, feedback, and results that appear throughout the learning journey.

Activities should feel like part of the CircuitLore experience rather than a traditional test.

---

## Main Goals

Activities and quizzes should:

- Check basic understanding
- Give students practice
- Encourage students to think before answering
- Provide immediate feedback
- Allow students to learn from mistakes
- Save important results
- Connect to the lesson being taught

The goal is learning, not simply earning a score.

---

## Activity Types

CircuitLore may use several types of activities.

### Multiple Choice

Students select an answer from several choices.

Example:

Which material is a conductor?

- Rubber
- Plastic
- Copper
- Glass

---

### True or False

Students decide whether a statement is true or false.

Example:

A closed circuit provides a complete path for electrical current.

---

### Prediction Activities

Students predict what will happen before seeing the result.

Example:

"What do you think will happen when the switch opens?"

After choosing, the student sees the result and receives an explanation.

---

### Matching

Students match related information.

Examples:

- Component → purpose
- Historical figure → discovery
- Material → conductor or insulator
- Electrical term → meaning

---

### Sorting

Students place items into groups.

Example:

**Conductors**

- Copper
- Aluminum

**Insulators**

- Rubber
- Plastic

---

### Interactive Experiment

Students interact with an object or demonstration before answering a question.

Examples:

- Open a switch
- Select a material
- Change resistance
- Complete a simple electrical path

---

### Circuit Challenge

Students receive a goal that must be completed using the virtual circuit lab.

Example:

"Build a circuit that turns on the light bulb."

The detailed circuit-building system will be handled by F7 and F8.

---

## Quiz Structure

A lesson may end with a short quiz.

Quizzes should be kept reasonably short for the target age group.

A quiz may include:

- Multiple-choice questions
- True/false questions
- Matching
- Prediction questions
- Interactive questions

Not every lesson needs the exact same quiz format.

---

## Question Data

A question may need information such as:

- Question ID
- Lesson ID
- Question type
- Question text
- Possible answers
- Correct answer
- Explanation
- Difficulty if needed
- Display order

The final database structure will be decided later.

---

## Immediate Feedback

Students should receive useful feedback after answering.

### Correct Answer

The application should confirm the answer and briefly explain why it is correct.

Example:

"That's right! Copper is a conductor because electrical charge can move through it easily."

### Incorrect Answer

The application should avoid simply saying "Wrong."

Instead, it should provide a short explanation or hint.

Example:

"Not quite. Think about which materials are commonly used inside electrical wires."

The student may then be allowed to try again.

---

## Retry Options

Students should usually be allowed to retry learning activities.

Retries should help students learn rather than punish them.

Depending on the activity, CircuitLore may:

- Allow an immediate retry
- Give a hint before retrying
- Show an explanation after several attempts
- Allow the entire quiz to be taken again

---

## Quiz Results

After completing a quiz, students should receive simple results.

Possible information:

- Questions answered correctly
- Questions that need more practice
- Completion status
- Encouraging feedback

The results page should not feel overly focused on grades.

The goal is to show students what they understand and what they may want to review.

---

## Scoring

CircuitLore may calculate a simple score for quizzes.

For example:

8 / 10 correct

or

80%

Scores may be stored for progress tracking.

However, a low score should not make the student feel like they have failed the entire learning journey.

Depending on the lesson, students may be able to retry before continuing.

---

## Passing Requirements

Some important lessons may require a basic level of understanding before the next section unlocks.

If a passing score is used, the requirement should be reasonable.

Example:

A student may need to answer 70% of the questions correctly or successfully complete the required activity.

The exact requirements can be adjusted during development and testing.

---

## Saved Results

Important activity and quiz results should be saved to the student's account.

Possible saved information:

- Student ID
- Quiz ID
- Score
- Completion status
- Number of attempts
- Completion date

Detailed progress storage will be handled in F6.

---

## Historical Activities

Activities may also appear inside F3 Historical Storytelling.

Examples:

- Predict what will happen in an experiment
- Match a historical figure to a discovery
- Put discoveries in order
- Identify what an experiment demonstrated

These should remain short and connected to the story.

---

## Lesson Activities

Activities inside F4 Electricity Lessons may include:

- Identifying components
- Choosing conductors and insulators
- Opening and closing a circuit
- Comparing voltage
- Changing resistance
- Identifying series and parallel circuits

---

## Circuit Challenges

Circuit challenges will connect F5 with the virtual circuit lab.

A challenge should include:

- Goal
- Available components
- Instructions
- Success condition
- Feedback
- Completion status

Example:

### Challenge

Make the light bulb turn on.

### Available Components

- 1 battery
- Wires
- 1 light bulb

### Success

The student creates a valid closed circuit and the bulb turns on.

More detailed validation will be handled in F8.

---

## Feedback Style

Feedback should match CircuitLore's friendly educational style.

Feedback should be:

- Short
- Clear
- Encouraging
- Useful
- Age appropriate

It should avoid making students feel embarrassed for choosing an incorrect answer.

---

## AI Assistance

The AI Learning Assistant from F10 may eventually provide additional hints.

AI should not automatically provide the correct answer.

A possible progression could be:

1. Student answers incorrectly.
2. CircuitLore provides normal built-in feedback.
3. Student tries again.
4. Student may request an additional hint.
5. AI may provide a simple explanation if appropriate.

The core quiz system must still work without AI.

---

## Accessibility

Activities should consider:

- Keyboard controls
- Clear focus indicators
- Readable instructions
- Alternatives to drag-and-drop where needed
- Feedback that does not depend only on color
- Clear labels
- Screen-reader-friendly text where possible

For example, correct and incorrect answers should not be shown using only green and red.

---

## Error Handling

The system should handle:

- Question fails to load
- Answer fails to submit
- Result fails to save
- Missing question data
- Invalid quiz
- Lost network connection

Students should receive a simple message and an option to retry when possible.

---

## Acceptance Criteria

F5 will be considered complete when:

1. Students can complete questions and activities.
2. CircuitLore supports more than one question type.
3. Students receive immediate feedback.
4. Incorrect answers provide useful guidance.
5. Students can retry appropriate activities.
6. Lessons can contain short quizzes.
7. Quiz results can be calculated.
8. Important results can be saved.
9. Activities connect to the lesson being taught.
10. Historical sections can include small activities.
11. Circuit challenges can connect to the circuit lab.
12. Activities are understandable for the target age group.
13. The activity system works without requiring AI.

---

## Testing

Test:

- Correct answer
- Incorrect answer
- Retry
- Multiple attempts
- Quiz completion
- Score calculation
- Saving quiz results
- Returning to a completed quiz
- Missing question
- Failed result save
- Keyboard navigation
- Different question types
- Different screen sizes

Also test whether instructions and feedback are understandable to the target users.

---

## Dependencies

F5 depends on:

- F2 Learning Journey
- F3 Historical Storytelling
- F4 Electricity Lessons
- F6 Student Progress

Circuit challenges will also depend on:

- F7 Virtual Circuit Lab
- F8 Circuit Logic and Feedback

Optional AI hints will depend on:

- F10 AI Learning Assistant

---

## Out of Scope for F5

F5 does not handle:

- User authentication
- Overall learning progress
- Circuit simulation logic
- Parent/teacher reports
- AI implementation
- Historical content research

Those belong to their own features.

---

## Definition of Done

F5 is done when students can complete interactive activities and quizzes throughout CircuitLore, receive useful feedback, retry when appropriate, and have important results saved to their learning progress.

The activities should support learning and feel like part of the CircuitLore experience rather than simply being traditional tests.