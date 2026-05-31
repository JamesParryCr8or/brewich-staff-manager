import { useState } from 'react'
import { STAFF_META, DAYS_SHORT, CELL_CONFIG, SHIFT_HOURS } from '../data/constants'

const LEGEND = [
  { color: '#5DCAA5', label: 'Weekday shift' },
  { color: '#97C459', label: 'Weekend shift' },
  { color: '#EF9F27', label: 'Holiday' },
  { color: '#D0D0D0', label: 'Day off' },
]

const WEEKEND_DAYS = new Set([4, 5]) // Sat, Sun indices

function nextState(current, dayIdx) {
  if (current === 'holiday') return 'holiday'
  if (WEEKEND_DAYS.has(dayIdx)) {
    return current === 'off' ? 'weekend' : 'off'
  }
  return current === 'off' ? 'work' : 'off'
}

export default function Rota({ rota, setRota, staffConfig }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekIdx = ((weekOffset % 4) + 4) % 4
  const week = rota[weekIdx]

  const staff = STAFF_META.map(s => ({ ...s, ...staffConfig[s.id] }))

  function toggleCell(empId, dayIdx) {
    setRota(prev =>
      prev.map((w, wi) =>
        wi !== weekIdx
          ? w
          : w.map((day, di) =>
              di !== dayIdx ? day : { ...day, [empId]: nextState(day[empId], dayIdx) }
            )
      )
    )
  }

  function hoursFor(empId) {
    return week.filter(d => d[empId] !== 'off').length * SHIFT_HOURS
  }

  const totalShifts = week.reduce(
    (sum, day) => sum + STAFF_META.filter(s => day[s.id] !== 'off').length,
    0
  )
  const teamHours = staff.reduce((sum, s) => sum + hoursFor(s.id), 0)

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
        {DAYS_SHORT.map((d, i) => (
          <div key={d} className={`rota-header${WEEKEND_DAYS.has(i) ? ' rota-header-weekend' : ''}`}>
            {d}
          </div>
        ))}

        {staff.map(s => (
          <RotaRow
            key={s.id}
            staff={s}
            week={week}
            onToggle={(dayIdx) => toggleCell(s.id, dayIdx)}
          />
        ))}
      </div>

      <div className="stat-row" style={{ marginTop: 16 }}>
        {staff.map(s => {
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
        Click any cell to toggle on / off. Sat &amp; Sun cells are automatically marked as weekend shifts.
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
          title={staff.name}
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
            title={state === 'holiday' ? 'Holiday (edit in Holidays tab)' : 'Click to toggle on / off'}
          >
            {cfg.label}
          </div>
        )
      })}
    </>
  )
}
