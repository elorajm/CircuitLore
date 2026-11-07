import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LessonCallout from './LessonCallout.jsx'

describe('LessonCallout', () => {
  it('shows a label and the step text', () => {
    render(<LessonCallout label="Quill’s challenge">Build the loop.</LessonCallout>)

    expect(screen.getByText('Quill’s challenge')).toBeInTheDocument()
    expect(screen.getByText('Build the loop.')).toBeInTheDocument()
  })
})
