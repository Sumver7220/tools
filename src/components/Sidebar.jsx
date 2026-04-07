import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/timer', label: '點台計時' },
  { to: '/champagne', label: '香檳記錄' },
  { to: '/salary', label: '薪資計算' },
  { to: '/employees', label: '員工管理' },
]

export default function Sidebar({ onSignOut }) {
  const [open, setOpen] = useState(true)

  return (
    <aside className={`${open ? 'w-44' : 'w-12'} bg-gray-800 flex flex-col shrink-0 transition-all duration-200`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        {open && <span className="text-white text-sm font-bold truncate">RP Lounge</span>}
        <button onClick={() => setOpen(v => !v)}
          className="text-gray-400 hover:text-white ml-auto" aria-label="toggle sidebar">
          ☰
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center px-2 py-2 rounded text-sm transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`
            }>
            {open ? label : label[0]}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-700">
        <button onClick={onSignOut}
          className="text-gray-500 hover:text-white text-xs w-full text-left transition-colors">
          {open ? '登出' : '↩'}
        </button>
      </div>
    </aside>
  )
}
