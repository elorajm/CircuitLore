import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RubAttractActivity from './RubAttractActivity.jsx'

async function chargeRod(user) {
  for (let count = 0; count < 3; count += 1) {
    await user.click(screen.getByRole('button', { name: 'Rub the rod' }))
  }
}

describe('RubAttractActivity', () => {
  it('keeps the hold action disabled until the rod is charged', async () => {
    const user = userEvent.setup()
    render(<RubAttractActivity onCompleted={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Hold rod near the paper' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Rub the rod' }))

    expect(screen.getByText('Rubbed 1 of 3 times. The rod is not charged yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hold rod near the paper' })).toBeDisabled()

    await chargeRod(user)

    expect(screen.getByRole('button', { name: 'Hold rod near the paper' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Rub the rod' })).toBeDisabled()
  })

  it('shows text feedback and reports completion once the paper is pulled', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<RubAttractActivity onCompleted={onCompleted} />)

    await chargeRod(user)
    await user.click(screen.getByRole('button', { name: 'Hold rod near the paper' }))

    expect(screen.getByRole('status')).toHaveTextContent('The paper bits jumped toward the rod.')
    expect(onCompleted).toHaveBeenCalledTimes(1)
  })

  it('starts over with a discharged rod and no pulled paper', async () => {
    const user = userEvent.setup()
    render(<RubAttractActivity onCompleted={vi.fn()} />)

    await chargeRod(user)
    await user.click(screen.getByRole('button', { name: 'Start over' }))

    expect(screen.getByText('Rubs: 0 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rub the rod' })).toBeEnabled()
  })
})
