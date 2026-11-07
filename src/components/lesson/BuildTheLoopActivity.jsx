import { useState } from 'react'
import './BuildTheLoopActivity.css'

const COPPER = 'copper'
const PLASTIC = 'plastic'
const OPEN = 'open'

const CHOICES = [
  { value: COPPER, label: 'Copper wire' },
  { value: PLASTIC, label: 'Plastic strip' },
  { value: OPEN, label: 'Leave a gap' },
]

const GAPS = [
  { id: 'top', label: 'Top wire' },
  { id: 'bottom', label: 'Bottom wire' },
]

const WIRE_CLASS = {
  [COPPER]: 'is-copper',
  [PLASTIC]: 'is-plastic',
  [OPEN]: 'is-open',
}

function isLit(wires) {
  return wires.top === COPPER && wires.bottom === COPPER
}

function statusMessage(wires) {
  if (isLit(wires)) {
    return 'The bulb is lit! Charge flows all the way around the complete loop.'
  }
  const values = Object.values(wires)
  if (values.includes(null)) {
    return 'Choose a wire for each gap, then watch the bulb.'
  }
  if (values.includes(OPEN)) {
    return 'The bulb is off. A gap in the loop means charge cannot get back to the battery.'
  }
  return 'The bulb is off. Plastic is an insulator, so charge cannot flow through it.'
}

function BuildTheLoopActivity({ onCompleted }) {
  const [wires, setWires] = useState({ top: null, bottom: null })
  const [sawLit, setSawLit] = useState(false)
  const [completed, setCompleted] = useState(false)

  const lit = isLit(wires)

  function choose(wireId, value) {
    const nextWires = { ...wires, [wireId]: value }
    const nextLit = isLit(nextWires)

    setWires(nextWires)
    if (nextLit) {
      setSawLit(true)
    } else if (sawLit && !completed) {
      // Light the bulb first, then break the loop: that is the lesson's key discovery
      setCompleted(true)
      onCompleted?.()
    }
  }

  let message = statusMessage(wires)
  if (completed) {
    message = 'You built a complete loop, then broke it. Current needs a complete path.'
  }

  return (
    <div className="knowledge-check">
      <div className={`loop-board${lit ? ' is-lit' : ''}`} aria-hidden="true">
        {GAPS.map((gap) => (
          <div
            key={gap.id}
            className={`loop-wire loop-wire-${gap.id} ${wires[gap.id] ? WIRE_CLASS[wires[gap.id]] : 'is-unset'}`}
          />
        ))}
        <div className="loop-battery">Battery</div>
        <div className={`loop-bulb${lit ? ' is-lit' : ''}`}>Bulb</div>
      </div>

      {GAPS.map((gap) => (
        <fieldset key={gap.id} className="knowledge-question">
          <legend>{gap.label}</legend>
          {CHOICES.map((choice) => {
            const inputId = `loop-${gap.id}-${choice.value}`
            return (
              <div className="knowledge-option" key={inputId}>
                <input
                  type="radio"
                  id={inputId}
                  name={`loop-${gap.id}`}
                  value={choice.value}
                  checked={wires[gap.id] === choice.value}
                  onChange={() => choose(gap.id, choice.value)}
                />
                <label htmlFor={inputId}>{choice.label}</label>
              </div>
            )
          })}
        </fieldset>
      ))}

      <p className="knowledge-status" role="status">
        {message}
      </p>
    </div>
  )
}

export default BuildTheLoopActivity
