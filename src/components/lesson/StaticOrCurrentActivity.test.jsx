import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaticOrCurrentActivity from './StaticOrCurrentActivity.jsx'

const STATIC_LABEL = 'Static electricity'
const CURRENT_LABEL = 'Electric current'

// Answers in the order the examples appear on screen
const CORRECT_ANSWERS = [STATIC_LABEL, CURRENT_LABEL, STATIC_LABEL, CURRENT_LABEL]

function exampleFieldset(number) {
  return screen.getByRole('group', { name: new RegExp(`^${number}\\. `) })
}

async function answerAll(user, labels) {
  for (const [index, label] of labels.entries()) {
    await user.click(within(exampleFieldset(index + 1)).getByRole('radio', { name: label }))
  }
}

describe('StaticOrCurrentActivity', () => {
  it('shows four examples, each with a static and a current choice', () => {
    render(<StaticOrCurrentActivity onCompleted={vi.fn()} />)

    expect(screen.getAllByRole('group')).toHaveLength(4)
    for (let number = 1; number <= 4; number += 1) {
      const fieldset = exampleFieldset(number)
      expect(within(fieldset).getByRole('radio', { name: STATIC_LABEL })).toBeInTheDocument()
      expect(within(fieldset).getByRole('radio', { name: CURRENT_LABEL })).toBeInTheDocument()
    }
  })

  it('gives a nudge without the answer for a wrong choice, and no explanation yet', async () => {
    const user = userEvent.setup()
    render(<StaticOrCurrentActivity onCompleted={vi.fn()} />)

    await user.click(within(exampleFieldset(1)).getByRole('radio', { name: CURRENT_LABEL }))

    const fieldset = exampleFieldset(1)
    expect(within(fieldset).getByText(/Not quite\. Ask yourself/)).toBeInTheDocument()
    expect(within(fieldset).queryByText(/The charge stays on the balloon/)).not.toBeInTheDocument()
    expect(within(fieldset).queryByText('Correct.')).not.toBeInTheDocument()
  })

  it('shows the explanation when the choice is correct', async () => {
    const user = userEvent.setup()
    render(<StaticOrCurrentActivity onCompleted={vi.fn()} />)

    await user.click(within(exampleFieldset(1)).getByRole('radio', { name: STATIC_LABEL }))

    const fieldset = exampleFieldset(1)
    expect(within(fieldset).getByText('Correct.')).toBeInTheDocument()
    expect(within(fieldset).getByText(/The charge stays on the balloon/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Correct so far: 1 of 4.')
  })

  it('does not complete the activity until all four examples are correct', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<StaticOrCurrentActivity onCompleted={onCompleted} />)

    await answerAll(user, CORRECT_ANSWERS.slice(0, 3))

    expect(onCompleted).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Correct so far: 3 of 4.')
  })

  it('completes once when all four examples are sorted correctly', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<StaticOrCurrentActivity onCompleted={onCompleted} />)

    await answerAll(user, CORRECT_ANSWERS)

    expect(onCompleted).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('All four examples are sorted correctly.')
  })

  it('does not complete again when a student changes an answer after finishing', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<StaticOrCurrentActivity onCompleted={onCompleted} />)

    await answerAll(user, CORRECT_ANSWERS)
    await user.click(within(exampleFieldset(2)).getByRole('radio', { name: STATIC_LABEL }))
    await user.click(within(exampleFieldset(2)).getByRole('radio', { name: CURRENT_LABEL }))

    expect(onCompleted).toHaveBeenCalledTimes(1)
  })
})
