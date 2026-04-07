import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TimerCard from '../components/TimerCard'
import { useEmployees } from '../contexts/EmployeesContext'

const SectionTitle = ({ children }) => (
  <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
    {children}
  </h2>
)

export default function Timer() {
  const { employees } = useEmployees()
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

  function handleSessionComplete(employeeId) {
    setSessionCounts(prev => ({ ...prev, [employeeId]: (prev[employeeId] || 0) + 1 }))
  }

  const activeEmployees = employees.filter(e => e.active && attending.has(e.id))

  return (
    <div className="space-y-8 animate-fade-up">
      {/* 頁首 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Syne, Inter, sans-serif' }}>點台計時</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>選擇今日出勤員工，開始計時管理。</p>
      </div>

      {/* 今日出勤 */}
      <section>
        <SectionTitle>今日出勤</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {employees.filter(e => e.active).map(emp => {
            const isOn = attending.has(emp.id)
            return (
              <motion.button
                key={emp.id}
                onClick={() => toggleAttendance(emp.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                layout
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={isOn ? {
                  background: 'linear-gradient(90deg, rgba(124,58,237,0.3) 0%, rgba(168,85,247,0.15) 100%)',
                  border: '1px solid rgba(139,92,246,0.5)',
                  color: '#a78bfa',
                  boxShadow: '0 0 14px rgba(139,92,246,0.2)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'var(--text-muted)',
                }}
                aria-pressed={isOn}
              >
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}&backgroundColor=1e1e38`}
                  className="w-5 h-5 rounded-full"
                  alt=""
                />
                {emp.name}
                {sessionCounts[emp.id] ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-full ml-0.5"
                    style={{ background: 'rgba(139,92,246,0.25)', color: '#c4b5fd' }}>
                    {sessionCounts[emp.id]}節
                  </span>
                ) : null}
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* 計時中 */}
      <section>
        <SectionTitle>計時中</SectionTitle>
        {activeEmployees.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>請從上方選擇今日出勤員工</p>
        ) : (
          <motion.div layout className="flex flex-wrap gap-4">
            <AnimatePresence>
              {activeEmployees.map(emp => (
                <TimerCard key={emp.id} employee={emp} onSessionComplete={handleSessionComplete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}

