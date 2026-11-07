import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PowerTheHouseActivity from './PowerTheHouseActivity.jsx'

function device(name) {
  return screen.getByRole('button', { name })
}

describe('PowerTheHouseActivity devices', () => {
  it('shows every device as a button with its wattage and starts with everything off', () => {
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Microwave, 1,000 W' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'LED lamp, 10 W' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getAllByRole('button', { name: /W$/ })).toHaveLength(6)
  })

  it('turns a device on and off, and updates the total power in watts', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('TV, 100 W'))
    expect(device('TV, 100 W')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('100 W of 1,800 W')).toBeInTheDocument()

    await user.click(device('TV, 100 W'))
    expect(device('TV, 100 W')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('0 W of 1,800 W')).toBeInTheDocument()
  })

  it('explains energy in watt-hours alongside power in watts', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('TV, 100 W'))

    expect(screen.getByText(/ran for one hour, they would use/)).toBeInTheDocument()
    expect(screen.getByText('100 Wh', { selector: 'strong' })).toBeInTheDocument()
    // The definitions stay visible while devices are on, so power and energy are never confused
    expect(screen.getByText(/is measured in watts \(W\): how fast a device uses electricity/)).toBeInTheDocument()
    expect(screen.getByText(/is measured in watt-hours \(Wh\): power multiplied by time/)).toBeInTheDocument()
  })

  it('exposes the total as a labeled progress value', async () => {
    const user = userEvent.setup()
    const { container } = render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('LED lamp, 10 W'))

    const meter = container.querySelector('progress')
    expect(meter).toHaveAttribute('value', '10')
    expect(meter).toHaveAttribute('max', '1800')
    expect(meter).toHaveAttribute('aria-label', expect.stringContaining('fictional challenge limit'))
  })

  it('labels the 1,800 W limit as fictional and the wattages as illustrative', () => {
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    expect(screen.getByText(/Challenge limit: 1,800 W. This limit is fictional/)).toBeInTheDocument()
    expect(screen.getByText(/All wattages are illustrative/)).toBeInTheDocument()
  })

  it('stays under the limit without tripping the breaker', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('Hair dryer, 1,500 W'))
    await user.click(device('TV, 100 W'))
    await user.click(device('Laptop, 60 W'))
    await user.click(device('LED lamp, 10 W'))

    expect(screen.getByRole('heading', { level: 3, name: 'Power is on' })).toBeInTheDocument()
    expect(screen.getByText(/The total is 1,670 W, under the challenge limit/)).toBeInTheDocument()
  })
})

