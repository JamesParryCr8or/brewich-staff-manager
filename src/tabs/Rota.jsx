import { useState } from 'react'
import { STAFF_META, CELL_CONFIG, SHIFT_HOURS } from '../data/constants'

const WEEKEND_DAYS = new Set([4, 5])
const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getWeekStart(weekOffset) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
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

function effectiveState(empId, dateStr, rotaState, holidays) {
  const onHoliday = holidays.some(h =>
    h.employee === empId &&
    h.status   === 'approved' &&
    dateStr >= h.from &&
    dateStr <= h.to
  )
  return onHoliday ? 'holiday' : rotaState
}

export default function Rota({ rota, setRota, staffConfig, holidays, isAdmin }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekIdx   = ((weekOffset % 4) + 4) % 4
  const week      = rota[weekIdx]
  const staff     = STAFF_META.map(s => ({ ...s, ...staffConfig[s.id] }))
  const weekStart = getWeekStart(weekOffset)

  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const now = new Date(); now.setHours(0,0,0,0)
    return {
      date:      d,
      iso:       toISO(d),
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
    if (!isAdmin) return
    const dateStr = days[dayIdx].iso
    const cur = effectiveState(empId, dateStr, week[dayIdx][empId], holidays)
    if (cur === 'holiday') return
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
    return days.reduce((sum, d, di) => {
      const state = effectiveState(empId, d.iso, week[di][empId], holidays)
      return sum + (state !== 'off' && state !== 'holiday' ? SHIFT_HOURS : 0)
    }, 0)
  }

  function exportCSV() {
    const range = `${days[0].dayNum} ${MONTH_SHORT[days[0].monthIdx]} – ${days[5].dayNum} ${MONTH_SHORT[days[5].monthIdx]} ${yr}`
    const label = s => {
      if (s === 'off')     return 'Off'
      if (s === 'holiday') return 'Holiday'
      if (s === 'weekend') return 'Weekend shift (9am–3:20pm)'
      return 'Weekday shift (9am–3:20pm)'
    }
    const headers = ['Employee', ...days.map(d => `${d.short} ${d.dayNum} ${MONTH_SHORT[d.monthIdx]}`), 'Hours', 'Est. Pay']
    const rows = staff.map(s => {
      const h = hoursFor(s.id)
      return [
        s.name,
        ...days.map((d, di) => label(effectiveState(s.id, d.iso, week[di][s.id], holidays))),
        h,
        `£${(h * s.rate).toFixed(2)}`,
      ]
    })
    const title = `Brewch Rota – ${range} (Rota week ${weekIdx + 1} of 4)`
    const csv = [[title], headers, ...rows]
      .map(r => r.map(c => `"${c}"`).join(','))
      .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `brewch-rota-wk${weekIdx+1}-${days[0].dayNum}${MONTH_SHORT[days[0].monthIdx]}${yr}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const teamHours = staff.reduce((s, e) => s + hoursFor(e.id), 0)
  const teamPay   = staff.reduce((s, e) => s + hoursFor(e.id) * e.rate, 0)
  const totalShifts = days.reduce((sum, d, di) =>
    sum + STAFF_META.filter(s => effectiveState(s.id, d.iso, week[di][s.id], holidays) !== 'off').length, 0
  )

  return (
    <div>
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={() => setWeekOffset(o => o - 1)}>‹</button>
        <div className="cal-nav-center">
          <span className="cal-month">{monthDisplay}</span>
          <span className="cal-week-badge">Rota week {weekIdx + 1} of 4</span>
        </div>
        <button className="cal-nav-btn" onClick={() => setWeekOffset(o => o + 1)}>›</button>
        <button className="btn-add cal-today-btn" onClick={() => setWeekOffset(0)}>Today</button>
        {isAdmin && <button className="btn-add cal-export-btn" onClick={exportCSV}>↓ Export CSV</button>}
      </div>

      <div className="cal-grid">
        <div className="cal-corner" />
        {days.map((d, i) => (
          <div key={i} className={`cal-day-header${d.isToday ? ' cal-hdr-today' : ''}${d.isWeekend ? ' cal-hdr-weekend' : ''}`}>
            <span className="cal-hdr-name">{d.short}</span>
            <span className={`cal-hdr-num${d.isToday ? ' cal-hdr-num-today' : ''}`}>{d.dayNum}</span>
            {d.dayNum === 1 && <span className="cal-hdr-month">{MONTH_SHORT[d.monthIdx]}</span>}
          </div>
        ))}

        {staff.map((s, si) => (
          <RotaRow
            key={s.id}
            staff={s}
            week={week}
            days={days}
            holidays={holidays}
            isAdmin={isAdmin}
            isLast={si === staff.length - 1}
            onToggle={dayIdx => toggleCell(s.id, dayIdx)}
          />
        ))}
      </div>

      <div className="stat-row" style={{ marginTop: 14 }}>
        {staff.map(s => {
          const h   = hoursFor(s.id)
          const pay = h * s.rate
          return (
            <div key={s.id} className="stat">
              <div className="stat-label">{s.name}</div>
              <div className="stat-val">{h}h</div>
              <div className="stat-sub">{h / SHIFT_HOURS} shift{h / SHIFT_HOURS !== 1 ? 's' : ''}</div>
              <div className="stat-pay">{GBP.format(pay)} est.</div>
            </div>
          )
        })}
        <div className="stat">
          <div className="stat-label">Team total</div>
          <div className="stat-val">{teamHours}h</div>
          <div className="stat-sub">{totalShifts} shifts</div>
          <div className="stat-pay">{GBP.format(teamPay)} est.</div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
        Approved holidays overlay the rota automatically. Click any non-holiday cell to toggle on / off.
      </p>
    </div>
  )
}

function RotaRow({ staff, week, days, holidays, isAdmin, isLast, onToggle }) {
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
        const state = effectiveState(staff.id, days[di].iso, day[staff.id], holidays)
        const cfg   = CELL_CONFIG[state] ?? CELL_CONFIG.off
        const isOff = state === 'off'
        return (
          <div
            key={di}
            className={[
              'cal-cell',
              days[di].isToday    ? 'cal-cell-today'       : '',
              days[di].isWeekend  ? 'cal-cell-weekend-col' : '',
              isLast              ? 'cal-cell-last'        : '',
              state === 'holiday' ? 'cal-cell-holiday'     : '',
              !isAdmin            ? 'cal-cell-readonly'    : '',
            ].join(' ')}
            style={!isOff ? { background: cfg.bg } : undefined}
            onClick={() => onToggle(di)}
            title={
              state === 'holiday' ? 'Approved holiday'
              : isOff ? 'Day off — click to schedule'
              : 'Click to toggle off'
            }
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
