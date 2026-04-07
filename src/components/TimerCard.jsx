import { useState, useEffect, useRef } from 'react'

function pad(n) { return String(n).padStart(2, '0') }
function fmt(sec) { return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}` }

function barColor(remaining) {
  if (remaining <= 0) return 'bg-red-500'
  if (remaining <= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}
function timeColor(remaining) {
  return remaining <= 60 ? 'text-yellow-400' : 'text-green-400'
}

export default function TimerCard({ employee, onSessionComplete }) {
  const [total, setTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState(0)

  const completeRef = useRef(onSessionComplete)
  completeRef.current = onSessionComplete

  const remainingRef = useRef(0)
  const durationRef = useRef(0)
  const employeeIdRef = useRef(employee.id)
  employeeIdRef.current = employee.id

  useEffect(() => {
    if (!running) return

    const id = setInterval(() => {
      remainingRef.current -= 1
      setRemaining(remainingRef.current)

      if (remainingRef.current <= 0) {
        clearInterval(id)
        setRunning(false)
        setTotal(0)
        setRemaining(0)
        completeRef.current(employeeIdRef.current, durationRef.current)
      }
    }, 1000)

    return () => clearInterval(id)
  }, [running])

  function start(minutes) {
    const secs = minutes * 60
    durationRef.current = minutes
    remainingRef.current = secs
    setDurationMinutes(minutes)
    setTotal(secs)
    setRemaining(secs)
    setRunning(true)
  }

  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-3 w-36">
      <img
        src={employee.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}&backgroundColor=374151`}
        alt={employee.name}
        className="w-14 h-14 rounded-full object-cover bg-gray-700"
      />
      <span className="text-sm font-medium">{employee.name}</span>

      {running ? (
        <div className="w-full space-y-1">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-1000 ${barColor(remaining)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`text-center font-mono font-bold text-base ${timeColor(remaining)}`}>
            {fmt(remaining)}
          </p>
        </div>
      ) : (
        <div className="flex gap-1.5">
          {[10, 20, 30].map(min => (
            <button key={min} onClick={() => start(min)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2 py-1 rounded transition-colors">
              {min}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
