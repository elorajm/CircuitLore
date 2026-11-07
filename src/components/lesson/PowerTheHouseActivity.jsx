import { useState } from 'react'
import {
  breakerTrips,
  CHALLENGE_LIMIT_WATTS,
  DEVICES,
  energyWattHours,
  totalWatts,
} from '../../circuit/houseModel.js'
import './PowerTheHouseActivity.css'

const NUMBER = new Intl.NumberFormat('en-US')

function formatWatts(watts) {
  return `${NUMBER.format(watts)} W`
}

function formatWattHours(wattHours) {
  return `${NUMBER.format(wattHours)} Wh`
}

// The four goals students work through, in order. Quill's challenge text in the lesson lists the same goals.
const GOALS = [
  { id: 'observe', label: 'Turn on appliances and watch the total wattage' },
  { id: 'trip', label: `Go over the ${formatWatts(CHALLENGE_LIMIT_WATTS)} challenge limit to trip the breaker` },
  { id: 'reset', label: 'Reset the breaker' },
  { id: 'safe', label: 'Turn on at least two appliances and stay under the limit' },
]

// Turn devices on and off, watch the total power in watts, trip and reset the breaker,
// then run at least two appliances safely under the limit. Completing all four goals completes the activity.
function PowerTheHouseActivity({ onCompleted }) {
  const [on, setOn] = useState([])
  const [tripped, setTripped] = useState(false)
  const [trippedAt, setTrippedAt] = useState(0)
  const [hasTurnedOn, setHasTurnedOn] = useState(false)
  const [hasTripped, setHasTripped] = useState(false)
  const [hasReset, setHasReset] = useState(false)
  const [completed, setCompleted] = useState(false)

  const total = totalWatts(on)
  const doneGoals = {
    observe: hasTurnedOn,
    trip: hasTripped,
    reset: hasReset,
    safe: completed,
  }

  function toggleDevice(deviceId) {
    if (tripped) return

    if (on.includes(deviceId)) {
      setOn(on.filter((id) => id !== deviceId))
      return
    }

    const next = [...on, deviceId]
    const nextTotal = totalWatts(next)
    setHasTurnedOn(true)

    if (breakerTrips(nextTotal)) {
      // The breaker cuts all power, so every device goes off
      setOn([])
      setTrippedAt(nextTotal)
      setTripped(true)
      setHasTripped(true)
      return
    }

    setOn(next)

    // After a reset, two or more appliances running under the limit completes the activity
    if (hasReset && next.length >= 2 && !completed) {
      setCompleted(true)
      onCompleted?.()
    }
  }

  function resetBreaker() {
    setTripped(false)
    setHasReset(true)
  }

  let title = 'Turn a device on'
  let message = 'Watch the total wattage as you turn devices on. Then go over the challenge limit to trip the breaker.'

  if (tripped) {
    title = 'Breaker tripped!'
    message = `The total reached ${formatWatts(trippedAt)}, which is over the ${formatWatts(CHALLENGE_LIMIT_WATTS)} challenge limit. The breaker cut the power to protect the wires from overheating. Reset the breaker to continue.`
  } else if (completed) {
    title = 'Challenge complete'
    message = 'You tripped the breaker, reset it, and then ran two or more appliances safely under the limit.'
  } else if (hasReset) {
    title = 'Breaker reset'
    message = `Now turn on at least two appliances and keep the total under ${formatWatts(CHALLENGE_LIMIT_WATTS)}.`
  } else if (total > 0) {
    title = 'Power is on'
    message = `The total is ${formatWatts(total)}, under the challenge limit. Watts show how fast these devices use electricity right now.`
  }

  return (
    <div className="power-activity">
      <ol className="power-goals" aria-label="Activity goals">
        {GOALS.map((goal) => {
          const done = doneGoals[goal.id]
          return (
            <li key={goal.id} className={done ? 'is-done' : ''}>
              <span className="power-goal-state">{done ? 'Done' : 'To do'}</span>
              <span>{goal.label}</span>
            </li>
          )
        })}
      </ol>

      <p className="power-limit-note">
        Challenge limit: {formatWatts(CHALLENGE_LIMIT_WATTS)}. This limit is fictional, made up for this
        activity. Real circuits have their own limits, set by their breakers. All wattages are illustrative.
      </p>

      <p className="power-definitions">
        <strong>Power</strong> is measured in watts (W): how fast a device uses electricity. <strong>Energy</strong>{' '}
        is measured in watt-hours (Wh): power multiplied by time.
      </p>

      <div className={`power-meter${tripped ? ' is-tripped' : ''}`}>
        <div className="power-meter-labels">
          <span>Total power right now</span>
          <span>
            {formatWatts(total)} of {formatWatts(CHALLENGE_LIMIT_WATTS)}
          </span>
        </div>
        <progress
          className="power-meter-bar"
          max={CHALLENGE_LIMIT_WATTS}
          value={total}
          aria-label={`Total power in watts, out of the fictional challenge limit of ${formatWatts(CHALLENGE_LIMIT_WATTS)}`}
        />
      </div>

      <p className="power-energy">
        Energy: if the devices that are on ran for one hour, they would use <strong>{formatWattHours(energyWattHours(total, 1))}</strong>.
      </p>

      <ul className="power-devices">
        {DEVICES.map((device) => {
          const isOn = on.includes(device.id)
          return (
            <li key={device.id}>
              <button
                type="button"
                className={`power-device${isOn ? ' is-on' : ''}`}
                aria-pressed={isOn}
                aria-label={`${device.label}, ${formatWatts(device.watts)}`}
                disabled={tripped}
                onClick={() => toggleDevice(device.id)}
              >
                <span className="power-device-name">{device.label}</span>
                <span className="power-device-watts">{formatWatts(device.watts)}</span>
                <span className="power-device-bar" aria-hidden="true">
                  <span style={{ width: `${(device.watts / CHALLENGE_LIMIT_WATTS) * 100}%` }} />
                </span>
                <span className="power-device-energy">
                  {formatWattHours(energyWattHours(device.watts, 1))} in one hour
                </span>
                <span className="power-device-state">{isOn ? 'On' : 'Off'}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div
        className={`power-status is-${tripped ? 'tripped' : completed ? 'done' : 'normal'}`}
        role="status"
        aria-live="polite"
      >
        <h3>{title}</h3>
        <p>{message}</p>
      </div>

      <div className="power-actions">
        <button type="button" className="btn btn-primary" disabled={!tripped} onClick={resetBreaker}>
          Reset breaker
        </button>
      </div>
    </div>
  )
}

export default PowerTheHouseActivity
