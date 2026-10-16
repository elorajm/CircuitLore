import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LessonComplete from './LessonComplete.jsx'

function renderComplete(props) {
  return render(
    <MemoryRouter>
      <LessonComplete lessonTitle="Electricity Mysteries" totalQuestions={3} {...props} />
    </MemoryRouter>,
  )
}

describe('LessonComplete', () => {
  it('congratulates the student and shows the saved quiz score', () => {
    renderComplete({ quizScore: 3 })

    expect(screen.getByRole('heading', { level: 2, name: 'Congratulations!' })).toBeInTheDocument()
    expect(screen.getByText('You completed Electricity Mysteries!')).toBeInTheDocument()
    expect(screen.getByText('3 out of 3 correct')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Your progress has been saved.')
  })

  it('links back to the Learning Journey', () => {
    renderComplete({ quizScore: 2 })

    expect(screen.getByRole('link', { name: 'Return to Learning Journey' })).toHaveAttribute(
      'href',
      '/journey',
    )
  })

  it('omits the score line when no quiz score was recorded', () => {
    renderComplete({ quizScore: null })

    expect(screen.queryByText(/out of/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Congratulations!' })).toBeInTheDocument()
  })
})
