import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KnowledgeCheck from './KnowledgeCheck.jsx'
import history001 from '../../content/history/history001.js'

const questions = history001.steps.find((step) => step.type === 'quiz').questions

function answerAll(user, answers) {
  return Promise.all(
    answers.map((label) => user.click(screen.getByRole('radio', { name: label }))),
  )
}

const correctAnswers = [
  'Electricity',
  'It moved tiny charged particles (electrons) onto the balloon',
  'The charges inside the paper shift, so the side nearest the rod becomes the opposite charge and is pulled in',
]

describe('KnowledgeCheck', () => {
  it('keeps Check answers disabled until every question is answered', async () => {
    const user = userEvent.setup()
    render(<KnowledgeCheck questions={questions} onChecked={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Check answers' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Electricity' }))
    await user.click(screen.getByRole('radio', { name: correctAnswers[1] }))

    expect(screen.getByRole('button', { name: 'Check answers' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: correctAnswers[2] }))

    expect(screen.getByRole('button', { name: 'Check answers' })).toBeEnabled()
  })

  it('scores the answers, shows explanations, and reports the score', async () => {
    const user = userEvent.setup()
    const onChecked = vi.fn()
    render(<KnowledgeCheck questions={questions} onChecked={onChecked} />)

    await answerAll(user, ['Electricity', 'It made the balloon heavier', correctAnswers[2]])
    await user.click(screen.getByRole('button', { name: 'Check answers' }))

    expect(onChecked).toHaveBeenCalledWith(2)
    expect(screen.getByText('You got 2 out of 3 correct.')).toBeInTheDocument()
    expect(screen.getAllByText('Correct.')).toHaveLength(2)
    expect(screen.getByText(/Not quite\. The answer is "It moved tiny charged particles/)).toBeInTheDocument()
    expect(screen.getByText(questions[1].explanation)).toBeInTheDocument()
  })

  it('clears answers and feedback on Try again, then accepts a new check', async () => {
    const user = userEvent.setup()
    const onChecked = vi.fn()
    render(<KnowledgeCheck questions={questions} onChecked={onChecked} />)

    await answerAll(user, ['Gravity', 'It made the balloon heavier', 'The paper is secretly charged'])
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    expect(onChecked).toHaveBeenLastCalledWith(0)

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.queryByText(questions[0].explanation)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check answers' })).toBeDisabled()

    await answerAll(user, correctAnswers)
    await user.click(screen.getByRole('button', { name: 'Check answers' }))

    expect(onChecked).toHaveBeenLastCalledWith(3)
    expect(screen.getByText('You got 3 out of 3 correct.')).toBeInTheDocument()
  })
})
