// Block kinds: guide (fictional narrator), scene (imagined example), history (what the sources say),
// science (modern explanation). Wattages in the activity are illustrative, and the 1,800 W challenge
// limit is fictional. Science content should be checked by a teacher or science reviewer before classroom use.
const modern001 = {
  lessonId: 'modern-001',
  circuitLab: {
    note: 'Use the Circuit Lab to see how a switch controls a bulb in a loop. The lab uses a battery, not a wall outlet. A home uses much stronger electricity, so never try this with wall outlets.',
  },
  steps: [
    {
      id: 'flip-the-switch',
      type: 'story',
      stepLabel: 'Welcome',
      title: 'Flip a Switch, Light a Room',
      blocks: [
        {
          kind: 'guide',
          text: 'Hi, it’s Quill! You flip a switch and the light comes on. Where does that electricity come from, and how does it travel all the way to your home?',
        },
        {
          kind: 'science',
          text: 'Most electricity is made in large power plants, often far away from the homes that use it. Let’s follow it from the plant to your room.',
        },
      ],
    },
    {
      id: 'power-plants',
      type: 'story',
      stepLabel: 'Power plants',
      title: 'Making Electricity',
      blocks: [
        {
          kind: 'science',
          text: 'Most power plants use turbines to spin large magnets inside coils of wire. Moving a magnet near a wire pushes current through it.',
        },
        {
          kind: 'science',
          text: 'Turbines are turned by steam, flowing water, or wind. The spinning is what drives the electricity.',
        },
        {
          kind: 'history',
          text: 'In 1831, Michael Faraday showed that a changing magnetic field can push a current through a wire. This idea, called electromagnetic induction, is the basis of electric generators.',
        },
      ],
    },
    {
      id: 'long-distance',
      type: 'story',
      stepLabel: 'Long-distance lines',
      title: 'Traveling Across the Country',
      blocks: [
        {
          kind: 'science',
          text: 'Power lines carry electricity over long distances at very high voltage.',
        },
        {
          kind: 'science',
          text: 'For the same amount of power, a higher voltage needs a smaller current. A smaller current wastes less energy as heat in the wires, so less power is lost on the long trip.',
        },
        {
          kind: 'history',
          text: 'In 1888, Nikola Tesla received patents for AC motors that run on alternating current. AC can be carried efficiently over long distances, and transformers can raise or lower its voltage.',
        },
      ],
    },
    {
      id: 'transformers',
      type: 'story',
      stepLabel: 'Your neighborhood',
      title: 'Stepping the Voltage Down',
      blocks: [
        {
          kind: 'science',
          text: 'Before electricity reaches homes, a transformer lowers the voltage to a level that is safe for homes. Transformers sit at substations and on utility poles.',
        },
        {
          kind: 'science',
          text: 'In many homes in the United States, outlets supply about 120 volts. Many other countries use about 230 volts.',
        },
      ],
    },
    {
      id: 'household-circuits',
      type: 'story',
      stepLabel: 'Inside your home',
      title: 'Rooms, Outlets, and Breakers',
      blocks: [
        {
          kind: 'science',
          text: 'Inside a home, devices are wired side by side, so each light and outlet has a path of its own. Turning one device off does not switch off the others.',
        },
        {
          kind: 'science',
          text: 'A circuit breaker is a safety switch. If the current on a circuit gets too high, the breaker opens and cuts the power, which protects the wires from overheating.',
        },
      ],
    },
    {
      id: 'power-and-energy',
      type: 'story',
      stepLabel: 'Watts and watt-hours',
      title: 'Power Is How Fast, Energy Is How Much',
      blocks: [
        {
          kind: 'science',
          text: 'Power is how fast a device uses electricity. It is measured in watts (W). A 100-watt TV uses 100 watts while it is on.',
        },
        {
          kind: 'science',
          text: 'Energy is the total electricity used over time. It is measured in watt-hours (Wh): power multiplied by hours. A 100-watt TV that runs for 3 hours uses 300 watt-hours of energy.',
        },
        {
          kind: 'guide',
          text: 'Power tells you how fast a device is using electricity right now. Energy tells you how much it used in total.',
        },
      ],
    },
    {
      id: 'home-safety',
      type: 'story',
      stepLabel: 'Stay safe',
      title: 'Respect the Electricity',
      blocks: [
        {
          kind: 'science',
          text: 'Never put objects into outlets. Keep water away from electrical outlets and devices. Report damaged cords or plugs to an adult, and never use a cord that is cut or feels hot.',
        },
        {
          kind: 'guide',
          text: 'Electricity is useful, but it needs respect. Only qualified people should work on home wiring. Never experiment with wall outlets or household wiring.',
        },
      ],
    },
    {
      id: 'power-the-house',
      type: 'activity',
      stepLabel: 'Activity',
      title: 'Power the House',
      activityId: 'power-the-house',
      intro:
        'Your goals, in order. First, turn on appliances and watch the total wattage. Second, go over the 1,800 W challenge limit to trip the breaker. Third, reset the breaker. Last, turn on at least two appliances and stay under the limit. Remember: the 1,800 W limit is made up for this activity, and the wattages are illustrative.',
    },
    {
      id: 'today',
      type: 'story',
      stepLabel: 'Today',
      title: 'Lights That Use Less',
      blocks: [
        {
          kind: 'history',
          text: 'In 1879, Thomas Edison’s team tested a lamp with a carbon filament that glowed for hours. Most of the power in lamps like this turned into heat, not light.',
        },
        {
          kind: 'science',
          text: 'LED bulbs use much less power than those early lamps, but both still turn electricity into light.',
        },
        {
          kind: 'guide',
          text: 'The switch in your room works like the switch you closed in the Circuit Lab. A home uses stronger electricity, so the safety rules from earlier always apply.',
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
          prompt: 'How do power plants make most of their electricity?',
          options: [
            'By burning batteries',
            'By spinning a magnet inside coils of wire',
            'By rubbing materials together',
            'By storing sunlight in wires',
          ],
          answerIndex: 1,
          explanation:
            'Turbines spin magnets inside coils of wire. Moving a magnet near a wire pushes current through it.',
        },
        {
          id: 'q2',
          prompt: 'Why do power lines carry electricity at very high voltage?',
          options: [
            'High voltage makes the wires glow',
            'For the same power, high voltage needs a smaller current, which wastes less energy as heat',
            'High voltage makes electricity heavier',
            'High voltage stops electricity from flowing',
          ],
          answerIndex: 1,
          explanation:
            'A smaller current means less energy is lost as heat in the wires over long distances. Transformers change the voltage at each end.',
        },
        {
          id: 'q3',
          prompt: 'What does a circuit breaker do?',
          options: [
            'It stores extra power for later',
            'It cuts off the power when the current gets too high, to protect the wires',
            'It makes current flow faster',
            'It turns devices on automatically',
          ],
          answerIndex: 1,
          explanation:
            'A breaker opens the circuit when the current is too high. That protects the wires from overheating.',
        },
      ],
    },
  ],
}

export default modern001
