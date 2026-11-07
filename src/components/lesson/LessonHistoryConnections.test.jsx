import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LessonHistoryConnections from './LessonHistoryConnections.jsx'

function renderConnections(lessonId) {
  return render(
    <MemoryRouter>
      <LessonHistoryConnections lessonId={lessonId} />
    </MemoryRouter>,
  )
}

describe('LessonHistoryConnections', () => {
  it('links the lesson to the milestones behind its ideas, using timeline anchors', () => {
    renderConnections('concept-001')
    const panel = screen.getByRole('complementary', { name: 'Where these ideas came from' })

    expect(within(panel).getByRole('link', { name: /Two kinds of electricity/ })).toHaveAttribute(
      'href',
      '/history#du-fay-two-kinds',
    )
    expect(within(panel).getByRole('link', { name: /The electron/ })).toHaveAttribute(
      'href',
      '/history#thomson-electron',
    )
  })

  it('shows the primary milestone for Electricity Mysteries and its related discovery', () => {
    renderConnections('history-001')
    const panel = screen.getByRole('complementary', { name: 'Where these ideas came from' })

    expect(within(panel).getByRole('link', { name: /Thales and rubbed amber/ })).toHaveAttribute(
      'href',
      '/history#thales-amber',
    )
    expect(within(panel).getByRole('link', { name: /Gilbert names/ })).toHaveAttribute(
      'href',
      '/history#gilbert-electric',
    )
  })

  it('offers a way back to the timeline', () => {
    renderConnections('concept-002')

    expect(screen.getByRole('link', { name: 'Back to the timeline' })).toHaveAttribute('href', '/history')
  })

  it('renders nothing for a lesson with no historical connection', () => {
    const { container } = renderConnections('not-a-lesson')

    expect(container).toBeEmptyDOMElement()
  })
})
