# Lesson 4: Electricity at Home — Implementation Plan

**Status:** Implemented and tested. Decisions in section 9 are approved and applied.
**Chapter:** 4 of My Journey ("Electricity at Home")
**Audience:** Students ages 10–14
**Learning goal:** Understand how electricity reaches homes, how household devices use electrical power, and basic electrical safety.

---

## 1. Findings from Inspection

### 1.1 Lesson ID

- The proposed ID `concept-003` is **already taken**. In the curriculum (`src/constants/lessons.js`) it is **"Voltage"** (order 10), which matches F4 Lesson 4 — Voltage.
- The home topic already exists as **`modern-001` "Home Electricity"** (stage 5, category `modern`, order 19, description "How electricity powers homes").
- F2 names the modern lessons `modern-001` through `modern-005`.
- **Recommendation:** use `modern-001`. Renumbering would conflict with the curriculum and F2.

### 1.2 Chapter 4 configuration

- In `src/pages/LearningJourney.jsx`, Chapter 4 is in `UPCOMING_CHAPTERS` as a locked preview with no `lessonId`:
  - title: "Electricity at Home"
  - teaser: "Discover how the power in your home reaches the outlets you use."
- Chapters 1–3 are in the `CHAPTERS` array: `history-001`, `concept-001`, and `concept-002`.
- The journey page also shows a "Coming Soon" section and a note saying chapters marked Coming Soon are not playable.

### 1.3 Lesson availability rules

- A lesson is playable only when it is in `LESSONS` **and** has an entry in `lessonContent` (`src/content/history/lessonAvailability.js`, `isLessonAvailable`).
- Adding `modern-001` to `lessonContent` makes it playable everywhere the existing checks apply: the dashboard, the journey, the timeline, and the lesson route.

### 1.4 Dashboard recommendation

- `src/content/nextLesson.js` (`chooseNextLessonId`) recommends, in order:
  1. the in-progress playable lesson saved most recently,
  2. otherwise the first playable lesson in curriculum order that is not completed,
  3. otherwise the first playable lesson, for review.
- Once `modern-001` is playable, the order is `history-001` → `concept-001` → `concept-002` → `modern-001`. **No code change is needed** for the recommendation. Only the tests that count playable lessons change.
- `nextPlayableLesson` (also in `nextLesson.js`) will lead from Electric Current to Home Electricity on the completion screen.

### 1.5 Historical timeline

- The timeline has **15 milestones**. The IDs are listed in section 4.
- The milestones this lesson can connect to are **existing** ones: `faraday-induction`, `tesla-ac-motor`, and `edison-lamp`.
- No existing milestone covers transformers, circuit breakers, household wiring, or power plants. The lesson will describe these without linking to a milestone.

### 1.6 Virtual Circuit Lab

- The lab (`src/circuit/circuitModel.js`) models a **battery**, a switch, and two bulbs.
- The lab is a useful analogy for a light switch, but it is **not** mains electricity. The lesson must say so clearly.

### 1.7 Existing progress model

- Lesson progress uses `saveProgress` / `getLessonProgress` / `resetProgress` in `src/services/progressService.js`.
- Metadata holds `{ step, quizScore, activityDone }`. This works unchanged for a new lesson.
- No database changes are needed.

### 1.8 Document and curriculum conflicts

| Item | Conflict | Proposed resolution |
|---|---|---|
| `concept-003` | Taken by "Voltage" (F4 Lesson 4) | Use `modern-001` |
| F4 Lesson 4, Voltage | Not built yet. The home lesson uses voltage before it | Explain voltage in plain words in this lesson. Build Voltage later |
| F4 Lesson 1, Electrical Safety | Not built as a lesson | Include basic home safety in Lesson 4 |
| F4 Lesson 11, Electricity Today | Lists homes as an example, which overlaps with this lesson | No conflict. Lesson 4 is the home-specific lesson |
| Journey "Coming Soon" section | Removing the preview after Chapter 4 is a design choice | See decision 2 in section 9 |
| Illustrative wattages | Must be checked against a reliable source before classroom use | Label every value as illustrative. Check against a reliable source (for example, US Department of Energy) |

---

## 2. Proposed File Changes

### 2.1 New files

