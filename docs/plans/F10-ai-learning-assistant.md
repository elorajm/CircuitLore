# F10 — AI Learning Assistant

## Purpose

The AI Learning Assistant gives students extra help when they are struggling with an electricity concept, activity, quiz question, or circuit challenge.

The AI should act more like a tutor than an answer generator.

The main CircuitLore lessons and circuit logic should still work without AI.

---

## Main Goals

The AI Learning Assistant should:

- Give age-appropriate explanations
- Provide hints
- Help students understand mistakes
- Explain electrical concepts in simpler ways
- Use information from the current lesson
- Help with circuit challenges
- Encourage students to think
- Avoid simply giving away answers

---

## Student Experience

Students may see an option such as:

**Need a Hint?**

or

**Ask CircuitLore for Help**

The student should not need to leave the learning experience to get help.

---

## Lesson Help

The AI may help explain concepts from the current lesson.

For example, a student learning about current may ask:

"Why does electricity need a complete path?"

The assistant should respond with a short explanation appropriate for the student's age.

Responses should focus on the concept currently being taught.

---

## Circuit Help

The AI may also help students when a circuit is not working.

F8 Circuit Logic should first determine what is wrong.

For example, F8 may detect:

- Open switch
- Missing battery
- Incomplete path
- Disconnected bulb

The AI can then use that information to create a helpful explanation.

Example:

"Take another look at your switch. Right now it is open, which creates a break in the path. What do you think would happen if you closed it?"

The AI should not be responsible for determining whether the circuit works.

---

## Hint Levels

Hints may become more helpful if a student continues to struggle.

### Hint 1

Give a small clue.

"Electricity needs a complete path. Check all of your connections."

### Hint 2

Give a more specific clue.

"Look closely at the switch. Is the path open or closed?"

### Hint 3

Explain the concept more clearly.

"An open switch creates a break in the circuit, so current cannot travel through the complete path."

The assistant should still avoid automatically solving the activity for the student.

---

## Quiz Help

AI assistance during quizzes should be limited.

The assistant may:

- Explain a term
- Restate a question in simpler language
- Give a small hint

The assistant should not immediately say:

"The correct answer is C."

Built-in quiz feedback from F5 should remain the main feedback system.

---

## Context

The AI should receive only the information needed to help with the current situation.

Possible context may include:

- Current lesson
- Concept being taught
- Student question
- Current activity
- Circuit validation result
- Previous hint level

The application should avoid sending unnecessary student information.

---

## Student Privacy

CircuitLore should not send unnecessary personal information to an AI service.

The AI should not need information such as:

- Student's full name
- Address
- Phone number
- Personal profile information
- Other unnecessary identifying information

The AI should primarily receive educational context.

---

## Response Style

AI responses should be:

- Short
- Friendly
- Clear
- Age appropriate
- Focused on electricity
- Helpful without being overwhelming

Responses should avoid unnecessary technical language.

If a technical term is necessary, it should be explained simply.

---

## Staying on Topic

The CircuitLore AI assistant is intended to help with electricity education.

It should not function as a general-purpose chatbot.

If a student asks an unrelated question, the assistant should redirect them back to the learning experience.

Example:

"I'm here to help you with CircuitLore and electricity. What part of your lesson can I help you understand?"

---

## Educational Accuracy

AI can sometimes produce incorrect information.

Because of this:

- Core lesson content will not depend on AI-generated facts.
- Scientific content will be based on researched sources.
- Common hints may use predefined responses when possible.
- AI responses should be limited to the educational context provided by CircuitLore.

AI should support the curriculum rather than create the curriculum.

---

## Safety

The assistant should not encourage students to perform dangerous electrical experiments in real life.

If a student asks about experimenting with household electricity, outlets, wiring, or another potentially dangerous electrical source, the assistant should redirect them toward the virtual CircuitLore activities and basic electrical safety.

CircuitLore should clearly separate virtual experiments from real-world electrical work.

---

## AI Service

The exact AI service will be selected during development.

The implementation may require:

- API access
- Environment variables
- Server-side requests
- Prompt instructions
- Structured responses
- Error handling
- Usage monitoring

