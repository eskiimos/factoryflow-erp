import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock global fetch for API tests
global.fetch = vi.fn()

// Setup custom matchers
beforeEach(() => {
  vi.clearAllMocks()
})
