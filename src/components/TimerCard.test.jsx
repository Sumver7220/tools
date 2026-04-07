import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, afterEach } from 'vitest'
import TimerCard from './TimerCard'

const EMP = { id: '1', name: '小花', avatarUrl: '' }

afterEach(() => vi.useRealTimers())

describe('idle state', () => {
  it('renders employee name', () => {
    render(<TimerCard employee={EMP} onSessionComplete={() => {}} />)
    expect(screen.getByText('小花')).toBeInTheDocument()
  })

  it('shows 10, 20, 30 start buttons', () => {
    render(<TimerCard employee={EMP} onSessionComplete={() => {}} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })
})

describe('running state', () => {
  it('shows countdown MM:SS after clicking start', async () => {
    const user = userEvent.setup()
    render(<TimerCard employee={EMP} onSessionComplete={() => {}} />)
    await user.click(screen.getByText('10'))
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('hides start buttons while running', async () => {
    const user = userEvent.setup()
    render(<TimerCard employee={EMP} onSessionComplete={() => {}} />)
    await user.click(screen.getByText('10'))
    expect(screen.queryByText('20')).not.toBeInTheDocument()
  })
})

describe('completion', () => {
  it('calls onSessionComplete(employeeId, durationMinutes) when timer reaches zero', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TimerCard employee={EMP} onSessionComplete={onComplete} />)
    await user.click(screen.getByText('10'))
    act(() => vi.advanceTimersByTime(10 * 60 * 1000 + 500))
    expect(onComplete).toHaveBeenCalledWith('1', 10)
  })
})
