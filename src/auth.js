// Password stored as base64 — not cryptographically secure, but fine for
// internal view-only gating. Anyone who views the JS bundle can decode it.
const _K = 'Um9yeVdhcmQxIQ==' // btoa('RoryWard1!')
const SESSION_KEY = 'brewch_admin'

export function checkPassword(pw) {
  return btoa(pw) === _K
}

export function getIsAdmin() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function setAdmin(on) {
  if (on) sessionStorage.setItem(SESSION_KEY, '1')
  else sessionStorage.removeItem(SESSION_KEY)
}
