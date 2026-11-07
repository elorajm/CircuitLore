import { describe, it, expect } from 'vitest'
import { analyzeCircuit, canConnect, CIRCUIT_EXAMPLES, TERMINALS } from './circuitModel.js'

// Builds wires with ids from [from, to] pairs, the same way the workspace does
function wiresFrom(pairs) {
  return pairs.map(([from, to], index) => ({ id: `wire-${index + 1}`, from, to }))
}

const LOOP = [
  ['battery-plus', 'switch-left'],
  ['switch-right', 'bulb-1-top'],
  ['bulb-1-bottom', 'battery-minus'],
]

describe('analyzeCircuit', () => {
  it('reports an empty board with a starting hint', () => {
    const analysis = analyzeCircuit({ wires: [], switchClosed: true })

    expect(analysis.status).toBe('empty')
    expect(analysis.message).toMatch(/battery’s \+ terminal/)
    expect(analysis.litBulbs).toEqual([])
  })

  it('lights the bulb on a complete loop with the switch closed', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(LOOP), switchClosed: true })

    expect(analysis.status).toBe('complete')
    expect(analysis.litBulbs).toEqual(['bulb-1'])
    expect(analysis.darkBulbs).toEqual(['bulb-2'])
    expect(analysis.flowingIds).toEqual(expect.arrayContaining(['wire-1', 'wire-2', 'wire-3', 'switch', 'bulb-1']))
    expect(analysis.message).toMatch(/Bulb 1 is lit/)
  })

  it('turns the bulb off and explains the open switch when the switch is opened', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(LOOP), switchClosed: false })

    expect(analysis.status).toBe('switch-open')
    expect(analysis.litBulbs).toEqual([])
    expect(analysis.flowingIds).toEqual([])
    expect(analysis.message).toMatch(/open switch/)
  })

  it('explains a missing connection and names the battery terminal that is not wired', () => {
    const analysis = analyzeCircuit({
      wires: wiresFrom([
        ['battery-plus', 'switch-left'],
        ['switch-right', 'bulb-1-top'],
      ]),
      switchClosed: true,
    })

    expect(analysis.status).toBe('incomplete')
    expect(analysis.litBulbs).toEqual([])
    expect(analysis.message).toMatch(/gap in the loop/)
    expect(analysis.message).toMatch(/Connect a wire to the battery’s − terminal/)
    expect(analysis.message).not.toMatch(/battery’s \+ terminal\./)
  })

  it('lights both bulbs when they are in a row', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(CIRCUIT_EXAMPLES[2].wires), switchClosed: true })

    expect(analysis.status).toBe('complete')
    expect(analysis.litBulbs).toEqual(['bulb-1', 'bulb-2'])
  })

  it('lights both bulbs when they sit side by side', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(CIRCUIT_EXAMPLES[3].wires), switchClosed: true })

    expect(analysis.status).toBe('complete')
    expect(analysis.litBulbs).toEqual(['bulb-1', 'bulb-2'])
    expect(analysis.message).toMatch(/Both bulbs are lit/)
  })

  it('keeps a bulb with one connected end dark and says it is not on the loop', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(CIRCUIT_EXAMPLES[4].wires), switchClosed: true })

    expect(analysis.status).toBe('complete')
    expect(analysis.litBulbs).toEqual(['bulb-1'])
    expect(analysis.darkBulbs).toEqual(['bulb-2'])
    expect(analysis.message).toMatch(/Bulb 2 is not on the loop, so no current flows through it/)
  })

  it('treats a wire joining + straight to − as a short circuit that lights nothing', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(CIRCUIT_EXAMPLES[5].wires), switchClosed: true })

    expect(analysis.status).toBe('short')
    expect(analysis.title).toBe('Short circuit!')
    expect(analysis.litBulbs).toEqual([])
    expect(analysis.flowingIds).toEqual(['wire-4'])
    expect(analysis.message).toMatch(/skips the bulbs/)
  })

  it('still reports a short circuit when the switch is open, because the wire bypasses it', () => {
    const analysis = analyzeCircuit({
      wires: wiresFrom([['battery-plus', 'battery-minus']]),
      switchClosed: false,
    })

    expect(analysis.status).toBe('short')
  })
})

