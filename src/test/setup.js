import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Patch asyncWrapper to advance vitest fake timers (vi) in addition to jest fake timers.
// @testing-library/react only advances jest timers by default; this ensures compatibility
// when vi.useFakeTimers() is active.
configure({
  asyncWrapper: async (cb) => {
    const result = await cb()
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
      // Advance vitest fake timers if active
      if (typeof vi !== 'undefined' && typeof vi.advanceTimersByTime === 'function') {
        try { vi.advanceTimersByTime(0) } catch (_) { /* not in fake timer mode */ }
      }
    })
    return result
  },
})
