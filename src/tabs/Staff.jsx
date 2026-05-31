import { STAFF, TOTAL_HOLIDAY_HOURS } from '../data/constants'

export default function Staff({ holidays }) {
  function holidayUsed(empId) {
    return holidays
      .filter(h => h.employee === empId && h.status === 'approved')
      .reduce((sum, h) => sum + h.hours, 0)
  }

  return (
    <div>
      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Team size</div>
          <div className="stat-val">3</div>
          <div className="stat-sub">Full rota active</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg weekly hrs</div>
          <div className="stat-val">27h</div>
          <div className="stat-sub">per employee</div>
        </div>
        <div className="stat">
          <div className="stat-label">Holiday / employee</div>
          <div className="stat-val">122h</div>
          <div className="stat-sub">≈ 4.9 weeks</div>
        </div>
        <div className="stat">
          <div className="stat-label">1 week leave =</div>
          <div className="stat-val">25h</div>
          <div className="stat-sub">Weekend = 6h</div>
        </div>
      </div>

      <p className="section-title">Team members</p>

      <div className="staff-cards">
        {STAFF.map(s => {
          const used = holidayUsed(s.id)
          const remaining = TOTAL_HOLIDAY_HOURS - used
          const pct = Math.min(100, Math.round((used / TOTAL_HOLIDAY_HOURS) * 100))
          const weeksLeft = remaining > 0 ? Math.floor(remaining / 25) : 0

          return (
            <div key={s.id} className="staff-card">
              <div className={`staff-avatar ${s.avatarClass}`}>{s.id}</div>

              <div className="staff-name">
                {s.name}
                <span className={`badge ${s.id === 'A' ? 'badge-manager' : 'badge-staff'}`}>
                  {s.id === 'A' ? 'manager' : 'staff'}
                </span>
              </div>
              <div className="staff-role">{s.role}</div>

              <div className="progress-label">
                <span>Holiday used</span>
                <span>{used}h / {TOTAL_HOLIDAY_HOURS}h</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: s.fillColor }}
                />
              </div>
              <div className="progress-label">
                <span style={{ color: 'var(--color-text-tertiary)' }}>{remaining}h remaining</span>
                <span>{weeksLeft} week{weeksLeft !== 1 ? 's' : ''} left</span>
              </div>

              <div className="staff-meta">
                <span>⏰ 9:00am – 3:20pm shifts</span>
                <span>☕ 20-min unpaid break per shift</span>
                <span>📅 Min 1 weekend day / week</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
