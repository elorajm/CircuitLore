// Model for the Power the House activity.
//
// Power is how fast a device uses electricity, measured in watts (W).
// Energy is power used over time, measured in watt-hours (Wh): energy = power × hours.
//
// All device wattages are illustrative. Real devices vary by model.
// The challenge limit is a fictional number made up for this activity. Real circuits have their own
// limits, set by the breaker that protects them.

export const CHALLENGE_LIMIT_WATTS = 1800

export const DEVICES = [
  { id: 'led-lamp', label: 'LED lamp', watts: 10 },
  { id: 'laptop', label: 'Laptop', watts: 60 },
  { id: 'tv', label: 'TV', watts: 100 },
  { id: 'refrigerator', label: 'Refrigerator (average)', watts: 150 },
  { id: 'microwave', label: 'Microwave', watts: 1000 },
  { id: 'hair-dryer', label: 'Hair dryer', watts: 1500 },
]

const DEVICE_BY_ID = Object.fromEntries(DEVICES.map((device) => [device.id, device]))

// Total power, in watts, of the devices that are on
export function totalWatts(onDeviceIds) {
  return onDeviceIds.reduce((sum, id) => sum + (DEVICE_BY_ID[id]?.watts ?? 0), 0)
}

// The breaker trips only when the total is over the limit. Exactly at the limit is still safe.
export function breakerTrips(watts) {
  return watts > CHALLENGE_LIMIT_WATTS
}

// Energy used by a device running for some hours, in watt-hours
export function energyWattHours(watts, hours) {
  return watts * hours
}

export function deviceById(id) {
  return DEVICE_BY_ID[id]
}
