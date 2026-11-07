// Simplified circuit model for the Virtual Circuit Lab.
//
// A fixed battery, switch, and two bulbs sit on the board. Students connect any two terminals with
// a wire. The model follows the rules a beginner needs:
// - Current leaves the battery's + terminal, flows through the parts, and returns to its − terminal.
//   This is the conventional direction, + to −. Electrons in metal wires actually move the other way.
// - A bulb lights only when it is on that loop.
// - The switch conducts only when it is closed.
// - A wire that joins + to − with no bulb in the way is a short circuit.
// Parts are treated as ideal. This is a teaching model, not an electrical simulation.

export const TERMINALS = [
  { id: 'battery-plus', label: 'Battery + (plus) terminal', x: 12, y: 18 },
  { id: 'battery-minus', label: 'Battery − (minus) terminal', x: 12, y: 82 },
  { id: 'switch-left', label: 'Switch left terminal', x: 34, y: 18 },
  { id: 'switch-right', label: 'Switch right terminal', x: 50, y: 18 },
  { id: 'bulb-1-top', label: 'Bulb 1 top terminal', x: 66, y: 18 },
  { id: 'bulb-1-bottom', label: 'Bulb 1 bottom terminal', x: 66, y: 82 },
  { id: 'bulb-2-top', label: 'Bulb 2 top terminal', x: 86, y: 18 },
  { id: 'bulb-2-bottom', label: 'Bulb 2 bottom terminal', x: 86, y: 82 },
]

export const BULBS = ['bulb-1', 'bulb-2']

export const BULB_LABELS = { 'bulb-1': 'Bulb 1', 'bulb-2': 'Bulb 2' }

export const TERMINAL_LABELS = Object.fromEntries(TERMINALS.map((terminal) => [terminal.id, terminal.label]))

const PLUS = 'battery-plus'
const MINUS = 'battery-minus'
const SWITCH = 'switch'
const SWITCH_TERMINALS = ['switch-left', 'switch-right']
const BULB_TERMINALS = {
  'bulb-1': ['bulb-1-top', 'bulb-1-bottom'],
  'bulb-2': ['bulb-2-top', 'bulb-2-bottom'],
}

// Edges are the paths current can take. Wires always conduct, the switch only when closed,
// and each bulb is a load that conducts while it is part of a loop.
function buildEdges(wires, switchClosed) {
  const edges = wires.map((wire) => ({ id: wire.id, from: wire.from, to: wire.to, kind: 'wire' }))

  if (switchClosed) {
    edges.push({ id: SWITCH, from: SWITCH_TERMINALS[0], to: SWITCH_TERMINALS[1], kind: 'switch' })
  }

  for (const bulb of BULBS) {
    const [top, bottom] = BULB_TERMINALS[bulb]
    edges.push({ id: bulb, from: top, to: bottom, kind: 'bulb' })
  }

  return edges
}

// Every simple path (no terminal repeated) from start to end. Each path is a list of steps.
// A step records the edge and whether the path crosses it from its `from` end to its `to` end.
function pathsBetween(edges, start, end) {
  const paths = []

  function walk(node, visited, steps) {
    if (node === end) {
      paths.push(steps)
      return
    }

    for (const edge of edges) {
      if (steps.some((step) => step.edge === edge)) continue

      let next = null
      if (edge.from === node) next = edge.to
      else if (edge.to === node) next = edge.from
      if (next === null || visited.has(next)) continue

      visited.add(next)
      walk(next, visited, [...steps, { edge, forward: edge.from === node }])
      visited.delete(next)
    }
  }

  walk(start, new Set([start]), [])
  return paths
}

// For each wire that carries current, the direction current crosses it: 'forward' (from its first
// terminal to its second), 'reverse', or 'mixed' when different loops cross it in different directions.
function wireDirections(paths) {
  const directions = {}

  for (const path of paths) {
    for (const { edge, forward } of path) {
      if (edge.kind !== 'wire') continue
      const direction = forward ? 'forward' : 'reverse'
      const seen = directions[edge.id]
      directions[edge.id] = seen === undefined || seen === direction ? direction : 'mixed'
    }
  }

  return directions
}

function flowingEdgeIds(paths) {
  return [...new Set(paths.flat().map((step) => step.edge.id))]
}

function result(status, title, message, { flowingIds = [], flowDirections = {}, litBulbs = [] } = {}) {
  return {
    status,
    title,
    message,
    flowingIds,
    flowDirections,
    litBulbs,
    darkBulbs: BULBS.filter((bulb) => !litBulbs.includes(bulb)),
  }
}

function missingConnectionHint(wires) {
  const touches = (terminal) => wires.some((wire) => wire.from === terminal || wire.to === terminal)
  const hints = []
  if (!touches(PLUS)) hints.push('Connect a wire to the battery’s + terminal.')
  if (!touches(MINUS)) hints.push('Connect a wire to the battery’s − terminal.')
  return hints.join(' ')
}

