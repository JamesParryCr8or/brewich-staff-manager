import { useState } from 'react'
import { STAFF_META, SHIFT_HOURS, NLW_RATE } from '../data/constants'

const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

function weeklyHours(rota, weekIdx, empId) {
  return rota[weekIdx].filter(d => d[empId] !== 'off').length * SHIFT_HOURS
}

function expectedPay(rota, weekIdx, empId, rate) {
  return weeklyHours(rota, weekIdx, empId) * rate
}

export default function Admin({ staffConfig, setStaffConfig, payRuns, setPayRuns, rota }) {
  const staff = STAFF_META.map(s => ({ ...s, ...staffConfig[s.id] }))

  // ── Staff settings state ──
  const [editing, setEditing] = useState(null) // empId being edited
  const [draft, setDraft]     = useState({})

  function startEdit(s) {
    setEditing(s.id)
    setDraft({ name: s.name, role: s.role, rate: s.rate })
  }

  function saveEdit(id) {
    const rate = parseFloat(draft.rate)
    if (!draft.name.trim() || isNaN(rate) || rate < 0) return
    setStaffConfig(prev => ({
      ...prev,
      [id]: { name: draft.name.trim(), role: draft.role.trim(), rate },
    }))
    setEditing(null)
  }

  function resetRate(id) {
    setStaffConfig(prev => ({ ...prev, [id]: { ...prev[id], rate: NLW_RATE } }))
  }

  // ── Pay run state ──
  const [payForm, setPayForm] = useState({ weekEnding: '', rotaWeek: '0' })
  const [payError, setPayError] = useState('')

  function addPayRun() {
    if (!payForm.weekEnding) { setPayError('Please enter a week-ending date.'); return }
    setPayError('')
    const rotaWeek = parseInt(payForm.rotaWeek, 10)
    const entries = STAFF_META.map(s => ({
      empId: s.id,
      hours: weeklyHours(rota, rotaWeek, s.id),
      rate:  staffConfig[s.id].rate,
      pay:   expectedPay(rota, rotaWeek, s.id, staffConfig[s.id].rate),
    }))
    setPayRuns(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        weekEnding: payForm.weekEnding,
        rotaWeek,
        status: 'pending',
        paidOn: null,
        entries,
      },
    ])
    setPayForm({ weekEnding: '', rotaWeek: '0' })
  }

  function markPaid(id) {
    setPayRuns(prev =>
      prev.map(r => r.id === id
        ? { ...r, status: 'paid', paidOn: new Date().toISOString().slice(0, 10) }
        : r
      )
    )
  }

  function removePayRun(id) {
    setPayRuns(prev => prev.filter(r => r.id !== id))
  }

  const totalOutstanding = payRuns
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.entries.reduce((s, e) => s + e.pay, 0), 0)

  const totalPaid = payRuns
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.entries.reduce((s, e) => s + e.pay, 0), 0)

  const sorted = [...payRuns].sort((a, b) => b.weekEnding.localeCompare(a.weekEnding))

  return (
    <div>
      {/* ── Summary stats ── */}
      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Wages outstanding</div>
          <div className="stat-val" style={{ color: totalOutstanding > 0 ? '#a32d2d' : undefined }}>
            {GBP.format(totalOutstanding)}
          </div>
          <div className="stat-sub">{payRuns.filter(r => r.status === 'pending').length} pending pay run{payRuns.filter(r => r.status === 'pending').length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total paid (YTD)</div>
          <div className="stat-val">{GBP.format(totalPaid)}</div>
          <div className="stat-sub">{payRuns.filter(r => r.status === 'paid').length} completed</div>
        </div>
        <div className="stat">
          <div className="stat-label">Pay runs logged</div>
          <div className="stat-val">{payRuns.length}</div>
          <div className="stat-sub">all time</div>
        </div>
        <div className="stat">
          <div className="stat-label">NLW rate (2026)</div>
          <div className="stat-val">{GBP.format(NLW_RATE)}</div>
          <div className="stat-sub">per hour default</div>
        </div>
      </div>

      {/* ── Staff settings ── */}
      <p className="section-title">Staff settings</p>
      <div className="admin-staff-grid">
        {staff.map(s => (
          <div key={s.id} className="admin-staff-card">
            <div className="admin-staff-header">
              <div className={`staff-avatar ${s.avatarClass}`} style={{ marginBottom: 0, width: 32, height: 32, fontSize: 12 }}>
                {s.id}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {editing === s.id ? (
                  <>
                    <input
                      className="admin-input"
                      value={draft.name}
                      onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                      placeholder="Name"
                    />
                    <input
                      className="admin-input"
                      value={draft.role}
                      onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
                      placeholder="Role"
                      style={{ marginTop: 4 }}
                    />
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.role}</div>
                  </>
                )}
              </div>
            </div>

            <div className="admin-rate-row">
              <span className="form-label">Hourly rate</span>
              {editing === s.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 13 }}>£</span>
                  <input
                    className="admin-input admin-input-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.rate}
                    onChange={e => setDraft(d => ({ ...d, rate: e.target.value }))}
                  />
                </div>
              ) : (
                <span style={{ fontWeight: 500, fontSize: 14 }}>{GBP.format(s.rate)}/hr</span>
              )}
            </div>

            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
              Est. weekly pay:{' '}
              {GBP.format(
                [0, 1, 2, 3].reduce((sum, wi) => sum + expectedPay(rota, wi, s.id, s.rate), 0) / 4
              )} avg
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {editing === s.id ? (
                <>
                  <button className="btn-sm approve" onClick={() => saveEdit(s.id)}>Save</button>
                  <button className="btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn-sm" onClick={() => startEdit(s)}>Edit</button>
                  <button className="btn-sm" onClick={() => resetRate(s.id)} title="Reset to NLW default">
                    Reset rate
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Add pay run ── */}
      <p className="section-title" style={{ marginTop: 24 }}>Add pay run</p>
      <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
        <div className="form-group">
          <label className="form-label">Week ending date</label>
          <input
            type="date"
            value={payForm.weekEnding}
            onChange={e => setPayForm(f => ({ ...f, weekEnding: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Rota week</label>
          <select
            value={payForm.rotaWeek}
            onChange={e => setPayForm(f => ({ ...f, rotaWeek: e.target.value }))}
          >
            {[0, 1, 2, 3].map(w => {
              const total = STAFF_META.reduce((sum, s) => sum + weeklyHours(rota, w, s.id), 0)
              return (
                <option key={w} value={w}>Week {w + 1} — {total}h team</option>
              )
            })}
          </select>
        </div>
        <button className="btn-add" onClick={addPayRun}>+ Add pay run</button>
      </div>
      {payError && <p className="error-msg">{payError}</p>}

      {/* ── Pay run preview ── */}
      {payForm.weekEnding && (
        <div className="pay-preview">
          <p className="section-title" style={{ marginBottom: 8 }}>Preview — week {parseInt(payForm.rotaWeek) + 1}</p>
          {staff.map(s => {
            const h = weeklyHours(rota, parseInt(payForm.rotaWeek), s.id)
            const pay = h * s.rate
            return (
              <div key={s.id} className="pay-preview-row">
                <span>{s.name}</span>
                <span>{h}h × {GBP.format(s.rate)}</span>
                <span style={{ fontWeight: 500 }}>{GBP.format(pay)}</span>
              </div>
            )
          })}
          <div className="pay-preview-row pay-preview-total">
            <span>Total</span>
            <span></span>
            <span>
              {GBP.format(
                staff.reduce((sum, s) => sum + weeklyHours(rota, parseInt(payForm.rotaWeek), s.id) * s.rate, 0)
              )}
            </span>
          </div>
        </div>
      )}

      {/* ── Pay run history ── */}
      <p className="section-title" style={{ marginTop: 24 }}>Payment history</p>

      {sorted.length === 0 ? (
        <div className="empty">No pay runs yet. Add one above.</div>
      ) : (
        <table className="holiday-table">
          <thead>
            <tr>
              <th>Week ending</th>
              <th>Rota wk</th>
              {staff.map(s => <th key={s.id}>{s.name}</th>)}
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => {
              const total = r.entries.reduce((sum, e) => sum + e.pay, 0)
              return (
                <tr key={r.id}>
                  <td>{r.weekEnding.split('-').reverse().join('/')}</td>
                  <td>Week {r.rotaWeek + 1}</td>
                  {r.entries.map(e => (
                    <td key={e.empId} style={{ fontSize: 12 }}>
                      {GBP.format(e.pay)}
                      <span style={{ color: 'var(--color-text-tertiary)', marginLeft: 4 }}>({e.hours}h)</span>
                    </td>
                  ))}
                  <td style={{ fontWeight: 500 }}>{GBP.format(total)}</td>
                  <td>
                    <span className={`status-pill ${r.status === 'paid' ? 'pill-approved' : 'pill-pending'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {r.status === 'pending' && (
                      <button className="btn-sm approve" onClick={() => markPaid(r.id)}>Mark paid</button>
                    )}
                    {r.paidOn && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginRight: 6 }}>
                        {r.paidOn.split('-').reverse().join('/')}
                      </span>
                    )}
                    <button className="btn-sm danger" onClick={() => removePayRun(r.id)}>Remove</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