describe('current direction', () => {
  it('reports current crossing every wire forward on the normal loop, from + toward −', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(LOOP), switchClosed: true })

    expect(analysis.flowDirections).toEqual({ 'wire-1': 'forward', 'wire-2': 'forward', 'wire-3': 'forward' })
  })

  it('reports reverse when the same loop is drawn with its wires running the other way', () => {
    const analysis = analyzeCircuit({
      wires: wiresFrom([
        ['switch-left', 'battery-plus'],
        ['bulb-1-top', 'switch-right'],
        ['battery-minus', 'bulb-1-bottom'],
      ]),
      switchClosed: true,
    })

    expect(analysis.status).toBe('complete')
    expect(analysis.flowDirections).toEqual({ 'wire-1': 'reverse', 'wire-2': 'reverse', 'wire-3': 'reverse' })
  })

  it('reports mixed when different loops cross the same wire in opposite directions', () => {
    const analysis = analyzeCircuit({
      wires: wiresFrom([
        ['battery-plus', 'switch-left'],
        ['switch-left', 'switch-right'],
        ['battery-plus', 'switch-right'],
        ['switch-right', 'bulb-1-top'],
        ['bulb-1-bottom', 'battery-minus'],
        ['switch-left', 'bulb-2-top'],
        ['bulb-2-bottom', 'battery-minus'],
      ]),
      switchClosed: false,
    })

    expect(analysis.status).toBe('complete')
    expect(analysis.flowDirections['wire-2']).toBe('mixed')
  })

  it('reports the direction of current in the short-circuit wire too', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(CIRCUIT_EXAMPLES[5].wires), switchClosed: true })

    expect(analysis.flowDirections).toEqual({ 'wire-4': 'forward' })
  })

  it('reports no current direction when no current flows', () => {
    const analysis = analyzeCircuit({ wires: wiresFrom(LOOP), switchClosed: false })

    expect(analysis.flowDirections).toEqual({})
  })
})

describe('canConnect', () => {
  it('rejects a terminal joined to itself', () => {
    expect(canConnect([], 'battery-plus', 'battery-plus')).toBe(false)
  })

  it('rejects a pair that is already joined, in either direction', () => {
    const wires = wiresFrom([['battery-plus', 'switch-left']])

    expect(canConnect(wires, 'battery-plus', 'switch-left')).toBe(false)
    expect(canConnect(wires, 'switch-left', 'battery-plus')).toBe(false)
  })

  it('allows a new pair of terminals', () => {
    expect(canConnect([], 'battery-plus', 'switch-left')).toBe(true)
  })

  it('rejects a missing terminal', () => {
    expect(canConnect([], undefined, 'switch-left')).toBe(false)
  })
})

describe('circuit examples', () => {
  const expectedStatus = {
    'complete-loop': 'complete',
    'open-switch': 'switch-open',
    'bulbs-in-a-row': 'complete',
    'bulbs-side-by-side': 'complete',
    'dead-end': 'complete',
    'short-circuit': 'short',
  }

  it('uses only terminals that exist on the board', () => {
    const terminalIds = TERMINALS.map((terminal) => terminal.id)

    for (const example of CIRCUIT_EXAMPLES) {
      for (const [from, to] of example.wires) {
        expect(terminalIds).toContain(from)
        expect(terminalIds).toContain(to)
      }
    }
  })

  it('gives every example the result its description promises', () => {
    for (const example of CIRCUIT_EXAMPLES) {
      const analysis = analyzeCircuit({ wires: wiresFrom(example.wires), switchClosed: example.switchClosed })
      expect(analysis.status, example.id).toBe(expectedStatus[example.id])
    }
  })

  it('has a unique id for every example', () => {
    const ids = CIRCUIT_EXAMPLES.map((example) => example.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
