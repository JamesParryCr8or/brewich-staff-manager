import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { INITIAL_ROTA, INITIAL_HOLIDAYS } from './data/constants'
import Rota from './tabs/Rota'
import Staff from './tabs/Staff'
import Holidays from './tabs/Holidays'
import Policy from './tabs/Policy'

const TABS = ['Rota', 'Staff', 'Holidays', 'Policy']

const today = new Date().toLocaleDateString('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
})

export default function App() {
  const [activeTab, setActiveTab] = useState('Rota')
  const [rota, setRota] = useLocalStorage('brewch_rota', INITIAL_ROTA)
  const [holidays, setHolidays] = useLocalStorage('brewch_holidays', INITIAL_HOLIDAYS)

  return (
    <div className="app">
      <header className="topbar">
        <img src="/Logo.svg" alt="Brewch" className="topbar-logo" />
        <span className="topbar-divider" />
        <span className="topbar-title">Staff Manager</span>
        <span className="topbar-sub">{today}</span>
      </header>

      <nav className="nav">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`nav-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'Rota'     && <Rota rota={rota} setRota={setRota} />}
        {activeTab === 'Staff'    && <Staff holidays={holidays} />}
        {activeTab === 'Holidays' && <Holidays holidays={holidays} setHolidays={setHolidays} />}
        {activeTab === 'Policy'   && <Policy />}
      </main>
    </div>
  )
}
