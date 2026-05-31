import { POLICY_RULES } from '../data/constants'

export default function Policy() {
  return (
    <div>
      <p className="section-title">Employment policy — key rules</p>

      <div className="rule-list">
        {POLICY_RULES.map((rule, i) => (
          <div key={i} className="rule-item">
            <span className="rule-icon">{rule.icon}</span>
            <span className="rule-text">{rule.text}</span>
            <span className="rule-val">{rule.val}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 14 }}>
        All rules derived from the signed Brewch staffing, employment & annual leave policy. This view is read-only reference.
      </p>
    </div>
  )
}