API keys should never be exposed in client-side code or committed to GitHub.

---

## Prompt Design

The application will need clear instructions for the AI.

The prompt should tell the assistant:

- The intended student age range
- The current electricity topic
- The purpose of the assistant
- To keep responses short
- To provide hints before answers
- To stay on topic
- To avoid unsafe electrical instructions
- To avoid requesting personal information

Prompt design and testing will be part of this feature.

---

## Structured Information

Where possible, CircuitLore may send structured information rather than relying on the AI to guess what happened.

Example:

Current lesson:
Open and Closed Circuits

Problem detected:
Open switch

Hint level:
1

This gives the AI reliable context and reduces the chance of an unrelated response.

---

## Usage Limits

AI requests may have a cost.

CircuitLore should avoid unnecessary requests.

Possible limits include:

- Only request AI help when the student asks
- Limit repeated requests
- Use built-in hints before AI
- Avoid sending the same request repeatedly
- Use predefined explanations for common problems

The exact limits will depend on the AI service selected.

---

## AI Unavailable

CircuitLore must still work if the AI service is unavailable.

If the request fails, the student should receive a simple message such as:

"Extra help isn't available right now, but you can still use the lesson hints and try again."

The application should then provide normal built-in help where possible.

---

## Loading State

If an AI response takes time, the student should see a clear loading state.

Example:

**Thinking of a helpful hint...**

The student should not be able to accidentally send many identical requests while waiting.

---

## Error Handling

The system should handle:

- AI service unavailable
- Request timeout
- Invalid response
- Empty response
- Rate limit reached
- API error
- Unexpected response format

Technical API errors should not be displayed directly to students.

---

## AI Development Tools

AI tools will also be used during development of CircuitLore.

Possible uses include:

- Requirements planning
- Code assistance
- Debugging
- Test creation
- Brainstorming
- Documentation
- Reviewing implementation ideas

I should still understand and be able to explain the code and decisions used in the final project.

---

## Accessibility

AI responses should be provided as readable text.

The interface should support:

- Keyboard access
- Clear focus
- Readable response text
- Screen readers where possible

The AI assistant should not depend on voice interaction.

---

## Acceptance Criteria

F10 will be considered complete when:

1. A student can request additional help.
2. The AI receives relevant educational context.
3. Responses are appropriate for the target age group.
4. The assistant can provide lesson hints.
5. The assistant can use circuit validation information to provide hints.
6. The assistant avoids immediately giving away answers where possible.
7. The assistant stays focused on CircuitLore and electricity.
8. Unnecessary student personal information is not sent to the AI.
9. API credentials are protected.
10. AI errors are handled clearly.
11. CircuitLore continues working when AI is unavailable.
12. AI is not responsible for core circuit validation.
13. The assistant does not encourage unsafe real-world electrical experiments.

---

## Testing

Test:

- Basic lesson question
- Simple hint request
- Repeated hint request
- Circuit problem hint
- Open switch hint
- Missing connection hint
- Quiz help
- Unrelated question
- Unsafe electrical question
- Very long student question
- AI service failure
- Request timeout
- Invalid AI response
- Rate limit
- Missing API configuration
- Multiple rapid requests

AI responses should also be reviewed for:

- Accuracy
- Age appropriateness
- Helpfulness
- Safety
- Length
- Staying on topic

---

## Dependencies

F10 may use information from:

- F3 Historical Storytelling
- F4 Electricity Lessons
- F5 Interactive Activities and Quizzes
- F7 Virtual Circuit Lab
- F8 Circuit Logic and Feedback

The core application should not depend on F10 being available.

---

## Out of Scope for F10

The AI assistant will not:

- Replace the main lessons
- Determine whether a circuit works
- Control student progress
- Grade students
- Act as a general-purpose chatbot
- Provide instructions for dangerous real-world electrical work

---

## Definition of Done

F10 is done when a student can request extra help and receive a short, useful, age-appropriate explanation or hint based on the current CircuitLore activity.

The feature should support learning without replacing the lesson, giving away every answer, collecting unnecessary personal information, or becoming required for the rest of CircuitLore to function.