| File | Purpose |
|---|---|
| `src/content/modern/modern001.js` | Lesson content: steps, activity reference, quiz, Circuit Lab note |
| `src/content/modern/modern001.test.js` | Content structure and safety-statement tests |
| `src/circuit/houseModel.js` | Pure logic: device list, circuit limit, total watts, breaker trip rule |
| `src/circuit/houseModel.test.js` | Model tests |
| `src/components/lesson/PowerTheHouseActivity.jsx` | Interactive activity component |
| `src/components/lesson/PowerTheHouseActivity.css` | Activity styles, reusing existing design tokens |
| `src/components/lesson/PowerTheHouseActivity.test.jsx` | Activity tests |
| `docs/LESSON-4-IMPLEMENTATION-PLAN.md` | This document |

### 2.2 Changed files

| File | Change |
|---|---|
| `src/content/lessonContent.js` | Register `'modern-001'` (this makes the lesson playable) |
| `src/components/lesson/LessonSession.jsx` | Register activity `'power-the-house'` in the `ACTIVITIES` map |
| `src/content/history/timeline.js` | Add `relatedLessons` to `faraday-induction`, `tesla-ac-motor`, and `edison-lamp`. These are existing milestones; no milestones are added |
| `src/pages/LearningJourney.jsx` | Move Chapter 4 into `CHAPTERS` with `lessonId: 'modern-001'`. Remove its locked preview. Decide on the "Coming Soon" section (see section 9) |
| `src/pages/LearningJourney.test.jsx` | Update the journey assertions for four playable chapters |
| `src/pages/StudentDashboard.test.jsx` | Playable count becomes 4. Add the recommendation after Electric Current |
| `src/components/history/HistoryLessonConsistency.test.jsx` | Status-region count changes from 4 to 5 (history plus four journey cards) |
| `src/components/history/HistoryTimeline.test.jsx` | Add tests for the new connections |
| `src/content/history/connections.test.js` | Add tests for the new mapping |
| `src/pages/LessonPage.test.jsx` | Add lesson-flow tests for `modern-001` |

### 2.3 Unchanged

- `src/services/progressService.js` and the database schema
- `src/pages/StudentDashboard.jsx` (recommendation logic)
- `src/content/nextLesson.js` (recommendation logic)
- `src/components/lesson/LessonComplete.jsx` (it already accepts a `circuitLab` prop)
- The Virtual Circuit Lab (`src/components/circuit/`, `src/pages/CircuitLab.jsx`)
- Existing lessons: `history-001`, `concept-001`, `concept-002`

---

## 3. Lesson Content Outline

Block kinds follow the existing convention: `guide` (Quill), `scene`, `history`, and `science`. Each step has a `stepLabel`, which must be unique.

| # | Step id | Label | Type | Content summary |
|---|---|---|---|---|
| 1 | `flip-the-switch` | Welcome | story | Quill asks how flipping a switch lights a room, and how electricity travels from a faraway power plant |
| 2 | `power-plants` | Power plants | story | Turbines (steam, water, or wind) spin magnets inside coils of wire, which makes electricity. Links to Faraday |
| 3 | `long-distance` | Long-distance travel | story | High voltage means less current for the same power, so less energy is lost as heat in the wires. Transformers change voltage. Links to Tesla |
| 4 | `neighborhood` | Your neighborhood | story | Voltage is stepped down before it reaches homes. About 120 volts in many US homes; about 230 volts in many other countries |
| 5 | `household-circuits` | Inside your home | story | Devices are wired side by side, so turning one off does not turn off the others (the parallel idea from the lab). A breaker cuts power when current gets too high |
| 6 | `home-safety` | Stay safe | story | Never put objects into outlets, keep water away from electricity, report damaged cords, and leave wiring to qualified people |
| 7 | `power-the-house` | Power the House | activity | Interactive activity (section 5) |
| 8 | `today` | Today | story | LEDs use much less energy than Edison's carbon-filament lamps, though both turn electricity into light. Links to Edison |
| 9 | `knowledge-check` | Knowledge check | quiz | Three questions (section 6) |

### 3.1 Scientific accuracy notes

- Power plant generation: a generator spins magnets inside coils, which induces current. This is Faraday's principle.
- Transmission: for the same power, higher voltage means lower current, and energy lost as heat in the wires is proportional to current squared times resistance. Explain this without the formula.
- Transformers change voltage. Tesla's AC work made this practical.
- Household voltages: about 120 V in many US homes; about 230 V in many other countries.
- A breaker is a safety switch that opens when current is too high, protecting wires from overheating.
- LED bulbs use less energy than incandescent bulbs, and both convert electricity to light.
- **Do not** suggest experimenting with outlets or household wiring.

---

## 4. Historical Timeline Connections

### 4.1 Milestone IDs (existing, unchanged)

