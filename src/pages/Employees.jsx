import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmployees } from '../contexts/EmployeesContext'

export default function Employees() {
  const { employees, setEmployees } = useEmployees()
  const [form, setForm] = useState({ name: '', avatarUrl: '' })
  const [editId, setEditId] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editId) {
      setEmployees(prev => prev.map(emp => emp.id === editId ? { ...emp, ...form } : emp))
      setEditId(null)
    } else {
      setEmployees(prev => [...prev, { id: Date.now().toString(), ...form, active: true }])
    }
    setForm({ name: '', avatarUrl: '' })
  }

  function startEdit(emp) {
    setEditId(emp.id)
    setForm({ name: emp.name, avatarUrl: emp.avatarUrl || '' })
  }

  return (
    <div className="max-w-lg space-y-8 animate-fade-up">
      {/* 頁首 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Syne, Inter, sans-serif' }}>員工管理</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>新增或編輯出勤員工資料。</p>
      </div>

      {/* 表單 */}
      <form onSubmit={handleSubmit} className="glass noise-overlay p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {editId ? '編輯員工' : '新增員工'}
        </h2>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="名字"
          className="lounge-input"
          aria-label="員工名字"
        />
        <input
          value={form.avatarUrl}
          onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
          placeholder="大頭貼網址（選填）"
          className="lounge-input"
          aria-label="大頭貼網址"
        />
        <div className="flex gap-2 pt-1">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-violet px-5 py-2 rounded-lg text-sm font-semibold text-white"
          >
            {editId ? '儲存' : '新增'}
          </motion.button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setForm({ name: '', avatarUrl: '' }) }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              取消
            </button>
          )}
        </div>
      </form>

      {/* 員工列表 */}
      <ul className="space-y-2.5" role="list">
        <AnimatePresence>
          {employees.map((emp, i) => (
            <motion.li
              key={emp.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.96 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 240, damping: 22 }}
              className="flex items-center gap-3 p-3.5 rounded-xl group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: emp.active ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.03)',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              {/* 頭像 */}
              <div className="relative shrink-0">
                <img
                  src={emp.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}&backgroundColor=1e1e38`}
                  alt={emp.name}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: emp.active ? '2px solid rgba(139,92,246,0.35)' : '2px solid rgba(255,255,255,0.08)' }}
                />
                {/* 在線指示燈 */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                  style={{
                    background: emp.active ? '#22c55e' : 'rgba(255,255,255,0.2)',
                    border: '2px solid var(--bg-base)',
                    boxShadow: emp.active ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
                  }}
                  aria-label={emp.active ? '啟用中' : '已停用'}
                />
              </div>

              {/* 姓名 */}
              <span
                className="flex-1 text-sm font-medium"
                style={{ color: emp.active ? '#f1f5f9' : 'var(--text-muted)', textDecoration: emp.active ? 'none' : 'line-through' }}
              >
                {emp.name}
              </span>

              {/* 操作按鈕 */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <ActionBtn
                  onClick={() => setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, active: !e.active } : e))}
                  color={emp.active ? '#fbbf24' : '#4ade80'}
                  label={emp.active ? '停用' : '啟用'}
                />
                <ActionBtn
                  onClick={() => startEdit(emp)}
                  color="#60a5fa"
                  label="編輯"
                />
                <ActionBtn
                  onClick={() => setEmployees(prev => prev.filter(e => e.id !== emp.id))}
                  color="#f87171"
                  label="刪除"
                />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

function ActionBtn({ onClick, color, label }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-150"
      style={{ color: 'var(--text-muted)', background: 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}18` }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
      aria-label={label}
    >
      {label}
    </button>
  )
}

