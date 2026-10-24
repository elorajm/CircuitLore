/**
 * Small original line-art icons used for feature cards and page headers.
 * Simple geometric shapes only — no copyrighted artwork or external assets.
 */

const commonProps = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

export function ScrollIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M6 3.5h10a2 2 0 0 1 2 2V18a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2z" />
      <path d="M6 3.5A2 2 0 0 0 4 5.5V18a2 2 0 0 0 2 2" />
      <path d="M8.5 8h6M8.5 11.5h6" />
    </svg>
  )
}

export function BulbIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.4 10.94c.52.37.9.98.9 1.63V16h5v-.43c0-.65.38-1.26.9-1.63A6 6 0 0 0 12 3Z" />
    </svg>
  )
}

export function CircuitIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M18.5 5.5l-2.8 2.8M5.5 18.5l2.8-2.8M18.5 18.5l-2.8-2.8" />
    </svg>
  )
}

export function ChartIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7" y="12" width="2.6" height="8" />
      <rect x="12" y="8" width="2.6" height="12" />
      <rect x="17" y="14" width="2.6" height="6" />
    </svg>
  )
}

export function BoltIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  )
}

export function MapIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  )
}

export function QuizIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3a2.5 2.5 0 0 1 4.8.9c0 1.6-2.3 1.9-2.3 3.4" />
      <path d="M12 17.2v.1" />
    </svg>
  )
}

export function TrophyIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5.5a2.5 2.5 0 0 0 2.5 3.5M16 6h2.5a2.5 2.5 0 0 1-2.5 3.5" />
      <path d="M12 13v4M8.5 20.5h7M9.5 17h5" />
    </svg>
  )
}

export function CheckIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M5 12.5 10 17l9-10" />
    </svg>
  )
}

export function LockIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function UsersIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17.5" cy="9.5" r="2.3" />
      <path d="M15.3 19a4.2 4.2 0 0 1 6.2-3.7" />
    </svg>
  )
}

export function GearIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.3M12 18.2v2.3M4.6 7.3l2 1.1M17.4 15.6l2 1.1M3.5 12h2.3M18.2 12h2.3M4.6 16.7l2-1.1M17.4 8.4l2-1.1" />
    </svg>
  )
}
