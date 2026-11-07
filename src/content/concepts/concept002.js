// Block kinds: guide (fictional narrator), scene (imagined example), science (modern explanation).
// Science was checked against the Wikipedia articles on electrical networks, electrical loads,
// electrical conductors and insulators, and Kirchhoff's circuit laws (charge conservation).
// The statement that a bulb uses energy rather than charge follows from charge conservation.
// Have a teacher or science reviewer check it before classroom use (see F4 plan).
const concept002 = {
  lessonId: 'concept-002',
  circuitLab: {
    note: 'Build the same loop yourself. Connect the battery, switch, and bulbs, then break the loop and watch the bulb go dark.',
  },
  steps: [
    {
      id: 'charge-on-the-move',
      type: 'story',
      stepLabel: 'Welcome',
      title: 'Charge on the Move',
      blocks: [
        {
          kind: 'guide',
          text: "Hi, it's Quill! In the last lesson, charge stayed in one place. Now let's see what happens when charge keeps moving.",
        },
        {
          kind: 'science',
          text: 'Electric current is the flow of electric charge. Scientists measure how much charge passes a point each second. That measurement is the current, and its unit is the ampere, or amp.',
        },
        {
          kind: 'guide',
          text: 'Picture students walking through a doorway. The number of students who pass each minute is like the current through a wire.',
        },
      ],
    },
    {
      id: 'parts-of-a-circuit',
      type: 'story',
      stepLabel: 'Parts',
      title: 'The Parts of a Circuit',
      blocks: [
        {
          kind: 'science',
          text: 'A circuit is a loop that current can travel around. Most circuits have three kinds of parts: a power source, a conductor, and an electrical load.',
        },
        {
          kind: 'science',
          text: 'A power source, such as a battery, supplies the energy that pushes charge around the circuit.',
        },
        {
          kind: 'science',
          text: 'A conductor, such as copper wire, is a path that lets charge flow with very little energy lost. Metals are good conductors because they have electrons that can move freely.',
        },
        {
          kind: 'science',
          text: 'An electrical load, such as a light bulb or a motor, is the part that uses electrical energy. A light bulb changes electrical energy into light and heat.',
        },
        {
          kind: 'science',
          text: 'An insulator, such as plastic or rubber, has very few free charges, so it blocks the flow of charge.',
        },
      ],
    },
    {
      id: 'complete-path',
      type: 'story',
      stepLabel: 'Complete path',
      title: 'Why the Loop Must Be Complete',
      blocks: [
        {
          kind: 'science',
          text: 'Current needs a complete path. It must travel from the power source, through the load, and back to the power source.',
        },
        {
          kind: 'guide',
          text: 'Think of a toy train on a loop of track. If one piece of track is missing, the train stops at the gap. Current stops in the same way.',
        },
        {
          kind: 'science',
          text: 'When the loop is broken, the circuit is open. Current stops, and the light bulb goes dark.',
        },
        {
          kind: 'science',
          text: 'The bulb does not use up the charge. The same amount of charge that enters the bulb leaves it. The bulb uses energy, which it changes into light and heat.',
        },
      ],
    },
    {
      id: 'build-the-loop',
      type: 'activity',
      stepLabel: 'Activity',
      title: 'Build the Loop',
      activityId: 'build-the-loop',
      intro:
        'Fill the top wire and the bottom wire with copper wire or plastic strips. Watch the bulb. Then break the loop to see what happens.',
    },
    {
      id: 'today',
      type: 'story',
      stepLabel: 'Today',
      title: 'Loops in Your Home',
      blocks: [
        {
          kind: 'guide',
          text: 'A light switch is a switch placed in the loop. When you turn it on, the loop closes and current flows to the bulb. When you turn it off, the loop opens.',
        },
        {
          kind: 'science',
          text: 'A battery-powered toy car works the same way. Current flows from the battery, through the motor, and back to the battery, which keeps the motor turning while the loop is closed.',
        },
      ],
    },
    {
      id: 'knowledge-check',
      type: 'quiz',
      stepLabel: 'Knowledge check',
      title: 'Knowledge Check',
      intro: 'Answer all three questions, then check your answers. Explanations appear after you check. You can try again as many times as you like.',
      questions: [
        {
          id: 'q1',
          prompt: 'What is electric current?',
          options: [
            'Charge that is standing still on an object',
            'The flow of electric charge through a complete path',
            'The brightness of a light bulb',
            'Heat that a battery gives off',
          ],
          answerIndex: 1,
          explanation:
            'Current is the flow of charge. It needs a complete path so the charge can keep moving.',
        },
        {
          id: 'q2',
          prompt: 'Why did the bulb go dark when one gap was filled with plastic?',
          options: [
            'Plastic is an insulator, so it blocks the flow of charge and the loop is broken',
            'Plastic is a conductor that uses up the charge',
            'The battery was used up after one second',
            'Bulbs only work when copper wire touches them',
          ],
          answerIndex: 0,
          explanation:
            'Plastic has very few free charges, so charge cannot flow through it. An open loop stops the current.',
        },
        {
          id: 'q3',
          prompt: 'In the circuit, which part uses electrical energy and changes it into light?',
          options: [
            'The copper wire (conductor)',
            'The battery (power source)',
            'The light bulb (electrical load)',
            'The plastic strip (insulator)',
          ],
          answerIndex: 2,
          explanation:
            'A load is the part of a circuit that uses electrical energy. The bulb changes that energy into light and heat.',
        },
      ],
    },
  ],
}

export default concept002
