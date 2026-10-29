const DEFAULT_API_BASE_URL = 'https://backend-intellispace.onrender.com'
const SESSION_KEY = 'intellispace.session'
const SESSION_TTL_MS = 15 * 24 * 60 * 60 * 1000

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
export const API_BASE_URL = (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL ? '' : configuredApiBaseUrl).replace(/\/+$/, '')

function readSession() {
  try {
    const value = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function getSession() {
  return readSession()
}

export function setSession(session) {
  const expiresAt = session.expiresAt || session.expires_at || (session.expiresIn ? Date.now() + Number(session.expiresIn) * 1000 : Date.now() + SESSION_TTL_MS)
  const persistedSession = { userId: session.userId, token: session.token, expiresAt }
  localStorage.setItem(SESSION_KEY, JSON.stringify(persistedSession))
  sessionStorage.removeItem(SESSION_KEY)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new CustomEvent('intellispace:session-ended'))
}

async function parseResponse(response) {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return { message: text } }
}

function errorMessage(payload, status, path = '') {
  if (typeof payload?.message === 'string') return payload.message
  if (typeof payload?.error === 'string') return payload.error
  if (typeof payload?.detail === 'string') return payload.detail
  if (status === 401) return 'Invalid email or password.'
  if (status === 409 && path.startsWith('/api/auth/register')) return 'An account with this email already exists.'
  if (status === 409) return 'This workspace was changed elsewhere. Reload it before saving again.'
  return 'The request could not be completed. Please try again.'
}

export async function request(path, options = {}) {
  const session = readSession()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (session?.token) headers.Authorization = `Bearer ${session.token}`

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const payload = await parseResponse(response)
  if (!response.ok) {
    if (response.status === 401) clearSession()
    const error = new Error(errorMessage(payload, response.status, path))
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}

export function registerUser({ email, password, displayName }) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) })
}

export function loginUser({ email, password }) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function listWorkspaces() {
  return request('/api/workspaces')
}

export function createWorkspace(workspace) {
  return request('/api/workspaces', { method: 'POST', body: JSON.stringify(workspace) })
}

export function getWorkspace(workspaceId) {
  return request(`/api/workspaces/${encodeURIComponent(workspaceId)}`)
}

export function updateWorkspace(workspaceId, update) {
  return request(`/api/workspaces/${encodeURIComponent(workspaceId)}`, { method: 'PATCH', body: JSON.stringify(update) })
}

export { DEFAULT_API_BASE_URL, SESSION_KEY }
