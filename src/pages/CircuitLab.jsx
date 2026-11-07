import { Link } from 'react-router-dom'
import CircuitWorkspace from '../components/circuit/CircuitWorkspace.jsx'
import { CircuitIcon } from '../components/icons.jsx'
import './CircuitLab.css'

function CircuitLab() {
  return (
    <main className="lab-page">
      <header className="lab-page-header">
        <p className="lab-eyebrow">Virtual Circuit Lab</p>
        <h1>Build a Circuit</h1>
        <p className="lab-intro">
          Connect the parts yourself and watch what happens. This is a pretend board, so experiment as
          much as you like.
        </p>
      </header>

      <aside className="lab-quill" aria-labelledby="lab-quill-title">
        <CircuitIcon className="lab-quill-icon" width="36" height="36" aria-hidden="true" />
        <div>
          <h2 id="lab-quill-title" className="lab-quill-title">
            Quill’s tips
          </h2>
          <ol className="lab-quill-steps">
            <li>Press the battery’s + (plus) terminal, then press the terminal you want to join it to.</li>
            <li>A circuit needs a complete loop. Current leaves the + side, flows through the parts, and returns to the − (minus) side.</li>
            <li>Close the switch to let current flow. Open it to break the loop and watch the bulbs go dark.</li>
            <li>
              Watch the dashes. They show conventional current, from + to −. Electrons in metal wires actually
              move the other way, from − to +.
            </li>
            <li>Try the examples to compare bulbs in a row with bulbs side by side.</li>
            <li>
              Stay safe. This board is pretend. In real life, never connect a battery’s + and − ends with a wire.
            </li>
          </ol>
        </div>
      </aside>

      <CircuitWorkspace />

      <nav className="lab-links" aria-label="Related pages">
        <Link className="btn btn-secondary" to="/journey/concept-002">
          Read the Electric Current lesson
        </Link>
        <Link className="btn btn-secondary" to="/history#volta-pile">
          Meet Volta and his battery
        </Link>
      </nav>
    </main>
  )
}

export default CircuitLab
