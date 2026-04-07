import { useState } from 'react'
import TimerCard from '../components/TimerCard'

const MOCK_EMPLOYEES = [
  { id: '1', name: '小花', avatarUrl: '', active: true },
  { id: '2', name: '小玉', avatarUrl: '', active: true },
  { id: '3', name: '小月', avatarUrl: '', active: true },
  { id: '4', name: '小星', avatarUrl: '', active: true },
]

export default function Timer() {
  const [attending, setAttending] = useState(new Set())
  const [sessionCounts, setSessionCounts] = useState({})

  function toggleAttendance(id) {
    setAttending(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSessionComplete(employeeId, _durationMinutes) {
    setSessionCounts(prev => ({ ...prev, [employeeId]: (prev[employeeId] || 0) + 1 }))
  }

  const activeEmployees = MOCK_EMPLOYEES.filter(e => e.active && attending.has(e.id))

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">今日出勤</h2>
        <div className="flex flex-wrap gap-2">
          {MOCK_EMPLOYEES.filter(e => e.active).map(emp => {
            const isOn = attending.has(emp.id)
            return (
              <button key={emp.id} onClick={() => toggleAttendance(emp.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isOn ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}&backgroundColor=374151`}
                  className="w-5 h-5 rounded-full" alt="" />
                {emp.name}
                {sessionCounts[emp.id]
                  ? <span className="text-xs opacity-70">{sessionCounts[emp.id]}節</span>
                  : null}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">計時中</h2>
        {activeEmployees.length === 0
          ? <p className="text-gray-600 text-sm">請從上方選擇今日出勤員工</p>
          : (
            <div className="flex flex-wrap gap-4">
              {activeEmployees.map(emp => (
                <TimerCard key={emp.id} employee={emp} onSessionComplete={handleSessionComplete} />
              ))}
            </div>
          )}
      </section>
    </div>
  )
}
