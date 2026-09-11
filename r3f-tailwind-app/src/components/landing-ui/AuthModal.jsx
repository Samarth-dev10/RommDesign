import React, { useState } from 'react'
import { X } from 'lucide-react'
import { authRedirectUrl, supabase } from '../../lib/supabaseClient.js'

export default function AuthModal({ mode, onClose, onModeChange }) {
  const isLogin = mode === 'login'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!supabase) { setStatus('Authentication is not configured in this preview.'); return }
    setBusy(true); setStatus('')
    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: authRedirectUrl(), data: { display_name: name.trim() } } })
    setBusy(false)
    if (result.error) { setStatus(isLogin ? 'Invalid email or password.' : result.error.message.includes('password') ? 'Use a stronger password with at least 6 characters.' : 'We could not create that account. Please check your details.'); return }
    setStatus(isLogin ? 'Welcome back. Your workspace is ready.' : 'Check your inbox to confirm your email.')
  }

  return <div className="auth-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-close" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button><p className="auth-eyebrow">INTELLISPACE / {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</p><h2 id="auth-title">{isLogin ? 'Welcome back.' : 'Make room for better ideas.'}</h2><p className="auth-subtitle">{isLogin ? 'Continue shaping spaces with precision.' : 'Save your rooms and return to them whenever inspiration strikes.'}</p><form onSubmit={submit}>{!isLogin && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" /></label>}<label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="At least 6 characters" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={6} required /></label>{status && <p className="auth-status" role="status">{status}</p>}<button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}</button></form><p className="auth-switch">{isLogin ? 'New to IntelliSpace?' : 'Already have an account?'} <button type="button" onClick={() => onModeChange(isLogin ? 'register' : 'login')}>{isLogin ? 'Create an account' : 'Sign in'}</button></p></section></div>
}
