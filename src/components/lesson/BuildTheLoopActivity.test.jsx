import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BuildTheLoopActivity from './BuildTheLoopActivity.jsx'

const COPPER = 'Copper wire'
const PLASTIC = 'Plastic strip'
const OPEN = 'Leave a gap'

function gapGroup(name) {
  return screen.getByRole('group', { name })
}

async function pick(user, gapName, choice) {
  await user.click(within(gapGroup(gapName)).getByRole('radio', { name: choice }))
}

function bulbLabel() {
  return document.querySelector('.loop-bulb')
}

describe('BuildTheLoopActivity', () => {
  it('starts with both gaps unanswered and the bulb off', () => {
    render(<BuildTheLoopActivity onCompleted={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent('Choose a wire for each gap')
    expect(bulbLabel()).not.toHaveClass('is-lit')
    expect(within(gapGroup('Top wire')).getAllByRole('radio')).toHaveLength(3)
    expect(within(gapGroup('Bottom wire')).getAllByRole('radio')).toHaveLength(3)
  })

  it('lights the bulb only when both gaps are filled with copper wire', async () => {
    const user = userEvent.setup()
    render(<BuildTheLoopActivity onCompleted={vi.fn()} />)

    await pick(user, 'Top wire', COPPER)
    expect(bulbLabel()).not.toHaveClass('is-lit')

    await pick(user, 'Bottom wire', COPPER)
    expect(bulbLabel()).toHaveClass('is-lit')
    expect(screen.getByRole('status')).toHaveTextContent('The bulb is lit!')
  })

  it('explains that plastic blocks the flow when a gap holds plastic', async () => {
    const user = userEvent.setup()
    render(<BuildTheLoopActivity onCompleted={vi.fn()} />)

    await pick(user, 'Top wire', COPPER)
    await pick(user, 'Bottom wire', PLASTIC)

    expect(bulbLabel()).not.toHaveClass('is-lit')
    expect(screen.getByRole('status')).toHaveTextContent('Plastic is an insulator')
  })

  it('explains that an open gap breaks the loop', async () => {
    const user = userEvent.setup()
    render(<BuildTheLoopActivity onCompleted={vi.fn()} />)

    await pick(user, 'Top wire', COPPER)
    await pick(user, 'Bottom wire', OPEN)

    expect(bulbLabel()).not.toHaveClass('is-lit')
    expect(screen.getByRole('status')).toHaveTextContent('A gap in the loop')
  })

  it('does not complete when the student only lights the bulb', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<BuildTheLoopActivity onCompleted={onCompleted} />)

    await pick(user, 'Top wire', COPPER)
    await pick(user, 'Bottom wire', COPPER)

    expect(onCompleted).not.toHaveBeenCalled()
  })

  it('completes once after the student lights the bulb and then breaks the loop', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<BuildTheLoopActivity onCompleted={onCompleted} />)

    await pick(user, 'Top wire', COPPER)
    await pick(user, 'Bottom wire', COPPER)
    await pick(user, 'Bottom wire', OPEN)

    expect(onCompleted).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('You built a complete loop, then broke it')

    await pick(user, 'Bottom wire', COPPER)
    await pick(user, 'Bottom wire', PLASTIC)
    expect(onCompleted).toHaveBeenCalledTimes(1)
  })

  it('does not complete when the loop is broken before it was ever lit', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<BuildTheLoopActivity onCompleted={onCompleted} />)

    await pick(user, 'Top wire', COPPER)
    await pick(user, 'Bottom wire', OPEN)

    expect(onCompleted).not.toHaveBeenCalled()
  })
})
