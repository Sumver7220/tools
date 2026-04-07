import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// SVG 圖示定義
const icons = {
  timer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  champagne: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8M12 11v11M6.5 4.5l-.5 6.5a6 6 0 0 0 12 0l-.5-6.5z"/><path d="M6.5 4.5h11"/>
    </svg>
  ),
  salary: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  employees: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  signout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

const NAV_ITEMS = [
  { to: '/timer',     label: '點台計時', icon: 'timer' },
  { to: '/champagne', label: '香檳記錄', icon: 'champagne' },
  { to: '/salary',    label: '薪資計算', icon: 'salary' },
  { to: '/employees', label: '員工管理', icon: 'employees' },
]

export default function Sidebar({ onSignOut }) {
  const [open, setOpen] = useState(true)

  return (
    <motion.aside
      animate={{ width: open ? 200 : 64 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="relative z-10 flex flex-col shrink-0 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(20,16,40,0.95) 0%, rgba(14,12,28,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Logo 區域 — 收合時只展示漢堡鈕置中 */}
      <div
        className="flex items-center h-16 shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: open ? '0 1rem' : '0',
          justifyContent: open ? 'flex-start' : 'center',
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3 flex-1 overflow-hidden min-w-0"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 0 14px rgba(139,92,246,0.45)' }}>
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span
                className="text-sm font-bold whitespace-nowrap"
                style={{ fontFamily: 'Syne, Inter, sans-serif', color: '#f1f5f9', letterSpacing: '0.02em' }}
              >
                RP Lounge
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-md transition-colors shrink-0"
          style={{ color: 'var(--text-muted)', marginLeft: open ? '0.5rem' : '0' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          aria-label="toggle sidebar"
        >
          <span className="w-5 h-5">{icons.menu}</span>
        </button>
      </div>

      {/* 導覽列表 */}
      <nav className="flex-1 p-3 space-y-1" role="navigation">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => [
              'group flex items-center py-2.5 rounded-lg text-sm transition-all duration-200 relative overflow-hidden',
              open ? 'gap-3 px-3' : 'justify-center px-0',
              isActive
                ? 'text-white'
                : 'text-slate-400 hover:text-white',
            ].join(' ')}
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(90deg, rgba(124,58,237,0.25) 0%, rgba(168,85,247,0.1) 100%)',
              ...(open ? { borderLeft: '2px solid #8b5cf6' } : {}),
              boxShadow: 'inset 0 0 20px rgba(139,92,246,0.08)',
            } : {
              ...(open ? { borderLeft: '2px solid transparent' } : {}),
            }}
          >
            <span className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110">
              {icons[icon]}
            </span>
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap font-medium"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* 登出 */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={onSignOut}
          className={`group flex items-center w-full py-2.5 rounded-lg text-sm transition-all duration-200 ${open ? 'gap-3 px-3' : 'justify-center px-0'}`}
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <span className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110">
            {icons.signout}
          </span>
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap font-medium"
              >
                登出
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}

