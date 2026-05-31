import { useState } from 'react'

export default function ShareModal({ url, weekLabel, onClose }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-icon">🔗</div>
        <h3 className="modal-title">Share rota</h3>
        <p className="modal-sub">
          Snapshot of <strong>{weekLabel}</strong>.<br />
          Anyone with this link can view it — no login required.
        </p>
        <div className="share-url-box">
          <span className="share-url-text">{url}</span>
        </div>
        <div className="modal-actions">
          <button className="modal-btn-primary" onClick={copy}>
            {copied ? '✓ Copied!' : '📋 Copy link'}
          </button>
          <button className="modal-btn-secondary" onClick={onClose}>Close</button>
        </div>
        <p className="modal-note">
          The snapshot is baked into the link — it reflects the rota exactly as it is right now.
        </p>
      </div>
    </div>
  )
}