`thales-amber`, `torpedo-fish`, `gilbert-electric`, `guericke-sulfur-ball`, `gray-conductors`, `du-fay-two-kinds`, `leyden-jar`, `franklin-lightning`, `volta-pile`, `faraday-induction`, `edison-lamp`, `tesla-ac-motor`, `thomson-electron`, `bell-labs-transistor`, `kilby-integrated-circuit`

### 4.2 Milestone check

| Person | Milestone ID | Present? | Use |
|---|---|---|---|
| Alessandro Volta | `volta-pile` | Yes | Not relevant to homes. Stays linked to Chapter 3 only |
| Michael Faraday | `faraday-induction` | Yes | **Connect** (generators) |
| Nikola Tesla | `tesla-ac-motor` | Yes | **Connect** (AC and transformers) |
| Thomas Edison | `edison-lamp` | Yes | **Connect** (lamps, DC versus AC, LEDs) |

### 4.3 Proposed `relatedLessons` entries

Each entry uses an existing milestone and points to `modern-001`. The lesson panel and the timeline only show connections once the lesson is playable, so there are no broken links.

```js
// faraday-induction
{
  lessonId: 'modern-001',
  note: 'Faraday discovered induction. Power plants still use it by spinning magnets inside coils. Electricity at Home shows how that power reaches your house.',
}

// tesla-ac-motor
{
  lessonId: 'modern-001',
  note: 'Tesla’s AC designs helped make long-distance power practical. Electricity at Home shows how transformers and wall outlets use AC.',
}

// edison-lamp
{
  lessonId: 'modern-001',
  note: 'Edison’s lamp helped bring electric light into homes. Electricity at Home compares old bulbs with LEDs.',
}
```

### 4.4 Explicitly not done

- No new milestones are created.
- No link is made to a milestone for transformers, circuit breakers, household wiring, or power plants.
- Franklin's lightning rods are an optional safety connection. They are **not** included in this plan.

---

## 5. Interactive Activity: "Power the House"

### 5.1 Purpose

Students turn devices on and off, compare their power ratings in watts, and see what happens when the total exceeds a circuit's limit.

### 5.2 Devices (illustrative wattages)

Every value is labeled **illustrative**. Real devices vary.

| Device | Watts (illustrative) |
|---|---|
| LED lamp | 10 |
| Laptop | 60 |
| TV | 100 |
| Refrigerator (average) | 150 |
| Microwave | 1,000 |
| Hair dryer | 1,500 |

### 5.3 Circuit limit

- **1,800 W** (illustrative). This corresponds to a 15-amp, 120-volt household circuit.
- The label must state that a real breaker's limit depends on the circuit.

### 5.4 Behavior

1. **Toggle devices.** Each device is a button with `aria-pressed`. Its name includes the device and its wattage.
2. **Live total.** The total in watts updates immediately. A progress bar shows the total as a fraction of the limit.
3. **Power bars.** Each device shows a bar scaled to its wattage, so students can compare ratings visually.
4. **Breaker trip.** When the total is **over** the limit, the pretend breaker trips. All devices switch off. The message explains that the breaker cut power to protect the wires from overheating.
5. **Reset.** A "Reset breaker" button restores power. Devices stay off until the student turns them on again.
6. **Completion.** The activity completes once the student has tripped the breaker **and** reset it. It then calls `onCompleted`, which saves `activityDone` through the existing flow.

### 5.5 Pure logic (`houseModel.js`)

- `DEVICES`: the list above, with ids, labels, and watts.
- `CIRCUIT_LIMIT_WATTS = 1800`.
- `totalWatts(onDeviceIds)`: sums the watts of the devices that are on.
- `breakerTrips(total)`: returns `true` only when `total > CIRCUIT_LIMIT_WATTS`. A total exactly at the limit does not trip the breaker.

### 5.6 Accessibility

- All controls are native buttons, operable by mouse, touch, and keyboard. Touch targets are at least 44 px.
- The total and breaker messages sit in a live region.
- The progress bar has a text equivalent.
- Under `prefers-reduced-motion`, the trip animation is disabled.
- Quill's text: "Turning on too much at once is what makes a breaker trip. It is a safety feature, not a failure."

### 5.7 Safety

- The activity is a **pretend** board. The lesson states that real outlets and wiring are not to be experimented with.

---

## 6. Knowledge Check (three questions)

1. **How do power plants make most of their electricity?**
   - Correct: by spinning a magnet inside coils of wire.
   - Distractors: by burning batteries; by rubbing materials together; by storing sunlight in wires.
2. **Why do power lines carry electricity at high voltage?**
   - Correct: for the same power, high voltage needs less current, so less energy is lost as heat in the wires.
   - Distractors: high voltage makes the wires glow; it makes the electricity heavier; it cannot be stopped by a switch.
