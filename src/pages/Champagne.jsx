import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MOCK_EMPLOYEES = [
  { id: '1', name: '小花' },
  { id: '2', name: '小玉' },
  { id: '3', name: '小月' },
  { id: '4', name: '小星' },
]
const BOTTLE_PRICE = 30000
const TOWER_PRICE = 200000

function calcAmount(b, t) { return b * BOTTLE_PRICE + t * TOWER_PRICE }

const rankColors = [
  { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', text: '#fbbf24', label: '🥇' },
  { border: 'rgba(148,163,184,0.4)', bg: 'rgba(148,163,184,0.05)', text: '#94a3b8', label: '🥈' },
  { border: 'rgba(180,120,60,0.4)',  bg: 'rgba(180,120,60,0.05)',  text: '#cd7f32', label: '🥉' },
]

export default function Champagne() {
  const [records, setRecords] = useState({})
  const [guest, setGuest] = useState('')
  const [empId, setEmpId] = useState(MOCK_EMPLOYEES[0].id)
  const [bottles, setBottles] = useState(0)
  const [towers, setTowers] = useState(0)
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0])

  function handleAdd(e) {
    e.preventDefault()
    if (!guest.trim() || (bottles === 0 && towers === 0)) return
    const key = `${empId}__${guest.trim()}`
    setRecords(prev => ({
      ...prev,
      [key]: {
        guestName: guest.trim(),
        employeeId: empId,
        bottles: (prev[key]?.bottles || 0) + bottles,
        towers:  (prev[key]?.towers  || 0) + towers,
      },
    }))
    setGuest('')
    setBottles(0)
    setTowers(0)
  }

  const byGuest = Object.values(records).reduce((acc, rec) => {
    if (!acc[rec.guestName]) acc[rec.guestName] = { guestName: rec.guestName, total: 0, items: [] }
    acc[rec.guestName].total += calcAmount(rec.bottles, rec.towers)
    const empName = MOCK_EMPLOYEES.find(e => e.id === rec.employeeId)?.name || rec.employeeId
    acc[rec.guestName].items.push({ empName, bottles: rec.bottles, towers: rec.towers })
    return acc
  }, {})

  const ranking = Object.values(byGuest).sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-8 max-w-2xl animate-fade-up">
      {/* 頁首 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Syne, Inter, sans-serif' }}>香檳記錄</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>追蹤每日香檳銷售與客人貢獻排行。</p>
      </div>

      {/* 新增記錄表單 */}
      <form onSubmit={handleAdd} className="glass noise-overlay p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>新增記錄</h2>
        <div className="flex gap-3 flex-wrap">
          <input
            value={guest}
            onChange={e => setGuest(e.target.value)}
            placeholder="客人名稱"
            className="lounge-input flex-1 min-w-32"
            aria-label="客人名稱"
          />
          <select
            value={empId}
            onChange={e => setEmpId(e.target.value)}
            className="lounge-input w-auto"
            aria-label="選擇員工"
          >
            {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="flex gap-5 items-center flex-wrap">
          <Counter label="單支" value={bottles} onChange={setBottles} />
          <Counter label="香檳塔" value={towers} onChange={setTowers} />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn-violet ml-auto px-5 py-2 rounded-lg text-sm font-semibold text-white"
          >
            新增
          </motion.button>
        </div>
      </form>

      {/* 當日排行 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>當日排行</h2>
          <input
            type="date"
            value={viewDate}
            onChange={e => setViewDate(e.target.value)}
            className="lounge-input w-auto"
            style={{ minWidth: '9rem', flexShrink: 0 }}
            aria-label="日期篩選"
          />
        </div>

        {ranking.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>尚無記錄</p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {ranking.map((row, i) => {
                const rc = rankColors[i] ?? { border: 'rgba(255,255,255,0.07)', bg: 'rgba(255,255,255,0.02)', text: 'var(--text-muted)', label: `#${i+1}` }
                return (
                  <motion.div
                    key={row.guestName}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                    style={{ background: rc.bg, border: `1px solid ${rc.border}` }}
                  >
                    <span className="text-lg w-7 text-center shrink-0">{rc.label}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-100 truncate">{row.guestName}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {row.items.map(it => {
                          const parts = []
                          if (it.bottles) parts.push(`${it.empName} ×${it.bottles}支`)
                          if (it.towers)  parts.push(`${it.empName} ×${it.towers}塔`)
                          return parts.join(' ')
                        }).filter(Boolean).join(' / ')}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm shrink-0 ml-2" style={{ color: rc.text }}>
                      {row.total.toLocaleString()} <span className="text-xs opacity-70">Gil</span>
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  )
}

function Counter({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(v => Math.max(0, v - 1))}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-white text-base transition-colors"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        aria-label={`減少${label}`}
      >
        −
      </button>
      <span className="w-7 text-center text-sm font-mono tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(v => v + 1)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-white text-base transition-colors"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        aria-label={`增加${label}`}
      >
        +
      </button>
    </div>
  )
}
