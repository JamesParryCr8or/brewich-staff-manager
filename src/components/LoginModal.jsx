import { useState, useEffect, useRef } from 'react'
import { checkPassword } from '../auth'

export default function LoginModal({ onSuccess, onClose }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState(false)
  const inputRef      = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (checkPassword(pw)) {
      onSuccess()
    } else {
      setErr(true)
      setPw('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-icon">🔒</div>
        <h3 className="modal-title">Admin login</h3>
        <p className="modal-sub">Enter the admin password to enable editing.</p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            className="modal-input"
            value={pw}
            placeholder="Password"
            onChange={e => { setPw(e.target.value); setErr(false) }}
            autoComplete="current-password"
          />
          {err && <p className="modal-error">Incorrect password — try again.</p>}
          <div className="modal-actions">
            <button type="submit" className="modal-btn-primary">Unlock</button>
            <button type="button" className="modal-btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
        <p className="modal-note">
          Visitors without the password can view all tabs but cannot make changes.
        </p>
      </div>
    </div>
  )
}
