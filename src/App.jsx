import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { INITIAL_ROTA, INITIAL_HOLIDAYS, INITIAL_STAFF_CONFIG } from './data/constants'
import { getIsAdmin, setAdmin } from './auth'
import LoginModal from './components/LoginModal'
import Rota from './tabs/Rota'
import Staff from './tabs/Staff'
import Holidays from './tabs/Holidays'
import Policy from './tabs/Policy'
import Admin from './tabs/Admin'

const ALL_TABS    = ['Rota', 'Staff', 'Holidays', 'Policy', 'Admin']
const PUBLIC_TABS = ['Rota', 'Staff', 'Holidays', 'Policy']

const today = new Date().toLocaleDateString('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
})

export default function App() {
  const [isAdmin, setIsAdmin]         = useState(getIsAdmin)
  const [showLogin, setShowLogin]     = useState(false)
  const [activeTab, setActiveTab]     = useState('Rota')

  const [rota, setRota]               = useLocalStorage('brewch_rota', INITIAL_ROTA)
  const [holidays, setHolidays]       = useLocalStorage('brewch_holidays', INITIAL_HOLIDAYS)
  const [staffConfig, setStaffConfig] = useLocalStorage('brewch_staff', INITIAL_STAFF_CONFIG)
  const [payRuns, setPayRuns]         = useLocalStorage('brewch_payruns', [])

  const tabs = isAdmin ? ALL_TABS : PUBLIC_TABS

  function handleLogin() {
    setAdmin(true)
    setIsAdmin(true)
    setShowLogin(false)
  }

  function handleLogout() {
    setAdmin(false)
    setIsAdmin(false)
    if (activeTab === 'Admin') setActiveTab('Rota')
  }

  return (
    <div className="app">
      <header className="topbar">
        <img src="/Logo.svg" alt="Brewch" className="topbar-logo" />
        <span className="topbar-divider" />
        <span className="topbar-title">Staff Manager</span>
        <span className="topbar-sub">{today}</span>

        {isAdmin ? (
          <div className="auth-chip auth-chip-admin">
            <span>🔓</span>
            <span>Admin</span>
            <button className="auth-signout" onClick={handleLogout}>Sign out</button>
          </div>
        ) : (
          <button className="auth-chip auth-chip-view" onClick={() => setShowLogin(true)}>
            🔒 Admin login
          </button>
        )}
      </header>

      <nav className="nav">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`nav-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        {!isAdmin && (
          <span className="view-only-badge">View only</span>
        )}
      </nav>

      <main className="content">
        {activeTab === 'Rota'     && (
          <Rota rota={rota} setRota={setRota} staffConfig={staffConfig} holidays={holidays} isAdmin={isAdmin} />
        )}
        {activeTab === 'Staff'    && <Staff holidays={holidays} staffConfig={staffConfig} />}
        {activeTab === 'Holidays' && (
          <Holidays holidays={holidays} setHolidays={setHolidays} staffConfig={staffConfig} isAdmin={isAdmin} />
        )}
        {activeTab === 'Policy'   && <Policy />}
        {activeTab === 'Admin'    && isAdmin && (
          <Admin
            staffConfig={staffConfig}
            setStaffConfig={setStaffConfig}
            payRuns={payRuns}
            setPayRuns={setPayRuns}
            rota={rota}
          />
        )}
      </main>

      {showLogin && (
        <LoginModal
          onSuccess={handleLogin}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  )
}
