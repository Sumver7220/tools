import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Timer from './pages/Timer'
import Champagne from './pages/Champagne'
import Salary from './pages/Salary'
import Employees from './pages/Employees'
import { EmployeesProvider } from './contexts/EmployeesContext'

// Auth guard added in Task 10 — for now all routes are open
export default function App() {
  return (
    <EmployeesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout onSignOut={() => {}} />}>
            <Route index element={<Navigate to="/timer" replace />} />
            <Route path="timer" element={<Timer />} />
            <Route path="champagne" element={<Champagne />} />
            <Route path="salary" element={<Salary />} />
            <Route path="employees" element={<Employees />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </EmployeesProvider>
  )
}
