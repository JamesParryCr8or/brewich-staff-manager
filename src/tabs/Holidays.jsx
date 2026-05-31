import { useState } from 'react'
import { STAFF_META, TOTAL_HOLIDAY_HOURS } from '../data/constants'

function calcHours(from, to) {
  const days = Math.round((new Date(to) - new Date(from)) / 86_400_000) + 1
  if (days <= 0) return 0
  return days <= 2 ? 6 : Math.ceil(days / 5) * 25
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function Holidays({ holidays, setHolidays, staffConfig }) {
  const staff = STAFF_META.map(s => ({ ...s, ...staffConfig[s.id] }))
  const [form, setForm] = useState({ employee: 'A', from: '', to: '' })
  const [error, setError] = useState('')

  function holidayUsed(empId) {
    return holidays
      .filter(h => h.employee === empId && h.status === 'approved')
      .reduce((sum, h) => sum + h.hours, 0)
  }

  function handleSubmit() {
    if (!form.from || !form.to)   { setError('Please select both dates.'); return }
    if (form.to < form.from)      { setError('End date must be on or after start date.'); return }

    const hours = calcHours(form.from, form.to)
    if (hours <= 0) { setError('Invalid date range.'); return }

    const used = holidayUsed(form.employee)
    if (used + hours > TOTAL_HOLIDAY_HOURS) {
      setError(`Not enough hours — ${TOTAL_HOLIDAY_HOURS - used}h remaining for this employee.`)
      return
    }

    setError('')
    setHolidays(prev => [
      ...prev,
      { id: Date.now().toString(), employee: form.employee, from: form.from, to: form.to, hours, status: 'pending' },
    ])
    setForm(f => ({ ...f, from: '', to: '' }))
  }

  function approve(id) {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, status: 'approved' } : h))
  }

  function reject(id) {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, status: 'rejected' } : h))
  }

  function remove(id) {
    setHolidays(prev => prev.filter(h => h.id !== id))
  }

  const sorted = [...holidays].sort((a, b) => b.from.localeCompare(a.from))

  return (
    <div>
      <p className="section-title">Request holiday</p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Employee</label>
          <select
            value={form.employee}
            onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}
          >
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">From</label>
          <input
            type="date"
            value={form.from}
            onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">To</label>
          <input
            type="date"
            value={form.to}
            min={form.from}
            onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
          />
        </div>
        <button className="btn-add" onClick={handleSubmit}>+ Add request</button>
      </div>

      {form.from && form.to && form.to >= form.from && (
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10, marginTop: -8 }}>
          ≈ {calcHours(form.from, form.to)}h will be deducted
        </p>
      )}
      {error && <p className="error-msg">{error}</p>}

      <p className="section-title">Holiday log</p>

      {sorted.length === 0 ? (
        <div className="empty">No holiday requests yet.</div>
      ) : (
        <table className="holiday-table">
          <thead>
            <tr>
              <th></th>
              <th>Employee</th>
              <th>From</th>
              <th>To</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(h => {
              const s = staff.find(x => x.id === h.employee)
              return (
                <tr key={h.id}>
                  <td>
                    <div
                      className={`staff-avatar ${s.avatarClass}`}
                      style={{ width: 26, height: 26, fontSize: 11, marginBottom: 0 }}
                    >
                      {h.employee}
                    </div>
                  </td>
                  <td>{s.name}</td>
                  <td>{fmt(h.from)}</td>
                  <td>{fmt(h.to)}</td>
                  <td>{h.hours}h</td>
                  <td>
                    <span className={`status-pill pill-${h.status}`}>{h.status}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {h.status === 'pending' && (
                      <>
                        <button className="btn-sm approve" onClick={() => approve(h.id)}>Approve</button>
                        <button className="btn-sm reject"  onClick={() => reject(h.id)}>Reject</button>
                      </>
                    )}
                    <button className="btn-sm danger" onClick={() => remove(h.id)}>Remove</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {staff.map(s => {
          const used = holidayUsed(s.id)
          return (
            <div key={s.id} className="stat">
              <div className="stat-label">{s.name}</div>
              <div className="stat-val">{TOTAL_HOLIDAY_HOURS - used}h left</div>
              <div className="stat-sub">{used}h used of {TOTAL_HOLIDAY_HOURS}h</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
