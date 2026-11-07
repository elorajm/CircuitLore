import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CircuitLab from './CircuitLab.jsx'

function renderLab() {
  return render(
    <MemoryRouter>
      <CircuitLab />
    </MemoryRouter>,
  )
}

describe('CircuitLab page', () => {
  it('introduces the lab with a heading, and no longer shows the placeholder list', () => {
    renderLab()

    expect(screen.getByText('Virtual Circuit Lab')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Build a Circuit' })).toBeInTheDocument()
    expect(screen.queryByText(/Planned features/i)).not.toBeInTheDocument()
  })

  it('gives Quill’s tips for connecting, closing the loop, comparing bulbs, and staying safe', () => {
    renderLab()
    const tips = screen.getByRole('complementary', { name: 'Quill’s tips' })

    expect(tips).toHaveTextContent('Press the battery’s + (plus) terminal')
    expect(tips).toHaveTextContent('Close the switch to let current flow')
    expect(tips).toHaveTextContent('bulbs in a row')
    expect(tips).toHaveTextContent('never connect a battery’s + and − ends with a wire')
  })

  it('explains conventional current and the opposite movement of electrons in Quill’s tips', () => {
    renderLab()
    const tips = screen.getByRole('complementary', { name: 'Quill’s tips' })

    expect(tips).toHaveTextContent('They show conventional current, from + to −')
    expect(tips).toHaveTextContent('Electrons in metal wires actually move the other way, from − to +')
  })

  it('shows the working circuit board, ready to use without signing in', () => {
    renderLab()

    expect(screen.getByRole('group', { name: /Circuit board/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Start building' })).toBeInTheDocument()
  })

  it('links to the Electric Current lesson and to Volta on the timeline', () => {
    renderLab()

    expect(screen.getByRole('link', { name: 'Read the Electric Current lesson' })).toHaveAttribute(
      'href',
      '/journey/concept-002',
    )
    expect(screen.getByRole('link', { name: 'Meet Volta and his battery' })).toHaveAttribute(
      'href',
      '/history#volta-pile',
    )
  })
})
