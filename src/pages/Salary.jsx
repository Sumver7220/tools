import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  calcBasePay, calcChampagnePay, calcSessionPay,
  HOURLY_RATE, CHAMPAGNE_BOTTLE_PRICE, CHAMPAGNE_TOWER_PRICE,
  SESSION_RATE, CHAMPAGNE_COMMISSION_RATE, SESSION_COMMISSION_RATE,
} from '../utils/salary'

const MOCK_EMPLOYEES = [
  { id: '1', name: '小花' },
  { id: '2', name: '小玉' },
  { id: '3', name: '小月' },
  { id: '4', name: '小星' },
]
const MOCK_SESSIONS   = { '1': 5, '2': 3 }
const MOCK_CHAMPAGNE  = { '1': { bottles: 3, towers: 1 }, '2': { bottles: 2, towers: 0 } }

export default function Salary() {
  const [empId, setEmpId] = useState(MOCK_EMPLOYEES[0].id)
  const [hours, setHours] = useState('')
  const [sessionOverride, setSessionOverride] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const emp = MOCK_EMPLOYEES.find(e => e.id === empId)
  const autoSessions = MOCK_SESSIONS[empId] || 0
  const { bottles = 0, towers = 0 } = MOCK_CHAMPAGNE[empId] || {}

  function calculate() {
    const h = parseFloat(hours) || 0
    const s = sessionOverride !== '' ? parseInt(sessionOverride) : autoSessions
    const basePay      = calcBasePay(h)
    const champagnePay = calcChampagnePay(bottles, towers)
    const sessionPay   = calcSessionPay(s)
    setResult({ h, s, bottles, towers, basePay, champagnePay, sessionPay, total: basePay + champagnePay + sessionPay })
  }

  function save() {
    if (!result) return
    setHistory(prev => [{ date: new Date().toLocaleDateString('zh-TW'), empName: emp.name, ...result }, ...prev])
    setResult(null)
    setHours('')
    setSessionOverride('')
  }

  return (
    <div className="space-y-8 max-w-lg animate-fade-up">
      {/* 頁首 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Syne, Inter, sans-serif' }}>薪資計算</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>輸入工時，自動計算當日總薪資與明細。</p>
      </div>

      {/* 輸入區 */}
      <div className="glass noise-overlay p-5 space-y-5">
        <div className="flex gap-3 items-stretch">
          <select
            value={empId}
            onChange={e => { setEmpId(e.target.value); setResult(null); setSessionOverride('') }}
            className="lounge-input flex-1 min-w-0"
            aria-label="選擇員工"
          >
            {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="lounge-input w-auto"
            style={{ minWidth: '9rem', flexShrink: 0 }}
            aria-label="日期"
          />
        </div>

        {/* 自動帶入提示 */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          自動帶入：{bottles}支 / {towers}塔 / {autoSessions}節
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>上班時數</span>
            <input
              type="number" min="0" step="0.5" value={hours}
              onChange={e => setHours(e.target.value)} placeholder="0"
              className="lounge-input"
              aria-label="上班時數"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>節數（自動：{autoSessions}）</span>
            <input
              type="number" min="0" value={sessionOverride}
              onChange={e => setSessionOverride(e.target.value)} placeholder={String(autoSessions)}
              className="lounge-input"
              aria-label="節數覆寫"
            />
          </label>
        </div>

        <motion.button
          onClick={calculate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-violet w-full py-2.5 rounded-lg text-sm font-semibold text-white"
          aria-label="計算薪資"
        >
          計算薪資
        </motion.button>
      </div>

      {/* 薪資結果 */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="glass noise-overlay p-5 space-y-4"
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              薪資明細 — {emp.name}
            </h2>
            <div className="space-y-3">
              <SalaryRow
                label="保底"
                formula={`${result.h}時 × ${HOURLY_RATE.toLocaleString()}`}
                amount={result.basePay}
              />
              <SalaryRow
                label="香檳抽成"
                formula={`(${result.bottles}支×${CHAMPAGNE_BOTTLE_PRICE.toLocaleString()}+${result.towers}塔×${CHAMPAGNE_TOWER_PRICE.toLocaleString()})×${CHAMPAGNE_COMMISSION_RATE*100}%`}
                amount={result.champagnePay}
              />
              <SalaryRow
                label="點台抽成"
                formula={`${result.s}節×${SESSION_RATE.toLocaleString()}×${SESSION_COMMISSION_RATE*100}%`}
                amount={result.sessionPay}
              />
              {/* 合計 */}
              <div className="pt-3 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-sm font-bold text-slate-100">當日薪資</span>
                <span className="font-mono font-bold text-lg" style={{ color: '#fbbf24' }}>
                  {result.total.toLocaleString()} <span className="text-xs opacity-70">Gil</span>
                </span>
              </div>
            </div>
            <motion.button
              onClick={save}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', boxShadow: '0 0 12px rgba(34,197,94,0.25)' }}
              aria-label="存檔"
            >
              存檔記錄
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 歷史記錄 */}
      {history.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>歷史記錄</h2>
          {history.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {rec.date} <span className="mx-1 opacity-40">·</span>
                <span className="text-slate-300">{rec.empName}</span>
              </span>
              <span className="font-mono font-semibold text-sm" style={{ color: '#fbbf24' }}>
                {rec.total.toLocaleString()} <span className="text-xs opacity-60">Gil</span>
              </span>
            </motion.div>
          ))}
        </section>
      )}
    </div>
  )
}

function SalaryRow({ label, formula, amount }) {
  return (
    <div className="flex justify-between items-baseline gap-2 text-xs">
      <span className="font-medium shrink-0 w-[4.5rem]" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="flex-1 font-mono text-right" style={{ color: 'rgba(148,163,184,0.5)', wordBreak: 'break-all', lineHeight: 1.6 }}>{formula}</span>
      <span className="font-mono font-semibold shrink-0 ml-2 text-slate-200">{amount.toLocaleString()} Gil</span>
    </div>
  )
}
