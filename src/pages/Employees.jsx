import { useState } from 'react'

const INITIAL = [
  { id: '1', name: '小花', avatarUrl: '', active: true },
  { id: '2', name: '小玉', avatarUrl: '', active: true },
]

export default function Employees() {
  const [employees, setEmployees] = useState(INITIAL)
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
    setForm({ name: emp.name, avatarUrl: emp.avatarUrl })
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold">員工管理</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-400">{editId ? '編輯員工' : '新增員工'}</h2>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="名字"
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
          placeholder="大頭貼網址（選填）"
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="flex gap-2">
          <button type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm transition-colors">
            {editId ? '儲存' : '新增'}
          </button>
          {editId && (
            <button type="button"
              onClick={() => { setEditId(null); setForm({ name: '', avatarUrl: '' }) }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors">
              取消
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {employees.map(emp => (
          <li key={emp.id} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
            <img
              src={emp.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}&backgroundColor=374151`}
              alt={emp.name} className="w-10 h-10 rounded-full object-cover bg-gray-700" />
            <span className={`flex-1 text-sm ${emp.active ? 'text-white' : 'text-gray-500 line-through'}`}>
              {emp.name}
            </span>
            <button onClick={() => setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, active: !e.active } : e))}
              className="text-xs text-gray-400 hover:text-yellow-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
              {emp.active ? '停用' : '啟用'}
            </button>
            <button onClick={() => startEdit(emp)}
              className="text-xs text-gray-400 hover:text-blue-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
              編輯
            </button>
            <button onClick={() => setEmployees(prev => prev.filter(e => e.id !== emp.id))}
              className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