// Explains the circuit's state in plain language.
// Returns the status, a short title, a message, the wires carrying current and the direction of each,
// and which bulbs are lit.
export function analyzeCircuit({ wires = [], switchClosed = false } = {}) {
  if (wires.length === 0) {
    return result(
      'empty',
      'Start building',
      'Connect a wire from the battery’s + terminal to a part. Current needs a complete loop that returns to the − terminal.',
    )
  }

  const edges = buildEdges(wires, switchClosed)

  // A wire-only path from + to − skips the bulbs. Check this before anything else.
  const shortPaths = pathsBetween(
    edges.filter((edge) => edge.kind !== 'bulb'),
    PLUS,
    MINUS,
  )
  if (shortPaths.length > 0) {
    return result(
      'short',
      'Short circuit!',
      'This wire joins the + and − terminals directly, so current skips the bulbs and no bulb can light. In a real battery, a short circuit like this can make the wires and the battery overheat, which can cause damage or a fire. Never connect a real battery’s + and − terminals with a wire.',
      {
        flowingIds: flowingEdgeIds(shortPaths),
        flowDirections: wireDirections(shortPaths),
      },
    )
  }

  const paths = pathsBetween(edges, PLUS, MINUS)

  if (paths.length === 0) {
    const closedPaths = pathsBetween(buildEdges(wires, true), PLUS, MINUS)
    if (!switchClosed && closedPaths.length > 0) {
      return result(
        'switch-open',
        'The switch is open',
        'An open switch leaves a gap in the loop, so current cannot flow. Close the switch to complete the loop.',
      )
    }

    const hint = missingConnectionHint(wires)
    return result(
      'incomplete',
      'Not a complete loop',
      `Current needs a complete loop: from the battery’s + terminal, through the parts, and back to the − terminal. Right now there is a gap in the loop. ${hint}`.trim(),
    )
  }

  const flowingIds = flowingEdgeIds(paths)
  const litBulbs = BULBS.filter((bulb) => flowingIds.includes(bulb))
  const darkBulbs = BULBS.filter((bulb) => !litBulbs.includes(bulb))

  let message = 'Current flows from the battery’s + terminal, through the parts, and back to −. '
  if (litBulbs.length === BULBS.length) {
    message += 'Both bulbs are lit because current flows through each of them.'
  } else {
    message += `${litBulbs.map((bulb) => BULB_LABELS[bulb]).join(' and ')} ${litBulbs.length === 1 ? 'is' : 'are'} lit because current flows through ${litBulbs.length === 1 ? 'it' : 'them'}.`
  }

  if (darkBulbs.length > 0) {
    message += ` ${darkBulbs.map((bulb) => BULB_LABELS[bulb]).join(' and ')} ${darkBulbs.length === 1 ? 'is' : 'are'} not on the loop, so no current flows through ${darkBulbs.length === 1 ? 'it' : 'them'} and ${darkBulbs.length === 1 ? 'it stays' : 'they stay'} dark.`
  }

  return result('complete', 'Complete circuit', message, {
    flowingIds,
    flowDirections: wireDirections(paths),
    litBulbs,
  })
}

// Whether two terminals can be joined. A terminal cannot join itself, and a pair joins only once.
export function canConnect(wires, from, to) {
  if (!from || !to || from === to) return false
  return !wires.some(
    (wire) => (wire.from === from && wire.to === to) || (wire.from === to && wire.to === from),
  )
}

// Starting points students can load to compare circuit configurations
export const CIRCUIT_EXAMPLES = [
  {
    id: 'complete-loop',
    title: 'A complete loop',
    description: 'One bulb on a closed loop, with the switch closed.',
    switchClosed: true,
    wires: [
      ['battery-plus', 'switch-left'],
      ['switch-right', 'bulb-1-top'],
      ['bulb-1-bottom', 'battery-minus'],
    ],
  },
  {
    id: 'open-switch',
    title: 'The same loop, switch open',
    description: 'Open the switch to break the loop and watch the bulb go dark.',
    switchClosed: false,
    wires: [
      ['battery-plus', 'switch-left'],
      ['switch-right', 'bulb-1-top'],
      ['bulb-1-bottom', 'battery-minus'],
    ],
  },
  {
    id: 'bulbs-in-a-row',
    title: 'Two bulbs in a row',
    description: 'Current passes through both bulbs one after the other.',
    switchClosed: true,
    wires: [
      ['battery-plus', 'switch-left'],
      ['switch-right', 'bulb-1-top'],
      ['bulb-1-bottom', 'bulb-2-top'],
      ['bulb-2-bottom', 'battery-minus'],
    ],
  },
  {
    id: 'bulbs-side-by-side',
    title: 'Two bulbs side by side',
    description: 'Each bulb gets its own path from the switch back to the battery.',
    switchClosed: true,
    wires: [
      ['battery-plus', 'switch-left'],
      ['switch-right', 'bulb-1-top'],
      ['switch-right', 'bulb-2-top'],
      ['bulb-1-bottom', 'battery-minus'],
      ['bulb-2-bottom', 'battery-minus'],
    ],
  },
  {
    id: 'dead-end',
    title: 'A bulb with a dead end',
    description: 'Bulb 2 is joined at one end only, so no current can flow through it.',
    switchClosed: true,
    wires: [
      ['battery-plus', 'switch-left'],
      ['switch-right', 'bulb-1-top'],
      ['bulb-1-bottom', 'battery-minus'],
      ['switch-right', 'bulb-2-top'],
    ],
  },
  {
    id: 'short-circuit',
    title: 'A short circuit',
    description: 'A wire joins + straight to −, skipping the bulbs. Find out why this is dangerous.',
    switchClosed: true,
    wires: [
      ['battery-plus', 'switch-left'],
      ['switch-right', 'bulb-1-top'],
      ['bulb-1-bottom', 'battery-minus'],
      ['battery-plus', 'battery-minus'],
    ],
  },
]
