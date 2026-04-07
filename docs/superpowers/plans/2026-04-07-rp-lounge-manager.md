# RP Lounge Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark-themed web management tool for an FFXIV RP lounge with employee timer grid, champagne records, and salary calculation — backed by Firebase Firestore.

**Architecture:** Mock-data-first React SPA (Phase 1: Tasks 1–9), then Firebase integration (Phase 2: Tasks 10–14), then deployment (Task 15). Side-nav dashboard layout. All Firestore data organized by date under `sessions/{YYYY-MM-DD}`.

**Tech Stack:** React 18 + Vite, Tailwind CSS v3 + @tailwindcss/forms, React Router v6, Firebase 10 (Firestore + Auth), Vitest + @testing-library/react + @testing-library/user-event, Cloudflare Pages

---

## File Map

```
tools/                                     ← project root (run all commands from here)
├── public/
├── index.html
├── vite.config.js                         ← Vitest config embedded
├── tailwind.config.js
├── .env                                   ← Firebase credentials (gitignored)
├── .env.example                           ← Template committed to git
├── .gitignore
├── package.json
└── src/
    ├── main.jsx                           ← entry point
    ├── App.jsx                            ← Router + RequireAuth guard
    ├── firebase.js                        ← Firebase init (reads env vars)
    ├── test/
    │   └── setup.js                       ← @testing-library/jest-dom import
    ├── utils/
    │   ├── salary.js                      ← pure calculation functions + constants
    │   ├── salary.test.js
    │   ├── dateKey.js                     ← date → YYYY-MM-DD string
    │   └── dateKey.test.js
    ├── hooks/
    │   ├── useAuth.js                     ← Firebase Auth state + signIn/signOut
    │   ├── useEmployees.js                ← Firestore employees CRUD + realtime
    │   ├── useTimerSessions.js            ← Firestore timer records by date
    │   ├── useChampagne.js                ← Firestore champagne records by date
    │   └── useSalary.js                   ← Firestore salary save/history
    ├── components/
    │   ├── Layout.jsx                     ← Sidebar + <Outlet /> wrapper
    │   ├── Sidebar.jsx                    ← nav links, collapse toggle, logout
    │   ├── TimerCard.jsx                  ← single employee countdown card
    │   └── TimerCard.test.jsx
    └── pages/
        ├── Login.jsx                      ← email/password login form
        ├── Timer.jsx                      ← attendance selector + timer grid
        ├── Champagne.jsx                  ← add form + guest ranking table
        ├── Salary.jsx                     ← calculate + breakdown + history
        └── Employees.jsx                  ← CRUD list with avatar + active toggle
```

---

### Task 1: Project Setup

**Files:**
- Create: `tools/` (scaffold via Vite)
- Create: `tools/vite.config.js`
- Create: `tools/tailwind.config.js`
- Create: `tools/src/test/setup.js`
- Create: `tools/src/index.css`
- Create: `tools/.env.example`

- [ ] **Step 1: Scaffold Vite React project**

Run from `D:/Sumver/Desktop/白飯/`:
```bash
npm create vite@latest tools -- --template react
cd tools
npm install
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install react-router-dom firebase
npm install -D tailwindcss @tailwindcss/forms autoprefixer postcss
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

- [ ] **Step 4: Replace tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/forms')],
}
```

- [ ] **Step 5: Replace vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 6: Create src/test/setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Replace src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Create .env.example**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

- [ ] **Step 9: Update .gitignore**

Add these lines if not present:
```
.env
.env.local
dist/
```

- [ ] **Step 10: Verify dev server**

```bash
npm run dev
```
Expected: Vite server at `http://localhost:5173` with default React page.

- [ ] **Step 11: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Vite React project with Tailwind and Vitest"
```

---

### Task 2: Salary Utilities (TDD)

**Files:**
- Create: `src/utils/salary.js`
- Create: `src/utils/salary.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/utils/salary.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { calcBasePay, calcChampagnePay, calcSessionPay, calcTotalPay } from './salary'

describe('calcBasePay', () => {
  it('returns hours × 50000', () => {
    expect(calcBasePay(4)).toBe(200000)
  })
  it('returns 0 for 0 hours', () => {
    expect(calcBasePay(0)).toBe(0)
  })
})

