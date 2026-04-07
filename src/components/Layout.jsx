import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ onSignOut }) {
  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <Sidebar onSignOut={onSignOut} />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
