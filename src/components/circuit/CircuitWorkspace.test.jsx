import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CircuitWorkspace from './CircuitWorkspace.jsx'
import { TERMINAL_LABELS } from '../../circuit/circuitModel.js'

const L = TERMINAL_LABELS

function press(user, terminalId) {
  return user.click(screen.getByRole('button', { name: L[terminalId] }))
}

// Wires the single-bulb loop: + to the switch, through the switch and bulb 1, back to −
async function buildLoop(user) {
  await press(user, 'battery-plus')
  await press(user, 'switch-left')
  await press(user, 'switch-right')
  await press(user, 'bulb-1-top')
  await press(user, 'bulb-1-bottom')
  await press(user, 'battery-minus')
}

function litBulbs(container) {
  return container.querySelectorAll('.circuit-bulb.is-lit').length
}

describe('CircuitWorkspace layout and accessibility', () => {
  it('labels the board and gives every terminal a button with a clear name', () => {
    render(<CircuitWorkspace />)

    expect(screen.getByRole('group', { name: /Circuit board/ })).toBeInTheDocument()
    for (const label of Object.values(L)) {
      expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('starts with an empty board, a starting hint, and the switch open', () => {
    render(<CircuitWorkspace />)

    expect(screen.getByRole('heading', { level: 3, name: 'Start building' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close the switch' })).toBeInTheDocument()
    expect(screen.getByText('No wires yet.')).toBeInTheDocument()
  })

  it('announces results in a live status region', () => {
    render(<CircuitWorkspace />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('lets a keyboard user connect terminals with Enter and Space', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    screen.getByRole('button', { name: L['battery-plus'] }).focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: L['battery-plus'] })).toHaveAttribute('aria-pressed', 'true')

    screen.getByRole('button', { name: L['switch-left'] }).focus()
    await user.keyboard(' ')

    expect(screen.getByText(/Wire 1: Battery \+ \(plus\) terminal to Switch left terminal/)).toBeInTheDocument()
  })
})

describe('CircuitWorkspace circuit behavior', () => {
  it('lights the bulb when the loop is complete and the switch is closed', async () => {
    const user = userEvent.setup()
    const { container } = render(<CircuitWorkspace />)

    await buildLoop(user)
    expect(screen.getByRole('heading', { level: 3, name: 'The switch is open' })).toBeInTheDocument()
    expect(litBulbs(container)).toBe(0)

    await user.click(screen.getByRole('button', { name: 'Close the switch' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Complete circuit' })).toBeInTheDocument()
    expect(litBulbs(container)).toBe(1)
    expect(screen.getByText(/Bulb 1 is lit because current flows through it/)).toBeInTheDocument()
    expect(screen.getByText(/Bulb 2 is not on the loop, so no current flows through it/)).toBeInTheDocument()
    expect(container.querySelectorAll('.circuit-wire.is-flowing')).toHaveLength(3)
  })

  it('turns the bulb off when the switch is opened again', async () => {
    const user = userEvent.setup()
    const { container } = render(<CircuitWorkspace />)

    await buildLoop(user)
    await user.click(screen.getByRole('button', { name: 'Close the switch' }))
    expect(litBulbs(container)).toBe(1)

    await user.click(screen.getByRole('button', { name: 'Open the switch' }))

    expect(litBulbs(container)).toBe(0)
    expect(screen.getByRole('heading', { level: 3, name: 'The switch is open' })).toBeInTheDocument()
    expect(container.querySelectorAll('.circuit-wire.is-flowing')).toHaveLength(0)
  })

  it('explains a gap when a wire is missing', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await press(user, 'battery-plus')
    await press(user, 'switch-left')
    await user.click(screen.getByRole('button', { name: 'Close the switch' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Not a complete loop' })).toBeInTheDocument()
    expect(screen.getByText(/Connect a wire to the battery’s − terminal/)).toBeInTheDocument()
  })

  it('warns about a short circuit when + is wired straight to −', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await press(user, 'battery-plus')
    await press(user, 'battery-minus')

    expect(screen.getByRole('heading', { level: 3, name: 'Short circuit!' })).toBeInTheDocument()
    expect(within(screen.getByRole('status')).getByText(/Never connect a real battery’s \+ and − terminals with a wire/)).toBeInTheDocument()
    expect(within(screen.getByRole('status')).getByText(/overheat/)).toBeInTheDocument()
  })
})

describe('CircuitWorkspace connecting and disconnecting', () => {
  it('shows which terminal a wire is starting from, and lets the student cancel', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await press(user, 'battery-plus')

    expect(screen.getByRole('button', { name: L['battery-plus'] })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/Connecting from Battery \+ \(plus\) terminal/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel connection' }))

    expect(screen.getByRole('button', { name: L['battery-plus'] })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Connection cancelled.')).toBeInTheDocument()
  })

  it('cancels a pending connection with the Escape key', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await press(user, 'battery-plus')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('button', { name: 'Cancel connection' })).not.toBeInTheDocument()
    expect(screen.getByText('Connection cancelled.')).toBeInTheDocument()
  })

  it('clears the selection when the same terminal is pressed twice', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await press(user, 'battery-plus')
    await press(user, 'battery-plus')

    expect(screen.getByRole('button', { name: L['battery-plus'] })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByText(/Connecting from/)).not.toBeInTheDocument()
  })

  it('refuses to join two terminals that are already joined, in either direction', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await press(user, 'battery-plus')
    await press(user, 'switch-left')
    await press(user, 'switch-left')
    await press(user, 'battery-plus')

    expect(screen.getByText('Those two terminals are already joined.')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('removes a wire from the wire list, which is the keyboard route', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await press(user, 'battery-plus')
    await press(user, 'switch-left')
    await user.click(screen.getByRole('button', { name: 'Remove wire 1' }))

    expect(screen.getByText('No wires yet.')).toBeInTheDocument()
    expect(screen.getByText('Wire removed.')).toBeInTheDocument()
  })

  it('removes a wire from the board with its × button', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await press(user, 'battery-plus')
    await press(user, 'switch-left')
    await user.click(
      screen.getByRole('button', {
        name: `Remove wire from ${L['battery-plus']} to ${L['switch-left']}`,
      }),
    )

    expect(screen.getByText('No wires yet.')).toBeInTheDocument()
  })
})

describe('CircuitWorkspace current direction and safety', () => {
  it('explains that the dashes show conventional current, and that electrons move the other way', () => {
    render(<CircuitWorkspace />)

    expect(screen.getByText(/Moving dashes show conventional current/)).toBeInTheDocument()
    expect(screen.getByText(/flows from the \+ terminal toward/)).toBeInTheDocument()
    expect(screen.getByText(/Electrons in metal wires actually move the other way, from − to \+/)).toBeInTheDocument()
  })

  it('keeps a safety warning on the board at all times, not only after a short circuit', () => {
    render(<CircuitWorkspace />)

    expect(screen.getByText(/this is a pretend board/)).toBeInTheDocument()
    expect(screen.getByText(/can overheat and damage the battery, and it can start a fire/)).toBeInTheDocument()
  })

  it('animates a wire forward when current crosses it from + toward −', async () => {
    const user = userEvent.setup()
    const { container } = render(<CircuitWorkspace />)

    await user.click(screen.getByRole('button', { name: 'A complete loop' }))

    expect(container.querySelectorAll('.circuit-wire.is-flowing.is-forward')).toHaveLength(3)
    expect(container.querySelectorAll('.circuit-wire.is-reverse')).toHaveLength(0)
  })

  it('shows a solid highlight, with no direction, where current crosses a wire both ways', async () => {
    const user = userEvent.setup()
    const { container } = render(<CircuitWorkspace />)
    const mixedLoop = [
      ['battery-plus', 'switch-left'],
      ['switch-left', 'switch-right'],
      ['battery-plus', 'switch-right'],
      ['switch-right', 'bulb-1-top'],
      ['bulb-1-bottom', 'battery-minus'],
      ['switch-left', 'bulb-2-top'],
      ['bulb-2-bottom', 'battery-minus'],
    ]

    for (const [from, to] of mixedLoop) {
      await press(user, from)
      await press(user, to)
    }

    expect(container.querySelectorAll('.circuit-wire.is-flowing.is-steady')).toHaveLength(1)
    expect(container.querySelectorAll('.circuit-wire.is-forward')).toHaveLength(6)
  })
})

describe('CircuitWorkspace reset and examples', () => {
  it('reset clears the wires and opens the switch', async () => {
    const user = userEvent.setup()
    const { container } = render(<CircuitWorkspace />)

    await buildLoop(user)
    await user.click(screen.getByRole('button', { name: 'Close the switch' }))
    expect(litBulbs(container)).toBe(1)

    await user.click(screen.getByRole('button', { name: 'Reset circuit' }))

    expect(screen.getByText('No wires yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close the switch' })).toBeInTheDocument()
    expect(litBulbs(container)).toBe(0)
    expect(screen.getByRole('heading', { level: 3, name: 'Start building' })).toBeInTheDocument()
  })

  it('loads a preset example with its wires and switch position', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await user.click(screen.getByRole('button', { name: 'A complete loop' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Complete circuit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open the switch' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Loaded: A complete loop.')).toBeInTheDocument()
  })

  it('shows the short circuit example as dangerous', async () => {
    const user = userEvent.setup()
    render(<CircuitWorkspace />)

    await user.click(screen.getByRole('button', { name: 'A short circuit' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Short circuit!' })).toBeInTheDocument()
  })

  it('lets a student replace an example with a different one', async () => {
    const user = userEvent.setup()
    const { container } = render(<CircuitWorkspace />)

    await user.click(screen.getByRole('button', { name: 'Two bulbs in a row' }))
    expect(litBulbs(container)).toBe(2)

    await user.click(screen.getByRole('button', { name: 'Two bulbs side by side' }))
    expect(within(container).getAllByRole('button', { name: /^Remove wire \d+$/ })).toHaveLength(5)
    expect(litBulbs(container)).toBe(2)
  })
})
