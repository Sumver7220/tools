/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'rp_lounge_employees_v1'

const INITIAL_EMPLOYEES = [
  { id: '1', name: '小花', avatarUrl: '', active: true },
  { id: '2', name: '小玉', avatarUrl: '', active: true },
]

const EmployeesContext = createContext(null)

function readEmployees() {
  if (typeof window === 'undefined') return INITIAL_EMPLOYEES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_EMPLOYEES
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_EMPLOYEES
  } catch {
    return INITIAL_EMPLOYEES
  }
}

export function EmployeesProvider({ children }) {
  const [employees, setEmployees] = useState(readEmployees)

  function updateEmployees(updater) {
    setEmployees(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const value = useMemo(() => ({ employees, setEmployees: updateEmployees }), [employees])

  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>
}

export function useEmployees() {
  const ctx = useContext(EmployeesContext)
  if (!ctx) {
    throw new Error('useEmployees must be used within EmployeesProvider')
  }
  return ctx
}