describe('PowerTheHouseActivity breaker', () => {
  it('trips the breaker when the total goes over the limit, and switches every device off', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))

    expect(screen.getByRole('heading', { level: 3, name: 'Breaker tripped!' })).toBeInTheDocument()
    expect(screen.getByText(/The total reached 2,500 W, which is over the 1,800 W challenge limit/)).toBeInTheDocument()
    expect(screen.getByText(/protect the wires from overheating/)).toBeInTheDocument()
    expect(device('Microwave, 1,000 W')).toHaveAttribute('aria-pressed', 'false')
    expect(device('Hair dryer, 1,500 W')).toHaveAttribute('aria-pressed', 'false')
    expect(device('Microwave, 1,000 W')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset breaker' })).toBeEnabled()
  })

  it('trips when a device pushes the total over the limit even with others already on', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('Hair dryer, 1,500 W'))
    await user.click(device('TV, 100 W'))
    await user.click(device('Laptop, 60 W'))
    await user.click(device('LED lamp, 10 W'))
    await user.click(device('Refrigerator (average), 150 W'))

    expect(screen.getByRole('heading', { level: 3, name: 'Breaker tripped!' })).toBeInTheDocument()
    expect(screen.getByText(/The total reached 1,820 W/)).toBeInTheDocument()
  })

  it('keeps the reset button disabled until the breaker has tripped', () => {
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Reset breaker' })).toBeDisabled()
  })

  it('does not let devices be switched on while the breaker is tripped', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))
    await user.click(device('LED lamp, 10 W'))

    expect(device('LED lamp, 10 W')).toHaveAttribute('aria-pressed', 'false')
  })

  it('restores power when the breaker is reset, and devices stay off until they are turned on again', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))
    await user.click(screen.getByRole('button', { name: 'Reset breaker' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Breaker reset' })).toBeInTheDocument()
    expect(device('Microwave, 1,000 W')).toBeEnabled()
    expect(device('Microwave, 1,000 W')).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('PowerTheHouseActivity completion', () => {
  it('does not complete while the student is only turning devices on and off', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<PowerTheHouseActivity onCompleted={onCompleted} />)

    await user.click(device('TV, 100 W'))
    await user.click(device('TV, 100 W'))

    expect(onCompleted).not.toHaveBeenCalled()
  })

  it('completes once, after the breaker trips, is reset, and two appliances run under the limit', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<PowerTheHouseActivity onCompleted={onCompleted} />)

    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))
    expect(onCompleted).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Reset breaker' }))
    expect(onCompleted).not.toHaveBeenCalled()

    await user.click(device('TV, 100 W'))
    expect(onCompleted).not.toHaveBeenCalled()
    await user.click(device('Laptop, 60 W'))
    expect(onCompleted).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('heading', { level: 3, name: 'Challenge complete' })).toBeInTheDocument()

    await user.click(device('TV, 100 W'))
    await user.click(device('TV, 100 W'))
    expect(onCompleted).toHaveBeenCalledTimes(1)
  })

  it('does not complete on a trip and reset alone, without running two appliances under the limit', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<PowerTheHouseActivity onCompleted={onCompleted} />)

    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))
    await user.click(screen.getByRole('button', { name: 'Reset breaker' }))
    await user.click(device('TV, 100 W'))

    expect(onCompleted).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 3, name: 'Breaker reset' })).toBeInTheDocument()
    expect(screen.getByText(/Now turn on at least two appliances and keep the total under 1,800 W/)).toBeInTheDocument()
  })

  it('does not count two appliances that trip the breaker again after the reset', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<PowerTheHouseActivity onCompleted={onCompleted} />)

    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))
    await user.click(screen.getByRole('button', { name: 'Reset breaker' }))
    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))

    expect(onCompleted).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 3, name: 'Breaker tripped!' })).toBeInTheDocument()
  })

  it('shows the four goals as to-do until the student reaches them, in order', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)
    const goals = () => screen.getByRole('list', { name: 'Activity goals' })

    expect(within(goals()).getAllByText('To do')).toHaveLength(4)

    await user.click(device('TV, 100 W'))
    expect(within(goals()).getAllByText('Done')).toHaveLength(1)

    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))
    expect(within(goals()).getAllByText('Done')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Reset breaker' }))
    expect(within(goals()).getAllByText('Done')).toHaveLength(3)

    await user.click(device('TV, 100 W'))
    await user.click(device('Laptop, 60 W'))
    expect(within(goals()).getAllByText('Done')).toHaveLength(4)
  })

  it('names the four goals in order, so students know what the activity asks', () => {
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)
    const items = within(screen.getByRole('list', { name: 'Activity goals' })).getAllByRole('listitem')

    expect(items[0]).toHaveTextContent('Turn on appliances and watch the total wattage')
    expect(items[1]).toHaveTextContent('Go over the 1,800 W challenge limit to trip the breaker')
    expect(items[2]).toHaveTextContent('Reset the breaker')
    expect(items[3]).toHaveTextContent('Turn on at least two appliances and stay under the limit')
  })

  it('does not complete on a reset that happens without a trip', async () => {
    const user = userEvent.setup()
    const onCompleted = vi.fn()
    render(<PowerTheHouseActivity onCompleted={onCompleted} />)

    await user.click(device('TV, 100 W'))

    expect(screen.getByRole('button', { name: 'Reset breaker' })).toBeDisabled()
    expect(onCompleted).not.toHaveBeenCalled()
  })
})

describe('PowerTheHouseActivity keyboard use', () => {
  it('turns a device on from the keyboard with Enter', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    device('Laptop, 60 W').focus()
    await user.keyboard('{Enter}')

    expect(device('Laptop, 60 W')).toHaveAttribute('aria-pressed', 'true')
  })

  it('resets the breaker from the keyboard with Space', async () => {
    const user = userEvent.setup()
    render(<PowerTheHouseActivity onCompleted={vi.fn()} />)

    await user.click(device('Microwave, 1,000 W'))
    await user.click(device('Hair dryer, 1,500 W'))
    const reset = screen.getByRole('button', { name: 'Reset breaker' })
    reset.focus()
    await user.keyboard(' ')

    expect(within(screen.getByRole('status')).getByRole('heading', { level: 3 })).toHaveTextContent('Breaker reset')
  })
})
