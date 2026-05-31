import { useState } from 'react'
import { STAFF, DAYS_SHORT, CELL_CYCLE, CELL_CONFIG, SHIFT_HOURS } from '../data/constants'

const LEGEND = [
  { color: '#5DCAA5', label: 'Weekday shift' },
  { color: '#97C459', label: 'Weekend shift' },
  { color: '#EF9F27', label: 'Holiday' },
  { color: '#D0D0D0', label: 'Day off' },
]

export default function Rota({ rota, setRota }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekIdx = ((weekOffset % 4) + 4) % 4
  const week = rota[weekIdx]

  function toggleCell(empId, dayIdx) {
    const cur = week[dayIdx][empId]
    if (cur === 'holiday') return
    const next = CELL_CYCLE[(CELL_CYCLE.indexOf(cur) + 1) % CELL_CYCLE.length]
    setRota(prev =>
      prev.map((w, wi) =>
        wi !== weekIdx
          ? w
          : w.map((day, di) =>
              di !== dayIdx ? day : { ...day, [empId]: next }
            )
      )
    )
  }

  function hoursFor(empId) {
    return week.filter(d => d[empId] !== 'off').length * SHIFT_HOURS
  }

  const totalShifts = week.reduce(
    (sum, day) => sum + STAFF.filter(s => day[s.id] !== 'off').length,
    0
  )
  const teamHours = STAFF.reduce((sum, s) => sum + hoursFor(s.id), 0)

  return (
    <div>
      <div className="week-nav">
        <button className="btn-add" onClick={() => setWeekOffset(o => o - 1)}>‹</button>
        <span>Week {weekIdx + 1} of 4</span>
        <button className="btn-add" onClick={() => setWeekOffset(o => o + 1)}>›</button>
      </div>

      <div className="legend">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="legend-item">
            <div className="legend-dot" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      <div className="rota-grid">
        <div className="rota-header" />
        {DAYS_SHORT.map(d => (
          <div key={d} className="rota-header">{d}</div>
        ))}

        {STAFF.map(s => (
          <RotaRow
            key={s.id}
            staff={s}
            week={week}
            onToggle={(dayIdx) => toggleCell(s.id, dayIdx)}
          />
        ))}
      </div>

      <div className="stat-row" style={{ marginTop: 16 }}>
        {STAFF.map(s => {
          const h = hoursFor(s.id)
          return (
            <div key={s.id} className="stat">
              <div className="stat-label">{s.name} this week</div>
              <div className="stat-val">{h}h</div>
              <div className="stat-sub">{h / SHIFT_HOURS} shift{h / SHIFT_HOURS !== 1 ? 's' : ''}</div>
            </div>
          )
        })}
        <div className="stat">
          <div className="stat-label">Team hours</div>
          <div className="stat-val">{teamHours}h</div>
          <div className="stat-sub">{totalShifts} shifts total</div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
        Click any cell to cycle: work → weekend → off. Changes save automatically.
      </p>
    </div>
  )
}

function RotaRow({ staff, week, onToggle }) {
  return (
    <>
      <div className="rota-name">
        <div
          className={`staff-avatar ${staff.avatarClass}`}
          style={{ width: 28, height: 28, fontSize: 11, marginBottom: 0 }}
        >
          {staff.id}
        </div>
      </div>
      {week.map((day, di) => {
        const state = day[staff.id]
        const cfg = CELL_CONFIG[state] ?? CELL_CONFIG.off
        return (
          <div
            key={di}
            className="rota-cell"
            style={{ background: cfg.bg, color: cfg.color }}
            onClick={() => onToggle(di)}
            title={state === 'holiday' ? 'Holiday — edit in Holidays tab' : 'Click to cycle: work → weekend → off'}
          >
            {cfg.label}
          </div>
        )
      })}
    </>
  )
}
