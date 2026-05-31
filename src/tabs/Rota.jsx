import { useState } from 'react'
import { STAFF_META, CELL_CONFIG, SHIFT_HOURS } from '../data/constants'

const WEEKEND_DAYS = new Set([4, 5])
const DAY_NAMES    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LONG   = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getWeekStart(weekOffset) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Rota week runs Tue–Sun; find most recent Tuesday
  const daysSinceTue = (today.getDay() - 2 + 7) % 7
  const tue = new Date(today)
  tue.setDate(today.getDate() - daysSinceTue + weekOffset * 7)
  return tue
}

function nextState(current, dayIdx) {
  if (current === 'holiday') return 'holiday'
  return WEEKEND_DAYS.has(dayIdx)
    ? (current === 'off' ? 'weekend' : 'off')
    : (current === 'off' ? 'work'    : 'off')
}

export default function Rota({ rota, setRota, staffConfig }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekIdx  = ((weekOffset % 4) + 4) % 4
  const week     = rota[weekIdx]
  const staff    = STAFF_META.map(s => ({ ...s, ...staffConfig[s.id] }))
  const weekStart = getWeekStart(weekOffset)

  // Build 6 days (Tue–Sun) with real dates
  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const now = new Date(); now.setHours(0,0,0,0)
    return {
      date:      d,
      short:     DAY_NAMES[d.getDay()],
      dayNum:    d.getDate(),
      monthIdx:  d.getMonth(),
      year:      d.getFullYear(),
      isToday:   d.getTime() === now.getTime(),
      isWeekend: i >= 4,
    }
  })

  const startM = days[0].monthIdx
  const endM   = days[5].monthIdx
  const yr     = days[0].year
  const monthDisplay = startM === endM
    ? `${MONTH_LONG[startM]} ${yr}`
    : `${MONTH_SHORT[startM]} – ${MONTH_SHORT[endM]} ${yr}`

  function toggleCell(empId, dayIdx) {
    setRota(prev =>
      prev.map((w, wi) =>
        wi !== weekIdx ? w
          : w.map((day, di) =>
              di !== dayIdx ? day : { ...day, [empId]: nextState(day[empId], dayIdx) }
            )
      )
    )
  }

  function hoursFor(empId) {
    return week.filter(d => d[empId] !== 'off').length * SHIFT_HOURS
  }

  function exportCSV() {
    const range = `${days[0].dayNum} ${MONTH_SHORT[days[0].monthIdx]} – ${days[5].dayNum} ${MONTH_SHORT[days[5].monthIdx]} ${yr}`
    const label = s => {
      if (s === 'off')     return 'Off'
      if (s === 'holiday') return 'Holiday'
      if (s === 'weekend') return 'Weekend shift (9am–3:20pm)'
      return 'Weekday shift (9am–3:20pm)'
    }
    const headers = ['Employee', ...days.map(d => `${d.short} ${d.dayNum} ${MONTH_SHORT[d.monthIdx]}`), 'Total Hours']
    const rows = staff.map(s => [
      s.name,
      ...week.map(day => label(day[s.id])),
      hoursFor(s.id),
    ])
    const title = `Brewch Rota – ${range} (Rota week ${weekIdx + 1} of 4)`
    const csv   = [[title], headers, ...rows]
      .map(r => r.map(c => `"${c}"`).join(','))
      .join('\n')

    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `brewch-rota-wk${weekIdx + 1}-${days[0].dayNum}${MONTH_SHORT[days[0].monthIdx]}${yr}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const teamHours   = staff.reduce((s, e) => s + hoursFor(e.id), 0)
  const totalShifts = week.reduce((sum, day) => sum + STAFF_META.filter(s => day[s.id] !== 'off').length, 0)

  return (
    <div>
      {/* ── Calendar nav bar ── */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={() => setWeekOffset(o => o - 1)} aria-label="Previous week">‹</button>
        <div className="cal-nav-center">
          <span className="cal-month">{monthDisplay}</span>
          <span className="cal-week-badge">Rota week {weekIdx + 1} of 4</span>
        </div>
        <button className="cal-nav-btn" onClick={() => setWeekOffset(o => o + 1)} aria-label="Next week">›</button>
        <button className="btn-add cal-today-btn" onClick={() => setWeekOffset(0)}>Today</button>
        <button className="btn-add cal-export-btn" onClick={exportCSV}>↓ Export CSV</button>
      </div>

      {/* ── Calendar grid ── */}
      <div className="cal-grid">
        {/* Header row */}
        <div className="cal-corner" />
        {days.map((d, i) => (
          <div key={i} className={`cal-day-header${d.isToday ? ' cal-hdr-today' : ''}${d.isWeekend ? ' cal-hdr-weekend' : ''}`}>
            <span className="cal-hdr-name">{d.short}</span>
            <span className={`cal-hdr-num${d.isToday ? ' cal-hdr-num-today' : ''}`}>{d.dayNum}</span>
            {d.dayNum === 1 && <span className="cal-hdr-month">{MONTH_SHORT[d.monthIdx]}</span>}
          </div>
        ))}

        {/* Employee rows */}
        {staff.map((s, si) => {
          const isLast = si === staff.length - 1
          return (
            <RotaRow
              key={s.id}
              staff={s}
              week={week}
              days={days}
              isLast={isLast}
              onToggle={dayIdx => toggleCell(s.id, dayIdx)}
            />
          )
        })}
      </div>

      {/* ── Weekly stats ── */}
      <div className="stat-row" style={{ marginTop: 14 }}>
        {staff.map(s => {
          const h = hoursFor(s.id)
          return (
            <div key={s.id} className="stat">
              <div className="stat-label">{s.name}</div>
              <div className="stat-val">{h}h</div>
              <div className="stat-sub">{h / SHIFT_HOURS} shift{h / SHIFT_HOURS !== 1 ? 's' : ''}</div>
            </div>
          )
        })}
        <div className="stat">
          <div className="stat-label">Team total</div>
          <div className="stat-val">{teamHours}h</div>
          <div className="stat-sub">{totalShifts} shifts</div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
        Click any cell to toggle on / off. Sat &amp; Sun are automatically weekend shifts.
      </p>
    </div>
  )
}

function RotaRow({ staff, week, days, isLast, onToggle }) {
  return (
    <>
      <div className={`cal-row-label${isLast ? ' cal-row-last' : ''}`}>
        <div
          className={`staff-avatar ${staff.avatarClass}`}
          style={{ width: 28, height: 28, fontSize: 11, marginBottom: 0, flexShrink: 0 }}
        >
          {staff.id}
        </div>
        <span className="cal-name" title={staff.name}>{staff.name}</span>
      </div>

      {week.map((day, di) => {
        const state = day[staff.id]
        const cfg   = CELL_CONFIG[state] ?? CELL_CONFIG.off
        const isOff = state === 'off'
        return (
          <div
            key={di}
            className={[
              'cal-cell',
              days[di].isToday  ? 'cal-cell-today'   : '',
              days[di].isWeekend ? 'cal-cell-weekend-col' : '',
              isLast             ? 'cal-cell-last'    : '',
            ].join(' ')}
            style={!isOff ? { background: cfg.bg } : undefined}
            onClick={() => onToggle(di)}
            title={state === 'holiday' ? 'Holiday — edit in Holidays tab' : 'Click to toggle on / off'}
          >
            {!isOff && (
              <span className="cal-cell-label" style={{ color: cfg.color }}>
                {state === 'holiday' ? '🏖️ Holiday'
                  : state === 'weekend' ? '☀️ 9–3:20'
                  : '9–3:20'}
              </span>
            )}
          </div>
        )
      })}
    </>
  )
}
