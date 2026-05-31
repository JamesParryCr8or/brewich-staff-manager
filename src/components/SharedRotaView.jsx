import { CELL_CONFIG } from '../data/constants'

const AV_CLASS = { A: 'av-a', B: 'av-b', C: 'av-c' }

export default function SharedRotaView({ data }) {
  const { weekLabel, rotaWeek, days, rows, generated } = data

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div className="shared-header">
        <img src="/Logo.svg" alt="Brewch" style={{ height: 22, width: 'auto' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Rota snapshot</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {weekLabel} &middot; Rota week {rotaWeek} of 4
          </div>
        </div>
        <a href="/" className="btn-add" style={{ textDecoration: 'none', fontSize: 12 }}>
          View live rota →
        </a>
      </div>

      {/* Calendar grid */}
      <div className="cal-grid" style={{ marginTop: 16 }}>
        <div className="cal-corner" />
        {days.map((d, i) => (
          <div
            key={i}
            className={`cal-day-header${i >= 4 ? ' cal-hdr-weekend' : ''}`}
          >
            <span className="cal-hdr-name">{d.short}</span>
            <span className="cal-hdr-num">{d.dayNum}</span>
            <span className="cal-hdr-month" style={{ opacity: 1 }}>{d.monthShort}</span>
          </div>
        ))}

        {rows.map((row, ri) => {
          const isLast = ri === rows.length - 1
          const avClass = AV_CLASS[row.id] || 'av-a'
          return (
            <SnapshotRow
              key={row.id}
              row={row}
              avClass={avClass}
              isLast={isLast}
            />
          )
        })}
      </div>

      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 12 }}>
        Snapshot generated {generated}. This is a fixed view — visit the live rota for up-to-date shifts.
      </p>
    </div>
  )
}

function SnapshotRow({ row, avClass, isLast }) {
  return (
    <>
      <div className={`cal-row-label${isLast ? ' cal-row-last' : ''}`}>
        <div
          className={`staff-avatar ${avClass}`}
          style={{ width: 28, height: 28, fontSize: 11, marginBottom: 0, flexShrink: 0 }}
        >
          {row.id}
        </div>
        <span className="cal-name" title={row.name}>{row.name}</span>
      </div>

      {row.shifts.map((shift, di) => {
        const cfg   = CELL_CONFIG[shift] ?? CELL_CONFIG.off
        const isOff = shift === 'off'
        return (
          <div
            key={di}
            className={[
              'cal-cell cal-cell-readonly',
              di >= 4  ? 'cal-cell-weekend-col' : '',
              isLast   ? 'cal-cell-last'        : '',
            ].join(' ')}
            style={!isOff ? { background: cfg.bg } : undefined}
          >
            {!isOff && (
              <span className="cal-cell-label" style={{ color: cfg.color }}>
                {shift === 'holiday' ? '🏖️ Holiday'
                  : shift === 'weekend' ? '☀️ 9–3:20'
                  : '9–3:20'}
              </span>
            )}
          </div>
        )
      })}
    </>
  )
}