describe('calcChampagnePay', () => {
  it('applies 50% commission to bottles + towers', () => {
    // (3 × 30000 + 1 × 200000) × 0.5 = 145000
    expect(calcChampagnePay(3, 1)).toBe(145000)
  })
  it('handles bottles only', () => {
    // 5 × 30000 × 0.5 = 75000
    expect(calcChampagnePay(5, 0)).toBe(75000)
  })
  it('handles towers only', () => {
    // 2 × 200000 × 0.5 = 200000
    expect(calcChampagnePay(0, 2)).toBe(200000)
  })
  it('returns 0 when both zero', () => {
    expect(calcChampagnePay(0, 0)).toBe(0)
  })
})

describe('calcSessionPay', () => {
  it('returns sessions × 40000 × 40%', () => {
    // 8 × 40000 × 0.4 = 128000
    expect(calcSessionPay(8)).toBe(128000)
  })
  it('returns 0 for 0 sessions', () => {
    expect(calcSessionPay(0)).toBe(0)
  })
})

describe('calcTotalPay', () => {
  it('sums base + champagne + session pay', () => {
    // 200000 + 145000 + 128000 = 473000
    expect(calcTotalPay(4, 3, 1, 8)).toBe(473000)
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test src/utils/salary.test.js
```
Expected: FAIL — `Cannot find module './salary'`

- [ ] **Step 3: Implement salary.js**

Create `src/utils/salary.js`:
```js
export const HOURLY_RATE = 50000
export const CHAMPAGNE_BOTTLE_PRICE = 30000
export const CHAMPAGNE_TOWER_PRICE = 200000
export const SESSION_RATE = 40000
export const CHAMPAGNE_COMMISSION_RATE = 0.5
export const SESSION_COMMISSION_RATE = 0.4

export function calcBasePay(hours) {
  return hours * HOURLY_RATE
}

export function calcChampagnePay(bottles, towers) {
  return (bottles * CHAMPAGNE_BOTTLE_PRICE + towers * CHAMPAGNE_TOWER_PRICE) * CHAMPAGNE_COMMISSION_RATE
}

export function calcSessionPay(sessions) {
  return sessions * SESSION_RATE * SESSION_COMMISSION_RATE
}

export function calcTotalPay(hours, bottles, towers, sessions) {
  return calcBasePay(hours) + calcChampagnePay(bottles, towers) + calcSessionPay(sessions)
}
```

- [ ] **Step 4: Run — confirm pass**

```bash
npm test src/utils/salary.test.js
```
Expected: PASS — 8 tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/salary.js src/utils/salary.test.js
git commit -m "feat: salary calculation utilities with tests"
```

---

### Task 3: Date Key Utility (TDD)

**Files:**
- Create: `src/utils/dateKey.js`
- Create: `src/utils/dateKey.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/utils/dateKey.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { toDateKey, todayKey } from './dateKey'

describe('toDateKey', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 3, 7))).toBe('2026-04-07')
  })
  it('zero-pads single-digit month and day', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('todayKey', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test src/utils/dateKey.test.js
```
Expected: FAIL

- [ ] **Step 3: Implement dateKey.js**

Create `src/utils/dateKey.js`:
```js
export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return toDateKey(new Date())
}
```

- [ ] **Step 4: Run — confirm pass**

```bash
npm test src/utils/dateKey.test.js
```
Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/dateKey.js src/utils/dateKey.test.js
git commit -m "feat: date key utility with tests"
```

---

### Task 4: App Shell — Router, Layout, Sidebar

**Files:**
- Create: `src/App.jsx`
- Create: `src/components/Layout.jsx`
- Create: `src/components/Sidebar.jsx`
- Create: `src/pages/Login.jsx` (placeholder)
- Create: `src/pages/Timer.jsx` (stub)
- Create: `src/pages/Champagne.jsx` (stub)
- Create: `src/pages/Salary.jsx` (stub)
- Create: `src/pages/Employees.jsx` (stub)
- Modify: `src/main.jsx`

- [ ] **Step 1: Create page stubs**

Create `src/pages/Timer.jsx`:
```jsx
export default function Timer() {
  return <h1 className="text-xl font-bold text-white">點台計時</h1>
}
```

Create `src/pages/Champagne.jsx`:
```jsx
export default function Champagne() {
  return <h1 className="text-xl font-bold text-white">香檳記錄</h1>
}
```

Create `src/pages/Salary.jsx`:
```jsx
export default function Salary() {
  return <h1 className="text-xl font-bold text-white">薪資計算</h1>
}
```

Create `src/pages/Employees.jsx`:
```jsx
export default function Employees() {
  return <h1 className="text-xl font-bold text-white">員工管理</h1>
}
```

Create `src/pages/Login.jsx`:
```jsx
export default function Login() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-8 w-80 space-y-4">
        <h1 className="text-white text-xl font-bold text-center">RP Lounge Manager</h1>
        <input type="email" placeholder="Email"
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="password" placeholder="密碼"
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm transition-colors">
          登入
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Sidebar.jsx**

Create `src/components/Sidebar.jsx`:
```jsx
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
```

- [ ] **Step 3: Create Layout.jsx**

Create `src/components/Layout.jsx`:
```jsx
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
```

- [ ] **Step 4: Create App.jsx**

Create `src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Timer from './pages/Timer'
import Champagne from './pages/Champagne'
import Salary from './pages/Salary'
import Employees from './pages/Employees'

// Auth guard added in Task 10 — for now all routes are open
export default function App() {
  return (
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
  )
}
```

- [ ] **Step 5: Update main.jsx**

Replace `src/main.jsx`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 6: Verify in browser**

```bash
npm run dev
```
Navigate to `http://localhost:5173`. Confirm:
- Dark sidebar visible with all 4 nav items
- Clicking nav items shows stub page headings
- Sidebar collapse button works (☰)
- Active nav item shows in purple (indigo)

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: app shell with sidebar navigation and dark theme"
```

---

### Task 5: Employee Management Page (Mock Data)

**Files:**
- Modify: `src/pages/Employees.jsx`

- [ ] **Step 1: Implement Employees page with local state**

Replace `src/pages/Employees.jsx`:
```jsx
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
```

- [ ] **Step 2: Verify in browser**

Navigate to `/employees`. Confirm:
- List shows 2 pre-loaded employees with DiceBear avatars
- New employee form works and adds to list
- Edit fills form and updates on save
- Toggle strikes through name
- Delete removes from list

- [ ] **Step 3: Commit**

```bash
git add src/pages/Employees.jsx
git commit -m "feat: employee management page with mock data"
```

---

### Task 6: TimerCard Component (TDD)

**Files:**
- Create: `src/components/TimerCard.jsx`
- Create: `src/components/TimerCard.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/TimerCard.test.jsx`:
```jsx
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, afterEach } from 'vitest'
import TimerCard from './TimerCard'

const EMP = { id: '1', name: '小花', avatarUrl: '' }

afterEach(() => vi.useRealTimers())

describe('idle state', () => {
  it('renders employee name', () => {
    render(<TimerCard employee={EMP} onSessionComplete={() => {}} />)
    expect(screen.getByText('小花')).toBeInTheDocument()
  })

  it('shows 10, 20, 30 start buttons', () => {
    render(<TimerCard employee={EMP} onSessionComplete={() => {}} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })
})

describe('running state', () => {
  it('shows countdown MM:SS after clicking start', async () => {
    const user = userEvent.setup()
    render(<TimerCard employee={EMP} onSessionComplete={() => {}} />)
    await user.click(screen.getByText('10'))
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('hides start buttons while running', async () => {
    const user = userEvent.setup()
    render(<TimerCard employee={EMP} onSessionComplete={() => {}} />)
    await user.click(screen.getByText('10'))
    expect(screen.queryByText('20')).not.toBeInTheDocument()
  })
})

describe('completion', () => {
  it('calls onSessionComplete(employeeId, durationMinutes) when timer reaches zero', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TimerCard employee={EMP} onSessionComplete={onComplete} />)
    await user.click(screen.getByText('10'))
    act(() => vi.advanceTimersByTime(10 * 60 * 1000 + 500))
    expect(onComplete).toHaveBeenCalledWith('1', 10)
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test src/components/TimerCard.test.jsx
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement TimerCard.jsx**

Create `src/components/TimerCard.jsx`:
```jsx
import { useState, useEffect, useRef } from 'react'

function pad(n) { return String(n).padStart(2, '0') }
function fmt(sec) { return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}` }

function barColor(remaining) {
  if (remaining <= 0) return 'bg-red-500'
  if (remaining <= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}
function timeColor(remaining) {
  return remaining <= 60 ? 'text-yellow-400' : 'text-green-400'
}

export default function TimerCard({ employee, onSessionComplete }) {
  const [total, setTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const completeRef = useRef(onSessionComplete)
  completeRef.current = onSessionComplete

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      setRunning(false)
      setTotal(0)
      setRemaining(0)
      completeRef.current(employee.id, durationMinutes)
      return
    }
    const id = setInterval(() => setRemaining(r => r - 1), 1000)
    return () => clearInterval(id)
  }, [running, remaining, employee.id, durationMinutes])

  function start(minutes) {
    const secs = minutes * 60
    setDurationMinutes(minutes)
    setTotal(secs)
    setRemaining(secs)
    setRunning(true)
  }

  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-3 w-36">
      <img
        src={employee.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}&backgroundColor=374151`}
        alt={employee.name}
        className="w-14 h-14 rounded-full object-cover bg-gray-700"
      />
      <span className="text-sm font-medium">{employee.name}</span>

      {running ? (
        <div className="w-full space-y-1">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-1000 ${barColor(remaining)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`text-center font-mono font-bold text-base ${timeColor(remaining)}`}>
            {fmt(remaining)}
          </p>
        </div>
      ) : (
        <div className="flex gap-1.5">
          {[10, 20, 30].map(min => (
            <button key={min} onClick={() => start(min)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2 py-1 rounded transition-colors">
              {min}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run — confirm pass**

```bash
npm test src/components/TimerCard.test.jsx
```
Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/TimerCard.jsx src/components/TimerCard.test.jsx
git commit -m "feat: TimerCard component with countdown, color alerts, and session callback"
```

---

### Task 7: Timer Page (Mock Data)

**Files:**
- Modify: `src/pages/Timer.jsx`

- [ ] **Step 1: Implement Timer page**

Replace `src/pages/Timer.jsx`:
```jsx
import { useState } from 'react'
import TimerCard from '../components/TimerCard'

const MOCK_EMPLOYEES = [
  { id: '1', name: '小花', avatarUrl: '', active: true },
  { id: '2', name: '小玉', avatarUrl: '', active: true },
  { id: '3', name: '小月', avatarUrl: '', active: true },
  { id: '4', name: '小星', avatarUrl: '', active: true },
]

export default function Timer() {
  const [attending, setAttending] = useState(new Set())
  const [sessionCounts, setSessionCounts] = useState({})

  function toggleAttendance(id) {
    setAttending(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSessionComplete(employeeId, _durationMinutes) {
    setSessionCounts(prev => ({ ...prev, [employeeId]: (prev[employeeId] || 0) + 1 }))
  }

  const activeEmployees = MOCK_EMPLOYEES.filter(e => e.active && attending.has(e.id))

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">今日出勤</h2>
        <div className="flex flex-wrap gap-2">
          {MOCK_EMPLOYEES.filter(e => e.active).map(emp => {
            const isOn = attending.has(emp.id)
            return (
              <button key={emp.id} onClick={() => toggleAttendance(emp.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isOn ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}&backgroundColor=374151`}
                  className="w-5 h-5 rounded-full" alt="" />
                {emp.name}
                {sessionCounts[emp.id]
                  ? <span className="text-xs opacity-70">{sessionCounts[emp.id]}節</span>
                  : null}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">計時中</h2>
        {activeEmployees.length === 0
          ? <p className="text-gray-600 text-sm">請從上方選擇今日出勤員工</p>
          : (
            <div className="flex flex-wrap gap-4">
              {activeEmployees.map(emp => (
                <TimerCard key={emp.id} employee={emp} onSessionComplete={handleSessionComplete} />
              ))}
            </div>
          )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/timer`. Confirm:
- 4 mock employees shown in attendance strip
- Clicking toggles purple highlight
- Selected employees appear in timer grid
- Timer counts down with color changes (green → yellow at 1 min)
- When timer hits 0, session count appears in attendance button

- [ ] **Step 3: Commit**

```bash
git add src/pages/Timer.jsx
git commit -m "feat: timer page with attendance selector and session tracking"
```

---

### Task 8: Champagne Records Page (Mock Data)

**Files:**
- Modify: `src/pages/Champagne.jsx`

- [ ] **Step 1: Implement Champagne page**

Replace `src/pages/Champagne.jsx`:
```jsx
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
```

- [ ] **Step 2: Verify in browser**

Navigate to `/champagne`. Confirm:
- Same guest + same employee accumulates when added twice
- Same guest + different employee creates separate entry; ranking shows combined total
- Gil values formatted with commas

- [ ] **Step 3: Commit**

```bash
git add src/pages/Champagne.jsx
git commit -m "feat: champagne records page with accumulation and ranking"
```

---

### Task 9: Salary Calculation Page (Mock Data)

**Files:**
- Modify: `src/pages/Salary.jsx`

- [ ] **Step 1: Implement Salary page**

Replace `src/pages/Salary.jsx`:
```jsx
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
            <input type="number" min="0" step="0.5" value={hours} onChange={e => setHours(e.target.value)} placeholder="0"
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-gray-400">節數（自動：{autoSessions}）</span>
            <input type="number" min="0" value={sessionOverride} onChange={e => setSessionOverride(e.target.value)}
              placeholder={String(autoSessions)}
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
```

- [ ] **Step 2: Verify in browser**

Navigate to `/salary`. Confirm:
- Auto-populated values show in the hint text
- `calcTotalPay(4, 3, 1, 8)` = 473,000 Gil (matching Task 2 tests)
- Save appends to history list

- [ ] **Step 3: Commit**

```bash
git add src/pages/Salary.jsx
git commit -m "feat: salary calculation page with breakdown and history"
```

---

### Task 10: Firebase Setup + Auth

**Files:**
- Create: `src/firebase.js`
- Create: `src/hooks/useAuth.js`
- Modify: `src/App.jsx`
- Modify: `src/pages/Login.jsx`

Prerequisites: Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com), enable **Email/Password** auth under Authentication → Sign-in method, create a Firestore database (start in test mode), copy the config from Project Settings → Your Apps → Web App.

- [ ] **Step 1: Create .env with Firebase credentials**

Copy `.env.example` to `.env` and fill in:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

- [ ] **Step 2: Create src/firebase.js**

```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
```

- [ ] **Step 3: Create src/hooks/useAuth.js**

```js
import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = still loading

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  async function signIn(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signOut() {
    await fbSignOut(auth)
  }

  return { user, loading: user === undefined, signIn, signOut }
}
```

- [ ] **Step 4: Update src/pages/Login.jsx**

Replace with:
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await signIn(email, password)
      navigate('/')
    } catch {
      setError('帳號或密碼錯誤')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 w-80 space-y-4">
        <h1 className="text-white text-xl font-bold text-center">RP Lounge Manager</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" required
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="密碼" required
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm transition-colors">
          登入
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Update src/App.jsx with auth guard**

Replace with:
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Timer from './pages/Timer'
import Champagne from './pages/Champagne'
import Salary from './pages/Salary'
import Employees from './pages/Employees'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <span className="text-gray-400 text-sm">載入中…</span>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { signOut } = useAuth()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Layout onSignOut={signOut} /></RequireAuth>}>
          <Route index element={<Navigate to="/timer" replace />} />
          <Route path="timer" element={<Timer />} />
          <Route path="champagne" element={<Champagne />} />
          <Route path="salary" element={<Salary />} />
          <Route path="employees" element={<Employees />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

Note: `useAuth()` is called inside `App` which is outside `BrowserRouter`, so move `RequireAuth` usage into a child component if you hit a Router context error. Fix: wrap `BrowserRouter` around the entire `App` return or move `useAuth` into a separate inner component.

- [ ] **Step 6: Create first Firebase user**

Firebase Console → Authentication → Users → Add User. Enter admin email + password.

- [ ] **Step 7: Verify login**

```bash
npm run dev
```
Confirm:
- Visiting `/` redirects to `/login` when not logged in
- Login with the created credentials works and redirects to `/timer`
- Logout button in sidebar works

- [ ] **Step 8: Commit**

```bash
git add src/firebase.js src/hooks/useAuth.js src/pages/Login.jsx src/App.jsx
git commit -m "feat: Firebase Auth with email login and protected routes"
```

---

### Task 11: Firestore — Employee Management

**Files:**
- Create: `src/hooks/useEmployees.js`
- Modify: `src/pages/Employees.jsx`

- [ ] **Step 1: Create src/hooks/useEmployees.js**

```js
import { useState, useEffect } from 'react'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export function useEmployees() {
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('name'))
    return onSnapshot(q, snap => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  async function addEmployee({ name, avatarUrl }) {
    await addDoc(collection(db, 'employees'), { name, avatarUrl: avatarUrl || '', active: true })
  }

  async function updateEmployee(id, updates) {
    await updateDoc(doc(db, 'employees', id), updates)
  }

  async function deleteEmployee(id) {
    await deleteDoc(doc(db, 'employees', id))
  }

  return { employees, addEmployee, updateEmployee, deleteEmployee }
}
```

- [ ] **Step 2: Update src/pages/Employees.jsx to use Firestore**

Replace with:
```jsx
import { useState } from 'react'
import { useEmployees } from '../hooks/useEmployees'

export default function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees()
  const [form, setForm] = useState({ name: '', avatarUrl: '' })
  const [editId, setEditId] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editId) {
      await updateEmployee(editId, form)
      setEditId(null)
    } else {
      await addEmployee(form)
    }
    setForm({ name: '', avatarUrl: '' })
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
            <button type="button" onClick={() => { setEditId(null); setForm({ name: '', avatarUrl: '' }) }}
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
            <button onClick={() => updateEmployee(emp.id, { active: !emp.active })}
              className="text-xs text-gray-400 hover:text-yellow-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
              {emp.active ? '停用' : '啟用'}
            </button>
            <button onClick={() => { setEditId(emp.id); setForm({ name: emp.name, avatarUrl: emp.avatarUrl }) }}
              className="text-xs text-gray-400 hover:text-blue-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
              編輯
            </button>
            <button onClick={() => deleteEmployee(emp.id)}
              className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3: Verify Firestore sync**

Add an employee. Open Firebase Console → Firestore → `employees` collection. Confirm document appears with `name`, `avatarUrl`, `active` fields. Reload page — data persists.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useEmployees.js src/pages/Employees.jsx
git commit -m "feat: employee management connected to Firestore"
```

---

### Task 12: Firestore — Timer Page

**Files:**
- Create: `src/hooks/useTimerSessions.js`
- Modify: `src/pages/Timer.jsx`

- [ ] **Step 1: Create src/hooks/useTimerSessions.js**

```js
import { useState, useEffect } from 'react'
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { todayKey } from '../utils/dateKey'

export function useTimerSessions(dateKey) {
  const date = dateKey || todayKey()
  const [timerDocs, setTimerDocs] = useState([])

  useEffect(() => {
    const col = collection(db, 'sessions', date, 'timers')
    return onSnapshot(col, snap => {
      setTimerDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [date])

  // { [employeeId]: count }
  const sessionCounts = timerDocs.reduce((acc, t) => {
    acc[t.employeeId] = (acc[t.employeeId] || 0) + 1
    return acc
  }, {})

  async function recordSession(employeeId, durationMinutes) {
    await addDoc(collection(db, 'sessions', date, 'timers'), {
      employeeId,
      durationMinutes,
      completedAt: serverTimestamp(),
    })
  }

  return { sessionCounts, recordSession }
}
```

- [ ] **Step 2: Update src/pages/Timer.jsx to use Firestore**

Replace with:
```jsx
import { useState } from 'react'
import TimerCard from '../components/TimerCard'
import { useEmployees } from '../hooks/useEmployees'
import { useTimerSessions } from '../hooks/useTimerSessions'
import { todayKey } from '../utils/dateKey'

export default function Timer() {
  const { employees } = useEmployees()
  const { sessionCounts, recordSession } = useTimerSessions(todayKey())
  const [attending, setAttending] = useState(new Set())

  function toggleAttendance(id) {
    setAttending(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activeEmployees = employees.filter(e => e.active && attending.has(e.id))

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">今日出勤</h2>
        <div className="flex flex-wrap gap-2">
          {employees.filter(e => e.active).map(emp => {
            const isOn = attending.has(emp.id)
            return (
              <button key={emp.id} onClick={() => toggleAttendance(emp.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isOn ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}>
                <img
                  src={emp.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}&backgroundColor=374151`}
                  className="w-5 h-5 rounded-full" alt="" />
                {emp.name}
                {sessionCounts[emp.id]
                  ? <span className="text-xs opacity-70">{sessionCounts[emp.id]}節</span>
                  : null}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">計時中</h2>
        {activeEmployees.length === 0
          ? <p className="text-gray-600 text-sm">請從上方選擇今日出勤員工</p>
          : (
            <div className="flex flex-wrap gap-4">
              {activeEmployees.map(emp => (
                <TimerCard key={emp.id} employee={emp}
                  onSessionComplete={(empId, mins) => recordSession(empId, mins)} />
              ))}
            </div>
          )}
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verify timer writes to Firestore**

Select an employee, start a 10-minute timer. After it completes (or simulate quickly by temporarily changing `1000` to `100` in `setInterval` in TimerCard), check Firestore Console → sessions → {today} → timers. Confirm document with `employeeId`, `durationMinutes`, `completedAt` appears.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useTimerSessions.js src/pages/Timer.jsx
git commit -m "feat: connect timer page to Firestore session recording"
```

---

### Task 13: Firestore — Champagne Records

**Files:**
- Create: `src/hooks/useChampagne.js`
- Modify: `src/pages/Champagne.jsx`

- [ ] **Step 1: Create src/hooks/useChampagne.js**

```js
import { useState, useEffect } from 'react'
import { collection, onSnapshot, setDoc, doc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { todayKey } from '../utils/dateKey'

function docKey(employeeId, guestName) {
  // Deterministic key enables atomic increment on re-add
  return `${employeeId}_${guestName.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}`
}

export function useChampagne(dateKey) {
  const date = dateKey || todayKey()
  const [records, setRecords] = useState([])

  useEffect(() => {
    const col = collection(db, 'sessions', date, 'champagne')
    return onSnapshot(col, snap => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [date])

  async function addChampagne({ guestName, employeeId, bottles, towers }) {
    const ref = doc(db, 'sessions', date, 'champagne', docKey(employeeId, guestName))
    await setDoc(ref, {
      guestName,
      employeeId,
      bottles: increment(bottles),
      towers: increment(towers),
      createdAt: serverTimestamp(),
    }, { merge: true })
  }

  return { records, addChampagne }
}
```

- [ ] **Step 2: Update src/pages/Champagne.jsx to use Firestore**

Replace with:
```jsx
import { useState } from 'react'
import { useChampagne } from '../hooks/useChampagne'
import { useEmployees } from '../hooks/useEmployees'
import { todayKey } from '../utils/dateKey'

const BOTTLE_PRICE = 30000
const TOWER_PRICE = 200000

function calcAmount(b, t) { return b * BOTTLE_PRICE + t * TOWER_PRICE }

export default function Champagne() {
  const [viewDate, setViewDate] = useState(todayKey())
  const { records, addChampagne } = useChampagne(viewDate)
  const { employees } = useEmployees()
  const activeEmployees = employees.filter(e => e.active)

  const [guest, setGuest] = useState('')
  const [empId, setEmpId] = useState('')
  const [bottles, setBottles] = useState(0)
  const [towers, setTowers] = useState(0)

  const selectedEmpId = empId || activeEmployees[0]?.id || ''

  async function handleAdd(e) {
    e.preventDefault()
    if (!guest.trim() || (bottles === 0 && towers === 0)) return
    await addChampagne({ guestName: guest.trim(), employeeId: selectedEmpId, bottles, towers })
    setGuest('')
    setBottles(0)
    setTowers(0)
  }

  const byGuest = records.reduce((acc, rec) => {
    if (!acc[rec.guestName]) acc[rec.guestName] = { guestName: rec.guestName, total: 0, items: [] }
    acc[rec.guestName].total += calcAmount(rec.bottles || 0, rec.towers || 0)
    const empName = employees.find(e => e.id === rec.employeeId)?.name || rec.employeeId
    acc[rec.guestName].items.push({ empName, bottles: rec.bottles || 0, towers: rec.towers || 0 })
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
          <select value={selectedEmpId} onChange={e => setEmpId(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
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
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">排行榜</h2>
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
```

- [ ] **Step 3: Verify accumulation in Firestore**

Add "艾倫 / 小花 / 2支". Add again "艾倫 / 小花 / 1支". Check Firestore — single document with `bottles: 3`. Add "艾倫 / 小玉 / 1塔" — new separate document.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useChampagne.js src/pages/Champagne.jsx
git commit -m "feat: connect champagne records to Firestore with atomic accumulation"
```

---

### Task 14: Firestore — Salary Page

**Files:**
- Create: `src/hooks/useSalary.js`
- Modify: `src/pages/Salary.jsx`

- [ ] **Step 1: Create src/hooks/useSalary.js**

```js
import { useState, useEffect } from 'react'
import { collection, onSnapshot, setDoc, doc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'

export function useSalaryHistory(employeeId) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (!employeeId) return
    const q = query(
      collection(db, 'employees', employeeId, 'salary'),
      orderBy('savedAt', 'desc'),
      limit(30),
    )
    return onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [employeeId])

  async function saveSalary(employeeId, dateKey, data) {
    const ref = doc(db, 'employees', employeeId, 'salary', dateKey)
    await setDoc(ref, { ...data, savedAt: serverTimestamp() })
  }

  return { history, saveSalary }
}
```

- [ ] **Step 2: Update src/pages/Salary.jsx to use Firestore**

Replace with:
```jsx
import { useState } from 'react'
import { useEmployees } from '../hooks/useEmployees'
import { useTimerSessions } from '../hooks/useTimerSessions'
import { useChampagne } from '../hooks/useChampagne'
import { useSalaryHistory } from '../hooks/useSalary'
import { todayKey } from '../utils/dateKey'
import {
  calcBasePay, calcChampagnePay, calcSessionPay,
  HOURLY_RATE, CHAMPAGNE_BOTTLE_PRICE, CHAMPAGNE_TOWER_PRICE,
  SESSION_RATE, CHAMPAGNE_COMMISSION_RATE, SESSION_COMMISSION_RATE,
} from '../utils/salary'

export default function Salary() {
  const { employees } = useEmployees()
  const activeEmployees = employees.filter(e => e.active)
  const [empId, setEmpId] = useState('')
  const [viewDate, setViewDate] = useState(todayKey())
  const [hours, setHours] = useState('')
  const [sessionOverride, setSessionOverride] = useState('')
  const [result, setResult] = useState(null)

  const selectedEmpId = empId || activeEmployees[0]?.id || ''
  const { sessionCounts } = useTimerSessions(viewDate)
  const { records: champagneRecords } = useChampagne(viewDate)
  const { history, saveSalary } = useSalaryHistory(selectedEmpId)

  const autoSessions = sessionCounts[selectedEmpId] || 0
  const empChampagne = champagneRecords.filter(r => r.employeeId === selectedEmpId)
  const totalBottles = empChampagne.reduce((s, r) => s + (r.bottles || 0), 0)
  const totalTowers = empChampagne.reduce((s, r) => s + (r.towers || 0), 0)

  const emp = employees.find(e => e.id === selectedEmpId)

  function calculate() {
    const h = parseFloat(hours) || 0
    const s = sessionOverride !== '' ? parseInt(sessionOverride) : autoSessions
    const basePay = calcBasePay(h)
    const champagnePay = calcChampagnePay(totalBottles, totalTowers)
    const sessionPay = calcSessionPay(s)
    setResult({ h, s, bottles: totalBottles, towers: totalTowers, basePay, champagnePay, sessionPay, total: basePay + champagnePay + sessionPay })
  }

  async function save() {
    if (!result || !selectedEmpId) return
    await saveSalary(selectedEmpId, viewDate, result)
    setResult(null)
    setHours('')
    setSessionOverride('')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold">薪資計算</h1>

      <div className="bg-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex gap-3">
          <select value={selectedEmpId}
            onChange={e => { setEmpId(e.target.value); setResult(null); setSessionOverride('') }}
            className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input type="date" value={viewDate}
            onChange={e => { setViewDate(e.target.value); setResult(null) }}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <p className="text-xs text-gray-500">自動帶入：{totalBottles}支 / {totalTowers}塔 / {autoSessions}節</p>

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
          <h2 className="text-sm font-semibold text-gray-400">薪資明細 — {emp?.name}</h2>
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
          {history.map(rec => (
            <div key={rec.id} className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between text-sm">
              <span className="text-gray-400">{rec.id}</span>
              <span className="text-indigo-400 font-mono">{rec.total?.toLocaleString()} Gil</span>
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
```

- [ ] **Step 3: Verify end-to-end salary flow**

1. Add employees via `/employees`
2. Run a timer session for one employee via `/timer`
3. Add champagne record for that employee via `/champagne`
4. Go to `/salary`, select the employee + today's date
5. Confirm auto-filled session count and champagne data match
6. Enter hours, calculate, save
7. Check Firestore → employees → {id} → salary → {today} for the saved document

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSalary.js src/pages/Salary.jsx
git commit -m "feat: connect salary calculation to Firestore with history"
```

---

### Task 15: Deployment — Cloudflare Pages

**Files:**
- No new files — configured in Cloudflare dashboard

- [ ] **Step 1: Push code to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/rp-lounge-manager.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Create Cloudflare Pages project**

1. Cloudflare Dashboard → **Pages** → **Create a project** → **Connect to Git**
2. Select your GitHub repo
3. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory (important): `tools`
4. Add all 6 environment variables from your `.env`
5. Click **Save and Deploy**

- [ ] **Step 3: Add Cloudflare domain to Firebase Auth**

Firebase Console → Authentication → Settings → **Authorized domains** → Add `your-project.pages.dev`

- [ ] **Step 4: Update Firestore security rules**

Firebase Console → Firestore → **Rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Click **Publish**.

- [ ] **Step 5: Verify production**

Open the Cloudflare Pages URL. Confirm:
- Login page loads correctly
- All 4 pages work with real data
- Data persists after reload
- Works on mobile browser (responsive layout)

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: finalize deployment configuration"
git push
```
