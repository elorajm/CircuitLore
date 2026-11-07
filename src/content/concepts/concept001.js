// Block kinds: guide (fictional narrator), scene (imagined example), science (modern explanation).
// Science was checked against the Wikipedia articles on the triboelectric effect and electric current,
// plus standard physics: electrons carry charge in metal wires, and nuclei stay fixed. Have a teacher
// or science reviewer check it before classroom use (see F4 plan).
const concept001 = {
  lessonId: 'concept-001',
  steps: [
    {
      id: 'tiny-pieces',
      type: 'story',
      stepLabel: 'Welcome',
      title: 'Tiny Pieces That Carry Charge',
      blocks: [
        {
          kind: 'guide',
          text: "Hi, it's Quill again! The pulling and sticking from the last lesson all come from one idea: electric charge.",
        },
        {
          kind: 'science',
          text: 'Everything around you is made of tiny atoms. Each atom holds even smaller particles: protons, which carry positive charge; electrons, which carry negative charge; and neutrons, which carry no charge.',
        },
        {
          kind: 'guide',
          text: 'Most everyday objects have as many positive charges as negative charges, so they seem neutral. What happens when that balance changes?',
        },
      ],
    },
    {
      id: 'moving-electrons',
      type: 'story',
      stepLabel: 'Moving electrons',
      title: 'Electrons Are the Movers',
      blocks: [
        {
          kind: 'science',
          text: 'Protons stay in the nucleus, the dense center of each atom. In everyday materials such as metal wires, electrons are the charges that move, so when we talk about charge moving, we usually mean electrons moving.',
        },
        {
          kind: 'science',
          text: 'When two materials rub together, some electrons can move from one material to the other. The material that gains electrons becomes negatively charged. The material that loses electrons becomes positively charged. Scientists are still refining the details of this process, but the basic idea is well tested.',
        },
        {
          kind: 'scene',
          text: 'Imagine two balloons, each rubbed with wool. Both gain extra electrons, so both are negatively charged. Now bring them close together.',
        },
        {
          kind: 'science',
          text: 'Like charges repel, which means they push apart. Opposite charges attract, which means they pull together.',
        },
      ],
    },
    {
      id: 'static',
      type: 'story',
      stepLabel: 'Static',
      title: 'Static: Charge That Stays Put',
      blocks: [
        {
          kind: 'science',
          text: 'Static electricity is charge that builds up on an object and stays there. The word static means not moving.',
        },
        {
          kind: 'guide',
          text: 'Rub a balloon on your hair and the charge stays on the balloon for a while. Near a wall, the charges in the wall shift, and the balloon pulls on it.',
        },
        {
          kind: 'science',
          text: 'A static spark happens when built-up charge finds a path to somewhere with fewer charges, such as a metal doorknob. The charge crosses in one quick spark, and the built-up charge is released.',
        },
      ],
    },
    {
      id: 'current',
      type: 'story',
      stepLabel: 'Current',
      title: 'Current: Charge on the Move',
      blocks: [
        {
          kind: 'science',
          text: 'Electric current is charge that keeps moving through a material. To keep moving, the charge needs a complete path: a loop from one end of the battery, through the wire and the bulb, and back.',
        },
        {
          kind: 'guide',
          text: 'Think of water flowing around a closed pipe loop with a pump. This is only a comparison, since charge is not water, but the same rule applies: the flow needs a complete loop.',
        },
        {
          kind: 'science',
          text: 'Materials like copper wire let charge flow easily. They are called conductors. Materials like rubber and plastic do not let charge flow easily. They are called insulators.',
        },
        {
          kind: 'science',
          text: 'Opening a switch breaks the loop. Charge stops moving, and the bulb goes dark.',
        },
      ],
    },
    {
      id: 'static-or-current',
      type: 'activity',
      stepLabel: 'Activity',
      title: 'Static or Current?',
      activityId: 'static-or-current',
      intro:
        'Read each example. Decide whether it is static electricity (charge that builds up and stays in one place) or electric current (charge that keeps moving through a complete path).',
    },
    {
      id: 'today',
      type: 'story',
      stepLabel: 'Today',
      title: 'Both Kinds in Your Life',
      blocks: [
        {
          kind: 'guide',
          text: 'A lightning bolt is a giant static spark. Charge built up in storm clouds and then jumped to the ground.',
        },
        {
          kind: 'science',
          text: 'A phone charger uses current. Charge flows through a closed path made of the charger, the cable, and the phone battery, which slowly stores energy.',
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
          prompt: 'Which tiny particle moves from one material to another when you rub a balloon on your hair?',
          options: ['Proton', 'Electron', 'Neutron', 'Atom'],
          answerIndex: 1,
          explanation:
            'Electrons are the particles that move when materials rub together. Protons stay in the nucleus at the center of their atoms.',
        },
        {
          id: 'q2',
          prompt: 'What is the main difference between static electricity and electric current?',
          options: [
            'Static electricity is charge that builds up and stays in place. Current is charge that keeps moving through a complete path.',
            'Static electricity only happens in metal. Current only happens in plastic.',
            'Current is charge that stands still. Static electricity is charge that flows through wires.',
            'There is no difference. They are two names for the same thing.',
          ],
          answerIndex: 0,
          explanation:
            'Static charge stays on an object until it moves away, for example in a spark. Current keeps moving as long as its path is closed.',
        },
        {
          id: 'q3',
          prompt:
            'Two balloons rubbed with wool both end up with a negative charge. What happens when you bring them close together?',
          options: [
            'They attract and stick together',
            'They repel and push apart',
            'They cancel out and lose their charge',
            'Nothing happens, because balloons have no charge',
          ],
          answerIndex: 1,
          explanation:
            'Like charges repel, so the two negative balloons push apart. Opposite charges attract.',
        },
      ],
    },
  ],
}

export default concept001
