import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ onSignOut }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* 全域背景光暈 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
      </div>

      <Sidebar onSignOut={onSignOut} />

      <main className="relative flex-1 overflow-y-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

