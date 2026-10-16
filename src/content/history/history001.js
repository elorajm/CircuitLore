// Block kinds: guide (fictional narrator), scene (imagined speech), history (what the sources say),
// science (modern explanation). The UI labels each kind so students can tell them apart.
const history001 = {
  lessonId: 'history-001',
  steps: [
    {
      id: 'welcome',
      type: 'story',
      stepLabel: 'Welcome',
      title: 'Welcome to the Electricity Mysteries',
      blocks: [
        {
          kind: 'guide',
          text: "Hi, I'm Quill, your lab-notebook guide. Quill is a fictional character. Everything else in this lesson is based on real history or science.",
        },
        {
          kind: 'guide',
          text: 'More than 2,500 years ago, people around the Mediterranean Sea noticed strange pulls. Let us travel back and see what they saw.',
        },
        {
          kind: 'history',
          text: 'Thales lived in Miletus, a busy trading city on the western coast of modern Turkey, around 600 BCE. Dates for Thales are estimates. Later Greek writers counted Thales among the first thinkers who tried to explain nature with reasons instead of myths.',
        },
      ],
    },
    {
      id: 'thales-amber',
      type: 'story',
      stepLabel: 'Thales and amber',
      title: 'A Yellow Stone That Pulls',
      blocks: [
        {
          kind: 'scene',
          text: 'Imagine Thales in a workshop. I rub a lump of amber with a piece of cloth, then hold it over tiny bits of straw. The straw lifts toward the amber. What invisible force is at work?',
        },
        {
          kind: 'history',
          text: 'The scene above is imagined. Later writers attribute to Thales the observation that rubbed amber attracts specks of dust and other light objects. No writings by Thales survive, so this attribution comes from later sources.',
        },
        {
          kind: 'history',
          text: 'Aristotle wrote in the 4th century BCE, about two centuries after Thales. He reported that Thales explained magnetic attraction as the work of a soul in the stone.',
        },
      ],
    },
    {
      id: 'two-mysteries',
      type: 'story',
      stepLabel: 'Two mysteries',
      title: 'Two Mysterious Pulls',
      blocks: [
        {
          kind: 'guide',
          text: 'Ancient people had two puzzles. A lodestone, a natural magnetic rock, pulls iron toward it. Rubbed amber pulls light things. Are these the same force?',
        },
        {
          kind: 'history',
          text: 'Lodestone is a naturally magnetic iron ore called magnetite. Lodestones were later used in early compasses, which line up with Earth’s magnetic field.',
        },
        {
          kind: 'history',
          text: 'In 1600, William Gilbert published De Magnete, a major study of magnets. He treated the two pulls as different effects. He named the rubbed-amber effect "electric," from the Greek word for amber, elektron.',
        },
        {
          kind: 'history',
          text: 'The English word "electricity" came later. Sir Thomas Browne first used it in 1646.',
        },
        {
          kind: 'guide',
          text: 'Gilbert gave the effect a name, but the explanation was still missing. Now let us test the effect ourselves.',
        },
      ],
    },
    {
      id: 'rub-and-attract',
      type: 'activity',
      stepLabel: 'Activity',
      title: 'Rub and Attract',
      intro: 'Rub the rod to build up charge. Then hold it near the paper bits and watch what happens.',
    },
    {
      id: 'today',
      type: 'story',
      stepLabel: 'Today',
      title: 'The Same Pull Today',
      blocks: [
        {
          kind: 'guide',
          text: 'You can see the same pull today. Rub a balloon on your hair and it may stick to a wall. Pull a wool sweater off in a dry room and it may crackle.',
        },
        {
          kind: 'science',
          text: 'Rubbing two materials can move tiny particles called electrons from one material to the other. The material that gains electrons becomes negatively charged. The material that loses them becomes positively charged.',
        },
        {
          kind: 'science',
          text: 'Opposite charges attract, and like charges repel. A charged balloon pulls on a neutral wall. The wall stays neutral overall, but its charges shift, so the side nearest the balloon becomes the opposite charge and is pulled closer.',
        },
        {
          kind: 'science',
          text: 'Scientists are still refining the details of how rubbing moves charge. The basic idea is well tested.',
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
          prompt: 'The ancient Greek word elektron, meaning amber, gave us which English word?',
          options: ['Electricity', 'Magnetism', 'Gravity', 'Thunder'],
          answerIndex: 0,
          explanation:
            'Gilbert formed the Latin word "electricus" from elektron, and the English word "electricity" followed.',
        },
        {
          id: 'q2',
          prompt: 'A balloon rubbed on your hair sticks to a wall. What did the rubbing do?',
          options: [
            'It made the balloon heavier',
            'It moved tiny charged particles (electrons) onto the balloon',
            'It turned the wall into a magnet',
            'It warmed the balloon until it stuck',
          ],
          answerIndex: 1,
          explanation:
            'Rubbing moved electrons between the hair and the balloon. The balloon now has a static charge, and it pulls on the neutral wall.',
        },
        {
          id: 'q3',
          prompt: 'Why can a charged rod pull small paper bits that have no overall charge?',
          options: [
            'The paper is secretly charged',
            'The paper is made of magnets',
            'The charges inside the paper shift, so the side nearest the rod becomes the opposite charge and is pulled in',
            'The paper gets heavier near the rod',
          ],
          answerIndex: 2,
          explanation:
            'The paper stays neutral overall, but its charges move. Opposite charges attract, so the nearest side is pulled toward the rod.',
        },
      ],
    },
  ],
}

export default history001
