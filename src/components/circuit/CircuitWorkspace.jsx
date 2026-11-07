import { useMemo, useRef, useState } from 'react'
import {
  analyzeCircuit,
  BULB_LABELS,
  canConnect,
  CIRCUIT_EXAMPLES,
  TERMINAL_LABELS,
  TERMINALS,
} from '../../circuit/circuitModel.js'
import './CircuitWorkspace.css'

const TERMINAL_BY_ID = Object.fromEntries(TERMINALS.map((terminal) => [terminal.id, terminal]))

// Points on the board are percentages, so wires and parts line up at any screen size
function midpoint(from, to) {
  const a = TERMINAL_BY_ID[from]
  const b = TERMINAL_BY_ID[to]
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

// A reusable circuit workspace. Students connect terminals by pressing two of them,
// disconnect wires with their own buttons, and open or close the switch.
function CircuitWorkspace({ examples = CIRCUIT_EXAMPLES }) {
  const [wires, setWires] = useState([])
  const [switchClosed, setSwitchClosed] = useState(false)
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState('')
  const nextWireNumber = useRef(1)

  const analysis = useMemo(() => analyzeCircuit({ wires, switchClosed }), [wires, switchClosed])

  function newWire(from, to) {
    const id = `wire-${nextWireNumber.current}`
    nextWireNumber.current += 1
    return { id, from, to }
  }

  function pressTerminal(terminalId) {
    setNotice('')

    if (selected === null) {
      setSelected(terminalId)
      return
    }

    if (selected === terminalId) {
      setSelected(null)
      return
    }

    if (!canConnect(wires, selected, terminalId)) {
      setNotice('Those two terminals are already joined.')
      setSelected(null)
      return
    }

    setWires((current) => [...current, newWire(selected, terminalId)])
    setSelected(null)
  }

  function removeWire(wireToRemove) {
    setWires((current) => current.filter((wire) => wire.id !== wireToRemove.id))
    setSelected(null)
    setNotice('Wire removed.')
  }

  function resetCircuit() {
    setWires([])
    setSwitchClosed(false)
    setSelected(null)
    setNotice('The circuit is cleared. Start again with any terminal.')
  }

  function loadExample(example) {
    setWires(example.wires.map(([from, to]) => newWire(from, to)))
    setSwitchClosed(example.switchClosed)
    setSelected(null)
    setNotice(`Loaded: ${example.title}.`)
  }

  function cancelSelection() {
    setSelected(null)
    setNotice('Connection cancelled.')
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && selected !== null) {
      cancelSelection()
    }
  }

  const litBulbs = analysis.litBulbs
  const selectedLabel = selected ? TERMINAL_LABELS[selected] : null

  return (
    <section className="circuit-workspace" aria-labelledby="circuit-workspace-title" onKeyDown={handleKeyDown}>
      <h2 id="circuit-workspace-title" className="circuit-workspace-title">
        Circuit board
      </h2>

      <div
        className={`circuit-board${analysis.status === 'complete' ? ' is-complete' : ''}`}
        role="group"
        aria-label="Circuit board with a battery, a switch, and two bulbs"
      >
        <svg className="circuit-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {wires.map((wire) => {
            const a = TERMINAL_BY_ID[wire.from]
            const b = TERMINAL_BY_ID[wire.to]
            // Dashes move the way conventional current moves: from + toward −, along each wire
            const direction = analysis.flowDirections[wire.id]
            const flowClass = !analysis.flowingIds.includes(wire.id)
              ? ''
              : ` is-flowing is-${direction === 'forward' ? 'forward' : direction === 'reverse' ? 'reverse' : 'steady'}`
            return (
              <line
                key={wire.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`circuit-wire${flowClass}`}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>

        <div className="circuit-part circuit-battery" aria-hidden="true">
          <span className="circuit-battery-sign circuit-battery-plus">+</span>
          <span className="circuit-battery-sign circuit-battery-minus">−</span>
        </div>
        <div className="circuit-part-label" style={{ left: '12%', top: '93%' }} aria-hidden="true">
          Battery
        </div>

        <div
          className={`circuit-part circuit-switch${switchClosed ? ' is-closed' : ''}`}
          aria-hidden="true"
        >
          <span className="circuit-switch-lever" />
        </div>
        <div className="circuit-part-label" style={{ left: '42%', top: '30%' }} aria-hidden="true">
          Switch {switchClosed ? 'closed' : 'open'}
        </div>

        {['bulb-1', 'bulb-2'].map((bulb, index) => (
          <div key={bulb}>
            <div
              className={`circuit-part circuit-bulb${litBulbs.includes(bulb) ? ' is-lit' : ''}`}
              style={{ left: index === 0 ? '66%' : '86%', top: '50%' }}
              aria-hidden="true"
            />
            <div className="circuit-part-label" style={{ left: index === 0 ? '66%' : '86%', top: '93%' }} aria-hidden="true">
              {BULB_LABELS[bulb]} {litBulbs.includes(bulb) ? 'lit' : 'dark'}
            </div>
          </div>
        ))}

        {wires.map((wire) => {
          const middle = midpoint(wire.from, wire.to)
          return (
            <button
              key={`remove-${wire.id}`}
              type="button"
              className="circuit-wire-remove"
              style={{ left: `${middle.x}%`, top: `${middle.y}%` }}
              aria-label={`Remove wire from ${TERMINAL_LABELS[wire.from]} to ${TERMINAL_LABELS[wire.to]}`}
              onClick={() => removeWire(wire)}
            >
              ×
            </button>
          )
        })}

        {TERMINALS.map((terminal) => {
          const isSelected = selected === terminal.id
          return (
            <button
              key={terminal.id}
              type="button"
              className={`circuit-terminal${isSelected ? ' is-selected' : ''}`}
              style={{ left: `${terminal.x}%`, top: `${terminal.y}%` }}
              aria-label={terminal.label}
              aria-pressed={isSelected}
              title={terminal.label}
              onClick={() => pressTerminal(terminal.id)}
            >
              <span className="circuit-terminal-dot" aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <div className="circuit-legend">
        <p>
          <strong>Moving dashes show conventional current</strong>, which flows from the + terminal toward
          the − terminal. Electrons in metal wires actually move the other way, from − to +.
        </p>
        <p className="circuit-safety">
          <strong>Safety:</strong> this is a pretend board. Never connect a real battery’s + and − terminals
          with a wire. It can overheat and damage the battery, and it can start a fire.
        </p>
      </div>

      <div className="circuit-result" role="status" aria-live="polite">
        {notice && <p className="circuit-notice">{notice}</p>}
        <h3 className={`circuit-result-title is-${analysis.status}`}>{analysis.title}</h3>
        <p className="circuit-result-message">{analysis.message}</p>
      </div>

      <div className="circuit-controls">
        <button type="button" className="btn btn-primary" onClick={() => setSwitchClosed((closed) => !closed)}>
          {switchClosed ? 'Open the switch' : 'Close the switch'}
        </button>
        {selected !== null && (
          <button type="button" className="btn btn-secondary" onClick={cancelSelection}>
            Cancel connection
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={resetCircuit}>
          Reset circuit
        </button>
      </div>

      <p className="circuit-hint">
        {selectedLabel
          ? `Connecting from ${selectedLabel}. Press another terminal to finish the wire, or press Cancel connection.`
          : 'Press one terminal, then another, to add a wire. Press × on a wire to remove it.'}
      </p>

      <fieldset className="circuit-examples">
        <legend>Try an example</legend>
        <div className="circuit-example-list">
          {examples.map((example) => (
            <button key={example.id} type="button" className="btn btn-secondary" onClick={() => loadExample(example)}>
              {example.title}
            </button>
          ))}
        </div>
      </fieldset>

      <section className="circuit-wire-list-section" aria-labelledby="circuit-wire-list-title">
        <h3 id="circuit-wire-list-title" className="circuit-wire-list-title">
          Wires in this circuit
        </h3>
        {wires.length === 0 ? (
          <p className="circuit-hint">No wires yet.</p>
        ) : (
          <ol className="circuit-wire-list">
            {wires.map((wire, index) => (
              <li key={wire.id}>
                <span>
                  Wire {index + 1}: {TERMINAL_LABELS[wire.from]} to {TERMINAL_LABELS[wire.to]}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => removeWire(wire)}
                  aria-label={`Remove wire ${index + 1}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  )
}

export default CircuitWorkspace
