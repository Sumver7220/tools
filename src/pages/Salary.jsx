import { useState } from 'react'
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
// Simulated data that will come from Firestore in Task 14
const MOCK_SESSIONS = { '1': 5, '2': 3 }
const MOCK_CHAMPAGNE = { '1': { bottles: 3, towers: 1 }, '2': { bottles: 2, towers: 0 } }

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
    const basePay = calcBasePay(h)
    const champagnePay = calcChampagnePay(bottles, towers)
    const sessionPay = calcSessionPay(s)
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
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold">薪資計算</h1>

      <div className="bg-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex gap-3">
          <select value={empId} onChange={e => { setEmpId(e.target.value); setResult(null); setSessionOverride('') }}
            className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input type="date" defaultValue={new Date().toISOString().split('T')[0]}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <p className="text-xs text-gray-500">自動帶入：{bottles}支 / {towers}塔 / {autoSessions}節</p>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-gray-400">上班時數</span>
            <input type="number" min="0" step="0.5" value={hours}
              onChange={e => setHours(e.target.value)} placeholder="0"
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-400">節數（自動：{autoSessions}）</span>
            <input type="number" min="0" value={sessionOverride}
              onChange={e => setSessionOverride(e.target.value)} placeholder={String(autoSessions)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
        </div>

        <button onClick={calculate}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm transition-colors">
          計算
        </button>
      </div>

      {result && (
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400">薪資明細 — {emp.name}</h2>
          <div className="space-y-2 font-mono">
            <Row label="保底" formula={`${result.h}時 × ${HOURLY_RATE.toLocaleString()}`} amount={result.basePay} />
            <Row label="香檳抽成"
              formula={`(${result.bottles}支×${CHAMPAGNE_BOTTLE_PRICE.toLocaleString()}+${result.towers}塔×${CHAMPAGNE_TOWER_PRICE.toLocaleString()})×${CHAMPAGNE_COMMISSION_RATE * 100}%`}
              amount={result.champagnePay} />
            <Row label="點台抽成"
              formula={`${result.s}節×${SESSION_RATE.toLocaleString()}×${SESSION_COMMISSION_RATE * 100}%`}
              amount={result.sessionPay} />
            <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-sm">
              <span>當日薪資</span>
              <span className="text-indigo-400">{result.total.toLocaleString()} Gil</span>
            </div>
          </div>
          <button onClick={save}
            className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded text-sm transition-colors">
            存檔
          </button>
        </div>
      )}

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">歷史記錄</h2>
          {history.map((rec, i) => (
            <div key={i} className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between text-sm">
              <span className="text-gray-400">{rec.date} · {rec.empName}</span>
              <span className="text-indigo-400 font-mono">{rec.total.toLocaleString()} Gil</span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

function Row({ label, formula, amount }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-gray-400 w-16 shrink-0">{label}</span>
      <span className="text-gray-500 flex-1 truncate">{formula}</span>
      <span className="text-white shrink-0">{amount.toLocaleString()} Gil</span>
    </div>
  )
}
