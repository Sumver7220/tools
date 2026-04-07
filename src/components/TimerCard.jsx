import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function pad(n) { return String(n).padStart(2, '0') }
function fmt(sec) { return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}` }

// 顏色系統
function phaseColor(remaining) {
  if (remaining <= 0)  return { stroke: '#ef4444', text: '#f87171', shadow: 'rgba(239,68,68,0.4)' }
  if (remaining <= 60) return { stroke: '#f59e0b', text: '#fbbf24', shadow: 'rgba(245,158,11,0.4)' }
  return                       { stroke: '#22c55e', text: '#4ade80', shadow: 'rgba(34,197,94,0.35)' }
}

const RING_R = 44
const RING_CIRC = 2 * Math.PI * RING_R  // ≈ 276.46

export default function TimerCard({ employee, onSessionComplete }) {
  const [total, setTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)

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
    setTotal(secs)
    setRemaining(secs)
    setRunning(true)
  }

  const progress = total > 0 ? (total - remaining) / total : 0
  const dashOffset = RING_CIRC * (1 - (1 - progress))  // amount consumed
  const color = phaseColor(remaining)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="glass noise-overlay flex flex-col items-center gap-4 p-5 w-44"
    >
      {/* 頭像 */}
      <img
        src={employee.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}&backgroundColor=1e1e38`}
        alt={employee.name}
        className="w-12 h-12 rounded-full object-cover"
        style={{ border: '2px solid rgba(139,92,246,0.3)' }}
      />
      <span className="text-sm font-semibold text-slate-200">{employee.name}</span>

      <AnimatePresence mode="wait">
        {running ? (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-2 w-full"
          >
            {/* SVG 圓環 */}
            <div className="relative flex items-center justify-center">
              <svg width="100" height="100" className="-rotate-90">
                {/* 軌道 */}
                <circle
                  cx="50" cy="50" r={RING_R}
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="6"
                />
                {/* 進度環 */}
                <circle
                  cx="50" cy="50" r={RING_R}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={RING_CIRC * progress}
                  style={{
                    transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
                    filter: `drop-shadow(0 0 6px ${color.shadow})`,
                  }}
                />
              </svg>
              {/* 時間 */}
              <span
                className="absolute font-mono font-bold text-lg tabular-nums"
                style={{ color: color.text }}
              >
                {fmt(remaining)}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex gap-1.5 flex-wrap justify-center"
          >
            {[10, 20, 30].map(min => (
              <motion.button
                key={min}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => start(min)}
                className="btn-violet px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                aria-label={`開始 ${min} 分鐘計時`}
              >
                {min}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

