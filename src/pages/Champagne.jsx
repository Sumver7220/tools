import { useState } from 'react'

const MOCK_EMPLOYEES = [
  { id: '1', name: '小花' },
  { id: '2', name: '小玉' },
  { id: '3', name: '小月' },
  { id: '4', name: '小星' },
]
const BOTTLE_PRICE = 30000
const TOWER_PRICE = 200000

function calcAmount(b, t) { return b * BOTTLE_PRICE + t * TOWER_PRICE }

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
        towers: (prev[key]?.towers || 0) + towers,
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
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">香檳記錄</h1>

      <form onSubmit={handleAdd} className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-400">新增記錄</h2>
        <div className="flex gap-3 flex-wrap">
          <input value={guest} onChange={e => setGuest(e.target.value)} placeholder="客人名稱"
            className="flex-1 min-w-32 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={empId} onChange={e => setEmpId(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <Counter label="單支" value={bottles} onChange={setBottles} />
          <Counter label="香檳塔" value={towers} onChange={setTowers} />
          <button type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm transition-colors">
            新增
          </button>
        </div>
      </form>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">當日排行</h2>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)}
            className="bg-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {ranking.length === 0
          ? <p className="text-gray-600 text-sm">尚無記錄</p>
          : (
            <div className="space-y-2">
              {ranking.map((row, i) => (
                <div key={row.guestName} className="bg-gray-800 rounded-xl px-4 py-3 flex items-start gap-4">
                  <span className="text-gray-500 font-mono text-sm w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{row.guestName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {row.items.map(it => {
                        const parts = []
                        if (it.bottles) parts.push(`${it.empName}×${it.bottles}支`)
                        if (it.towers) parts.push(`${it.empName}×${it.towers}塔`)
                        return parts.join(' ')
                      }).filter(Boolean).join(' / ')}
                    </p>
                  </div>
                  <span className="text-indigo-400 font-mono text-sm whitespace-nowrap">
                    {row.total.toLocaleString()} Gil
                  </span>
                </div>
              ))}
            </div>
          )}
      </section>
    </div>
  )
}

function Counter({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">{label}</span>
      <button type="button" onClick={() => onChange(v => Math.max(0, v - 1))}
        className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors">−</button>
      <span className="w-6 text-center text-sm">{value}</span>
      <button type="button" onClick={() => onChange(v => v + 1)}
        className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors">+</button>
    </div>
  )
}
