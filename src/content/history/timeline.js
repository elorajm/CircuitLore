// Dates are approximate where noted. historianNote holds caveats for disputed or partly documented claims.
const timelineMilestones = [
  {
    id: 'thales-amber',
    year: -600,
    displayDate: 'c. 600 BCE',
    person: 'Thales of Miletus',
    shortName: 'Thales and rubbed amber',
    summary: 'A thinker in a busy Greek trading city wondered why a rubbed stone could pull on light things.',
    story: [
      'Around 600 BCE, Miletus was a busy trading city on the coast of what is now Turkey. Ships arrived from across the Mediterranean, and its thinkers loved asking how the world works.',
      'Later writers credit Thales with noticing that amber could attract light things. No surviving writing by Thales describes this, so the story reaches us second-hand.',
      'Aristotle, writing about 250 years later, reported that Thales thought lodestones (magnets) had a soul, because a magnet moves iron. We now explain magnetic and amber pulls as forces, not signs of a soul. Still, Thales was asking the kind of question science would keep asking.',
    ],
    nextHook:
      'Amber was not the only strange material that could give people a jolt. Some sea creatures could too, and a Roman doctor wrote about one about 650 years later.',
    modernLink:
      'A balloon that sticks to a wall after you rub it on your hair shows the same kind of pull.',
    historianNote:
      'The amber story is traditional and not attributed to Thales in a surviving source. Modern estimates put his life at roughly 625 to 545 BCE, and the exact dates are uncertain.',
    lessonId: 'history-001',
    sources: [
      {
        label:
          'Aristotle, On the Soul (De Anima), Book I, chapter 2, on the lodestone, English translation (MIT Classics; Bekker line numbers not checked)',
      },
      {
        label: 'Wikipedia, "Thales of Miletus" (dates and note that no writings survive)',
        url: 'https://en.wikipedia.org/wiki/Thales_of_Miletus',
      },
    ],
  },
  {
    id: 'torpedo-fish',
    year: 47,
    displayDate: 'c. 47 CE',
    person: 'Scribonius Largus',
    shortName: 'The shocking fish',
    summary: 'A Roman doctor recommended an electric fish to ease pain, long before anyone knew what electricity was.',
    story: [
      'Ancient Mediterranean fishermen knew some fish could give a sudden, numbing jolt. The torpedo ray is a flat fish that lives in shallow seas, and it can produce an electric shock to stun prey and to defend itself.',
      'Around 47 CE, a doctor named Scribonius Largus wrote a medicine book that recommended an electric fish for headaches and gout.',
      'The doctor did not know the jolt was electricity. Still, people had noticed electric effects long before they could explain them.',
    ],
    nextHook:
      'More than 1,500 years passed before an English scientist began testing amber and magnets in a careful, repeatable way. That scientist was William Gilbert.',
    modernLink:
      'Electric eels and torpedo rays still use special cells that work like tiny batteries to hunt and defend themselves.',
    historianNote:
      'The source names headaches and gout. How the fish was applied is not confirmed in the sources checked, and the fish is commonly identified as a torpedo ray.',
    lessonId: null,
    sources: [
      {
        label:
          'Scribonius Largus, Compositiones (c. 47 CE), the recipe recommending an electric fish for headache and gout (Wikipedia summary)',
        url: 'https://en.wikipedia.org/wiki/Scribonius_Largus',
      },
    ],
  },
  {
    id: 'gilbert-electric',
    year: 1600,
    displayDate: '1600',
    person: 'William Gilbert',
    shortName: 'Gilbert names "electric"',
    summary: 'An English doctor studied magnets and rubbed amber, and linked the amber effect to the word "electric."',
    story: [
      'In the late 1500s, sailors trusted their compasses, but no one could fully explain why a magnetic needle points north. William Gilbert, a doctor in London who later became Queen Elizabeth I\'s physician, decided to find out by testing things himself.',
      'In 1600, Gilbert published De Magnete ("On the Magnet"). He proposed that Earth itself acts like a giant magnet, which helped explain why compasses point north.',
      'Gilbert also tested many materials. He found that rubbed amber pulls light objects, but a magnet only pulls iron. He gave this pull the name "electric," from the Greek word elektron, which means amber. That is where our word electricity comes from.',
    ],
    nextHook:
      'Gilbert gave the effect a name. More than 60 years later, a German mayor built a machine that could make it again and again.',
    modernLink:
      'Electricity still uses a name from the Greek word for amber. It powers the lights in your room and charges your phone.',
    historianNote:
      'Gilbert used the Neo-Latin word "electricus," meaning "like amber," for this effect. The word was older than Gilbert, but he is credited with first applying it to electrical attraction. The English word "electricity" comes from it.',
    lessonId: null,
    sources: [
      {
        label:
          'William Gilbert, De Magnete (London: Peter Short, 1600); publication details and summary from Wikipedia, primary text not checked',
        url: 'https://en.wikipedia.org/wiki/De_Magnete',
      },
      {
        label:
          'Wikipedia, "William Gilbert (physician)" (physician to Elizabeth I from 1601; use of the word "electricus")',
        url: 'https://en.wikipedia.org/wiki/William_Gilbert_(physician)',
      },
    ],
  },
  {
    id: 'guericke-sulfur-ball',
    year: 1663,
    displayDate: 'c. 1663',
    person: 'Otto von Guericke',
    shortName: 'A machine for sparks',
    summary: 'A city mayor built a machine that made electric charge by rubbing a spinning ball of sulfur.',
    story: [
      'Otto von Guericke was the mayor of Magdeburg, a city in Germany, and a skilled inventor. He is famous for an air pump that could remove air from a sealed container.',
      'By about 1663, he had built a machine with a large ball of sulfur that could spin. He rubbed the turning ball to build up charge. Light objects were drawn toward the ball, and sometimes pushed away again.',
      'This was a big step. Guericke\'s machine could make charge again and again, so scientists could study it.',
    ],
    nextHook:
      'Guericke\'s machine made charge, but nobody yet knew how electric charge moves. More than 60 years later, an English experimenter began testing which materials let it travel.',
    modernLink:
      'Photocopiers and some air filters still use static electricity to pull tiny particles toward a surface.',
    historianNote:
      'Guericke\'s preface to Experimenta Nova is dated 1663, so the machine predates that. The book was published in 1672. Spark and glow effects are not confirmed in the sources checked for this review.',
    lessonId: null,
    sources: [
      {
        label:
          'Otto von Guericke, Experimenta Nova (preface dated 14 March 1663; published 1672), Wikipedia summary',
        url: 'https://en.wikipedia.org/wiki/Otto_von_Guericke',
      },
    ],
  },
  {
    id: 'gray-conductors',
    year: 1729,
    displayDate: '1729',
    person: 'Stephen Gray',
    shortName: 'Electricity that travels',
    summary: 'Stephen Gray found that electric charge can travel along some materials but not others.',
    story: [
      'In the 1720s, Stephen Gray, an English experimenter, studied electric charge. At the time, charge seemed to stay wherever it was made.',
      'In 1729, Gray sent charge along a thread about 800 feet long. Silk supports kept the charge from leaking away, while metal supports drained it.',
      'This showed that some materials carry electric charge and others block it. Today we call them conductors and insulators. Those terms are often credited to Desaguliers, a later experimenter. We still use these words for metal wires and rubber coatings.',
    ],
    nextHook:
      'Gray showed that charge can move. That raised a new question: is there only one kind of electricity? A French scientist was about to test that idea.',
    modernLink:
      'Copper wires carry current in your home, and plastic or rubber coverings keep you from touching it.',
    historianNote:
      'Gray was not a member of the Royal Society. His results reached the Society through other members, such as Granville Wheler.',
    lessonId: null,
    sources: [
      {
        label:
          'Stephen Gray, experiments of 1729 on conduction (Wikipedia summary; original Royal Society papers not checked)',
        url: 'https://en.wikipedia.org/wiki/Stephen_Gray_(scientist)',
      },
      {
        label:
          'Jean-Théophile Desaguliers, A Dissertation concerning Electricity (1742), on the terms conductor and insulator (Wikipedia summary; primary text not checked)',
        url: 'https://en.wikipedia.org/wiki/Jean-Th%C3%A9ophile_Desaguliers',
      },
    ],
  },
  {
    id: 'du-fay-two-kinds',
    year: 1733,
    displayDate: 'c. 1733',
    person: 'Charles François de Cisternay du Fay',
    shortName: 'Two kinds of electricity',
    summary: 'Charles du Fay found that electricity seems to come in two opposite kinds.',
    story: [
      'Around 1733, Charles François de Cisternay du Fay, a French scientist, rubbed many different materials together to see how they reacted.',
      'He found that electric effects seemed to come in two types. Charges of the same type pushed each other away, while different types pulled together.',
      'Du Fay called the two kinds "vitreous," from glass, and "resinous," from resin. Later scientists explained the two kinds in different ways, but the idea of opposite kinds of charge is still used today.',
    ],
    nextHook:
      'Opposite charges could be separated, and scientists wanted to save them. In 1745, two researchers found a way to trap electricity in a glass jar.',
    modernLink:
      'Like charges push apart and opposite charges pull together. That is why a charged comb can lift tiny bits of paper.',
    historianNote:
      'Du Fay\'s names "vitreous" and "resinous" were later judged to be mislabelled, but the idea of two opposite kinds of charge survived. The two-fluid explanation he proposed was replaced by other models.',
    lessonId: null,
    sources: [
      {
        label:
          'Charles François de Cisternay du Fay, paper written December 1733, printed in Philosophical Transactions 38 (1734); memoirs in Histoire de l\'Académie royale des sciences (1733–1737)',
        url: 'https://en.wikipedia.org/wiki/Charles_Fran%C3%A7ois_de_Cisternay_du_Fay',
      },
    ],
  },
  {
    id: 'leyden-jar',
    year: 1745,
    displayDate: '1745–1746',
    person: 'Ewald Georg von Kleist and Pieter van Musschenbroek',
    shortName: 'The Leyden jar',
    summary: 'Scientists learned to store electric charge in a glass jar, an early form of the capacitor.',
    story: [
      'Electric machines in the 1700s could make sparks, but the charge disappeared quickly. Scientists wanted a way to save it.',
      'In 1745, Ewald Georg von Kleist in Germany found that a charge could be stored in a medicine bottle of alcohol with a nail through the cork. Pieter van Musschenbroek at Leiden, in the Netherlands, worked with a similar device.',
      'In these early designs, the glass held the charge, and the experimenter\'s hand acted as the outer conductor. Later designs coated the glass inside and outside with metal foil, around 1747. The device became known as the Leyden jar.',
      'The jar could give a surprisingly strong shock. It was an early capacitor, a device that stores charge. Phones and computers still use capacitors today.',
    ],
    nextHook:
      'Now scientists could save a charge. A printer in Philadelphia then asked a bigger question: is the spark in a jar the same thing as lightning in a storm?',
    modernLink:
      'Capacitors in your phone and computer store small amounts of charge to keep circuits steady.',
    historianNote:
      'Kleist made the first report, on 11 October 1745. Musschenbroek wrote about his version to Réaumur on 20 January 1746, and his name was long attached to the jar. Historians still discuss who deserves credit.',
    lessonId: null,
    sources: [
      { label: 'Ewald Georg von Kleist, 1745 report on storing electric charge in a glass vessel (Wikipedia summary)', url: 'https://en.wikipedia.org/wiki/Leyden_jar' },
      { label: 'Pieter van Musschenbroek, 1746 letter to René-Antoine Ferchault de Réaumur on the Leyden experiment (Wikipedia summary)', url: 'https://en.wikipedia.org/wiki/Leyden_jar' },
    ],
  },
  {
    id: 'franklin-lightning',
    year: 1752,
    displayDate: '1752',
    person: 'Benjamin Franklin and Thomas-François Dalibard',
    shortName: 'Testing lightning',
    summary: 'A printer wondered whether lightning is the same thing as the sparks from electric machines.',
    story: [
      'Benjamin Franklin, a printer in Philadelphia, became famous for his electrical experiments. Many people wondered whether the huge sparks of a thunderstorm were the same as the small sparks made in a lab.',
      'In 1750, Franklin proposed a test: extend a metal conductor into a storm cloud and see whether it carries electricity. His letters on electricity were published in England in 1751.',
      'On 10 May 1752, Thomas-François Dalibard performed a version of the test at Marly-la-Ville, France, using a metal rod about 40 feet tall. The rod collected electricity from a low cloud during a storm, which showed that the cloud carried electric charge.',
      'A popular story says Franklin flew a kite in a thunderstorm to do this test. Historians dispute the details, and it is not known whether Franklin ever carried out his own proposed experiment.',
    ],
    nextHook:
      'Lightning was electricity. Could people also make a steady flow of it, instead of one quick spark? An Italian scientist said yes, using a stack of metal discs.',
    modernLink:
      'Lightning rods on tall buildings carry a strike safely into the ground, based on Franklin\'s idea.',
    historianNote:
      'The kite story is popular but disputed. The Dalibard experiment is better documented.',
    lessonId: null,
    sources: [
      {
        label:
          'Benjamin Franklin, Experiments and Observations on Electricity (1751), letters to Peter Collinson (Wikipedia summary)',
        url: 'https://en.wikipedia.org/wiki/Experiments_and_Observations_on_Electricity',
      },
      {
        label:
          'Tom Tucker, Bolt of Fate (2003), on the disputed kite story',
      },
      {
        label:
          'Wikipedia, "Thomas-François Dalibard" (10 May 1752 experiment, metal rod about 40 feet tall; Franklin\'s 1750 proposal; unknown whether Franklin performed it)',
        url: 'https://en.wikipedia.org/wiki/Thomas-Fran%C3%A7ois_Dalibard',
      },
    ],
  },
  {
    id: 'volta-pile',
    year: 1800,
    displayDate: '1800',
    person: 'Alessandro Volta',
    shortName: 'Volta\'s battery',
    summary: 'Alessandro Volta built the first battery that gave a steady flow of electric current.',
    story: [
      'In the 1780s, Luigi Galvani noticed that a frog\'s leg twitched when touched by two different metals. He thought the electricity came from the animal\'s body.',
      'Alessandro Volta, a physicist in Pavia, believed the electricity came from the contact between the metals. To test this, he built a pile of copper and zinc discs separated by cloth soaked in salt water.',
      'In a letter dated 20 March 1800, Volta described this pile to the Royal Society in London. Wires attached to the top and bottom made a steady current flow, unlike the single quick spark of a Leyden jar.',
    ],
    nextHook:
      'With a steady current available, scientists could study how electricity and magnetism interact. One of them, Michael Faraday, asked whether magnetism could make electricity.',
    modernLink:
      'Batteries in phones, flashlights, and cars make electric current through chemistry.',
    historianNote:
      'Galvani was wrong about where the electricity came from, but his experiments started the debate that Volta answered.',
    lessonId: null,
    sources: [
      {
        label:
          'Alessandro Volta, "On the Electricity Excited by the Mere Contact of Conducting Substances of Different Kinds," Philosophical Transactions of the Royal Society of London, 90 (1800), pp. 403–431 (citation as given on Wikipedia; paper text not checked)',
        url: 'https://en.wikipedia.org/wiki/Voltaic_pile',
      },
      {
        label: 'Wikipedia, "Voltaic pile" (letter date of 20 March 1800 and description of the pile)',
        url: 'https://en.wikipedia.org/wiki/Voltaic_pile',
      },
    ],
  },
  {
    id: 'faraday-induction',
    year: 1831,
    displayDate: '1831',
    person: 'Michael Faraday',
    shortName: 'Faraday and induction',
    summary: 'Michael Faraday showed that a changing magnetic field can push an electric current through a wire.',
    story: [
      'Michael Faraday grew up in London and became an apprentice to a bookbinder. He read science books in his spare time and later worked as a scientist at the Royal Institution.',
      'In 1821, he showed that an electric current could make a wire spin around a magnet. This demonstration was an early step toward electric motors, though it was not a practical motor.',
      'On 29 August 1831, he wound two coils of wire around an iron ring. When he switched current on or off in one coil, a meter on the other coil jumped. A current appeared only while the magnetism was changing.',
      'This discovery is called electromagnetic induction, and it is the basis of electric generators. Power plants still use it today.',
    ],
    nextHook:
      'Faraday showed that magnetism can make electricity. But how could that power reach people\'s homes? An American inventor set out to make a lamp that could glow for hours.',
    modernLink:
      'Power plants spin magnets inside coils of wire to make the electricity that reaches your home.',
    historianNote:
      'Joseph Henry in the United States also worked on induction at about the same time, and Faraday published first.',
    lessonId: null,
    sources: [
      {
        label:
          'Electromagnetic induction, Wikipedia summary of Faraday\'s experiment of 29 August 1831 (notebook entry not checked)',
        url: 'https://en.wikipedia.org/wiki/Electromagnetic_induction',
      },
      { label: 'Michael Faraday, Experimental Researches in Electricity (1831–1855), primary series (not checked during review)' },
    ],
  },
  {
    id: 'edison-lamp',
    year: 1879,
    displayDate: '1879',
    person: 'Thomas Edison and his team',
    shortName: 'Edison\'s long-lasting lamp',
    summary: 'Edison\'s team made a carbon-filament lamp that glowed for hours, a step toward electric light in homes.',
    story: [
      'By the late 1870s, electric light existed, but it was harsh. Arc lamps made a bright spark between two rods. The light was too harsh and powerful for ordinary rooms.',
      'Thomas Edison\'s team in Menlo Park, New Jersey, wanted a small lamp that could glow for hours. In 1879, they tested a lamp with a thin carbon filament made from carbonized sewing thread. It burned for about 13.5 hours.',
      'A lamp alone was not enough. Edison\'s team also built generators, wires, and fittings, and they showed the whole system to the public in December 1879.',
      'Edison did not invent electric light from nothing. Humphry Davy showed a glowing platinum strip in 1802, and Joseph Swan in England also built working lamps. Edison\'s team made the lamp practical.',
    ],
    nextHook:
      'Edison\'s system used direct current (DC), which flows in one direction and loses power over long wires. Another inventor found a better way to send electricity far.',
    modernLink:
      'LED bulbs use less energy than Edison\'s lamps, but they still turn electricity into light.',
    historianNote:
      'Edison is often credited with the light bulb, but many people contributed. His team\'s long-lasting lamp and complete lighting system made electric light practical.',
    lessonId: null,
    sources: [
      { label: 'US Patent No. 223,898, Thomas A. Edison, "Electric lamp" (granted January 27, 1880)', url: 'https://patents.google.com/patent/US223898A/en' },
      {
        label:
          'National Park Service, Edison National Historic Site, "Edison biography" (13.5-hour sewing-thread lamp; December 1879 public demonstration, month only)',
        url: 'https://www.nps.gov/edis/learn/historyculture/edison-biography.htm',
      },
    ],
  },
  {
    id: 'tesla-ac-motor',
    year: 1888,
    displayDate: '1888',
    person: 'Nikola Tesla',
    shortName: 'Tesla\'s AC motor',
    summary: 'Tesla\'s AC motor patents helped make alternating current practical for sending power far away.',
    story: [
      'Electric motors existed long before 1888. Moritz Jacobi began studying electric motors in 1834 and in 1839 used one to power a 28-foot boat. Most early motors ran on direct current (DC), which flows in one direction.',
      'Alternating current (AC) reverses direction many times every second. Transformers can raise or lower its voltage, so it can travel long distances with less energy lost. But AC motors were hard to design well.',
      'In 1888, Nikola Tesla received US Patent 381,968 for an electro-magnetic motor that runs on alternating currents. Several AC currents, out of step with each other, create a magnetic field that turns on its own and spins the motor. That same spring, he presented a paper on AC motors and transformers to the American Institute of Electrical Engineers.',
    ],
    nextHook:
      'Tesla\'s AC designs helped power networks spread. But what was actually moving inside those wires? Around 1897, a British scientist set out to find out.',
    modernLink:
      'Most household motors, like those in washing machines and fans, are AC motors. The outlets in your wall supply alternating current.',
    historianNote:
      'Tesla did not invent the electric motor. His patents advanced AC motor technology. Galileo Ferraris in Italy published related work on rotating magnetic fields in 1888, and many engineers and companies, including George Westinghouse, built AC power systems.',
    lessonId: null,
    sources: [
      {
        label: 'US Patent 381,968, Nikola Tesla, "Electro-magnetic motor," patented May 1, 1888 (Google Patents)',
        url: 'https://patents.google.com/patent/US381968',
      },
      {
        label: 'Moritz Hermann von Jacobi, early electric motor work from 1834 and 1839 boat (Wikipedia summary)',
        url: 'https://en.wikipedia.org/wiki/Moritz_Hermann_von_Jacobi',
      },
      {
        label:
          'Nikola Tesla, "A New System for Alternating Current Motors and Transformers," Transactions of the American Institute of Electrical Engineers, vol. 5 (1888), pp. 308–324 (title and pages from secondary sources; original not checked)',
      },
    ],
  },
  {
    id: 'thomson-electron',
    year: 1897,
    displayDate: '1897',
    person: 'J. J. Thomson',
    shortName: 'The electron',
    summary: 'J. J. Thomson showed that cathode rays are streams of tiny particles with negative electricity.',
    story: [
      'In the 1890s, scientists studied cathode rays, glowing streams that appear inside a glass tube when electricity flows through thin gas. Some scientists thought these rays were a kind of wave.',
      'J. J. Thomson, at the Cavendish Laboratory in Cambridge, bent the rays with electric and magnetic fields. The rays bent the way a stream of charged particles would, not the way waves would.',
      'On 30 April 1897, Thomson announced that the particles carried negative electricity and were much lighter than atoms. He called them "corpuscles."',
    ],
    nextHook:
      'A tiny negative particle moves through every wire. The next challenge was controlling those particles inside small devices. About 50 years later, a team at Bell Labs did just that.',
    modernLink:
      'Electrons move through the wires in your home and the circuits in your phone.',
    historianNote:
      'The name "electron" was proposed by George Johnstone Stoney in 1891. Emil Wiechert and Walter Kaufmann also worked on the same charge-to-mass ratio in the late 1890s.',
    lessonId: null,
    sources: [
      {
        label:
          'J. J. Thomson, "Cathode Rays," Philosophical Magazine, series 5, vol. 44 (1897) (page and DOI not checked)',
        url: 'https://en.wikisource.org/wiki/Cathode_Rays',
      },
    ],
  },
  {
    id: 'bell-labs-transistor',
    year: 1947,
    displayDate: '1947',
    person: 'John Bardeen, Walter Brattain, and William Shockley',
    shortName: 'The transistor',
    summary: 'Bell Labs scientists built the first working transistor, a tiny solid device that can switch and amplify signals.',
    story: [
      'Before transistors, radios and early computers relied on vacuum tubes. These glass tubes got hot, used lots of power, and broke easily.',
      'At Bell Labs in New Jersey, John Bardeen and Walter Brattain were studying semiconductors, materials that conduct electricity better than insulators but not as well as metals. In late 1947, they built a device with two tiny gold contacts touching a germanium crystal. It could amplify a signal.',
      'William Shockley, who led the group, applied for a patent on the junction transistor in 1948. The first working junction transistor came in 1950. The three men shared the 1956 Nobel Prize in Physics.',
    ],
    nextHook:
      'A transistor is a single tiny switch. Engineers soon asked a bigger question: what if many switches and their wires could be built on one small piece of material? Jack Kilby took a step toward that in 1958.',
    modernLink:
      'Phones and computers contain billions of transistors, and each one acts as a tiny switch.',
    historianNote:
      'The first transistor was a point-contact design. Shockley\'s junction transistor became more practical to manufacture.',
    lessonId: null,
    sources: [
      {
        label:
          'Wikipedia, "Transistor" (point-contact transistor, late 1947 experiments; junction patent 1948; first working junction device 1950; 1956 Nobel Prize)',
        url: 'https://en.wikipedia.org/wiki/Transistor',
      },
      {
        label: 'Nobel Prize in Physics 1956 (official Nobel Prize page)',
        url: 'https://www.nobelprize.org/prizes/physics/1956/summary/',
      },
    ],
  },
  {
    id: 'kilby-integrated-circuit',
    year: 1958,
    displayDate: '1958',
    person: 'Jack Kilby',
    shortName: 'The integrated circuit',
    summary: 'Jack Kilby built a working circuit with several parts made from one piece of material, the first integrated circuit.',
    story: [
      'By the late 1950s, electronic circuits were built from separate parts that were wired together by hand. More parts meant more wires, more work, and more places for something to break.',
      'At Texas Instruments, Jack Kilby built a small circuit of several parts on one piece of germanium. He connected them with gold wires. On 12 September 1958, he demonstrated that it worked, and it is often called the first integrated circuit.',
      'Robert Noyce at Fairchild Semiconductor made a similar circuit on silicon in 1959, using a method that was easier to mass-produce. Both men are credited with the idea. Kilby received part of the 2000 Nobel Prize in Physics.',
    ],
    nextHook:
      'Today, one small chip can hold billions of transistors. That is the circuit world you are learning about in CircuitLore, and it all began with a few parts on one piece of material.',
    modernLink:
      'Computers, phones, and game consoles all run on integrated circuits built from billions of transistors.',
    historianNote:
      'Kilby\'s circuit used gold wires to connect its parts, which made mass production harder. Noyce\'s silicon version, made with the planar process, is credited with easier manufacturing. Their priority is discussed in histories of the chip.',
    lessonId: null,
    sources: [
      {
        label: 'Kilby, US Patent 3,138,743, "Miniaturized electronic circuits" (filed February 6, 1959; issued June 23, 1964)',
        url: 'https://patents.google.com/patent/US3138743A/en',
      },
      {
        label: 'Wikipedia, "Jack Kilby" (12 September 1958 demonstration; 2000 Nobel Prize shared with Alferov and Kroemer)',
        url: 'https://en.wikipedia.org/wiki/Jack_Kilby',
      },
      {
        label: 'Wikipedia, "Integrated circuit" (germanium chip with gold-wire interconnects; Noyce\'s silicon planar chip, 1959)',
        url: 'https://en.wikipedia.org/wiki/Integrated_circuit',
      },
    ],
  },
];

export default timelineMilestones;
