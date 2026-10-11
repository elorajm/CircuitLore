// Adds jest-dom matchers (toBeInTheDocument, etc.) to every Vitest test file.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount rendered components after each test so the DOM doesn't leak between tests.
afterEach(() => {
  cleanup()
})