3. **What does a circuit breaker do?**
   - Correct: it cuts off power when the current gets too high, to protect the wires from overheating.
   - Distractors: it stores extra power for later; it makes the current flow faster; it turns devices on automatically.

Each question has a short explanation, shown after the student checks their answers. This matches the existing quiz component.

---

## 7. Journey, Dashboard, and Completion

- **My Journey:** Chapter 4 becomes a playable chapter, using the same chapter markup as the others.
  - intro: "Discover how the power in your home reaches the outlets you use."
  - lessonTitle: "Home Electricity"
  - parts: "Story: how power reaches your home", "Activity: Power the House", "Quiz: Knowledge Check"
- **Dashboard:** `PLAYABLE_LESSONS` now has four lessons. The recommendation moves to Home Electricity once Electric Current is completed.
- **Completion:** `nextPlayableLesson('modern-001')` returns `null`, so the completion screen shows only the journey link. The circuit-lab note from `modern001.js` appears as in the existing lessons.
- **Circuit Lab note:** "The lab uses a battery, not a wall outlet. A light switch works the same way in a loop, but a home uses much stronger electricity. Never try this with wall outlets."

---

## 8. Testing Plan

### 8.1 Content (`modern001.test.js`)

- Unique step ids and labels.
- Starts with a story and ends with a quiz.
- Exactly three quiz questions, each with a valid `answerIndex` and an explanation.
- The activity names `power-the-house`.
- The historical steps name Faraday, Tesla, and Edison.
- Safety text is present, and no step suggests experimenting with outlets or household wiring.

### 8.2 House model (`houseModel.test.js`)

- `totalWatts` sums only the devices that are on.
- `breakerTrips` is `false` at exactly 1,800 W and `true` at 1,801 W.
- Device list ids are unique, and every device has a positive wattage.

### 8.3 Activity (`PowerTheHouseActivity.test.jsx`)

- Each device is a button with `aria-pressed` and a name that includes its wattage.
- Toggling updates the live total.
- Going over the limit trips the breaker, switches all devices off, and shows the safety message.
- Reset restores power, and devices stay off.
- `onCompleted` is called once, after a trip and a reset, and not again on later changes.
- Keyboard activation works with Enter and Space.
- The progress bar has an accessible text value.

### 8.4 Lesson progress (`LessonPage.test.jsx`, new describe block)

- Begin saves `modern-001` as `in_progress` at step 1.
- A saved step is restored.
- Completing the activity saves `activityDone: true` for `modern-001`.
- Finishing the quiz saves `completed` with the score.
- Reset works by lesson id.
- The completion screen shows the circuit-lab note and no "Continue to" link.

### 8.5 Journey and dashboard

- Journey: four playable chapters, a card for Chapter 4 with its activity and quiz, and no locked previews (or the approved replacement for the Coming Soon section).
- Journey: the lab link still appears.
- Dashboard: Playable lessons shows 4. After Electric Current is completed, the recommendation is Home Electricity.
- Journey and history status-region counts are updated.

### 8.6 Timeline and connections

- `faraday-induction`, `tesla-ac-motor`, and `edison-lamp` each list Home Electricity once it is playable.
- Before it is playable, no link to `modern-001` appears.
- The helper `playableLessonsForMilestone` never returns an unbuilt lesson.
- `historyConnectionsForLesson('modern-001')` returns the three milestones.
- The total number of milestones remains 15.

### 8.7 Full checks

- Full test suite, ESLint, and production build. All must pass before any commit.

---

## 9. Decisions Needed from the Owner

1. **Lesson ID.** Use `modern-001` (recommended), or choose another approach?
2. **Journey after Chapter 4.** Remove the "Coming Soon" section entirely (recommended), or keep a placeholder for the next planned chapter? If the section is removed, the note "Chapters marked Coming Soon are previews" should also go.
3. **Timeline connections.** May I add `relatedLessons` entries to Faraday, Tesla, and Edison? These are existing milestones, so no milestones are added to the timeline.
4. **Wattages.** Confirm the illustrative values in section 5.2 and the 1,800 W limit, or provide a source to check against.

---

## 10. Open Items Outside This Lesson

- `src/circuit/circuitModel.test.js` shows as modified in git and was reported as changed on disk. It was not changed by this planning work. It should be checked before the next commit.
- The Voltage lesson (`concept-003`) is still unbuilt. This lesson introduces voltage in plain words.
- A browser check is needed after implementation: layout on desktop, tablet, and phone; touch targets; and the breaker animation with reduced motion.
