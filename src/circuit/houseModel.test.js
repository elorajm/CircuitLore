import { describe, it, expect } from 'vitest'
import {
  CHALLENGE_LIMIT_WATTS,
  DEVICES,
  breakerTrips,
  deviceById,
  energyWattHours,
  totalWatts,
} from './houseModel.js'

describe('houseModel power', () => {
  it('adds up only the devices that are on', () => {
    expect(totalWatts(['tv', 'laptop'])).toBe(160)
    expect(totalWatts([])).toBe(0)
  })

  it('ignores an unknown device id rather than failing', () => {
    expect(totalWatts(['not-a-device', 'led-lamp'])).toBe(10)
  })

  it('trips the breaker only when the total is over the challenge limit', () => {
    expect(breakerTrips(CHALLENGE_LIMIT_WATTS)).toBe(false)
    expect(breakerTrips(CHALLENGE_LIMIT_WATTS + 1)).toBe(true)
  })

  it('keeps the challenge limit at 1,800 watts', () => {
    expect(CHALLENGE_LIMIT_WATTS).toBe(1800)
  })
})

describe('houseModel energy (watt-hours)', () => {
  it('multiplies power by hours of use', () => {
    expect(energyWattHours(100, 3)).toBe(300)
    expect(energyWattHours(10, 1)).toBe(10)
  })

  it('shows that a bigger device for less time can use less energy than a smaller one for longer', () => {
    // A 1,500 W hair dryer for 0.1 hours (6 minutes) uses less energy than a 100 W TV for 2 hours
    expect(energyWattHours(1500, 0.1)).toBeLessThan(energyWattHours(100, 2))
  })
})

describe('houseModel devices', () => {
  it('gives every device a unique id and a positive wattage', () => {
    const ids = DEVICES.map((device) => device.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const device of DEVICES) {
      expect(device.watts).toBeGreaterThan(0)
    }
  })

  it('finds a device by id', () => {
    expect(deviceById('microwave')).toEqual({ id: 'microwave', label: 'Microwave', watts: 1000 })
    expect(deviceById('nope')).toBeUndefined()
  })
})
