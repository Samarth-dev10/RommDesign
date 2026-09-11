import React, { useState } from 'react'
import { navigateTo } from '../../App.jsx'
import AuthModal from './AuthModal.jsx'

export default function Navigation() {
  const [authMode, setAuthMode] = useState(null)
  return <>
    <nav className="navbar">
      <div className="nav-logo">IntelliSpace</div>
      <div className="nav-links"><span>Product</span><span>How it Works</span><span>Workspace</span></div>
      <div className="nav-actions"><button className="nav-signin" type="button" onClick={() => setAuthMode('login')}>Sign in</button><button onClick={() => navigateTo('/editor')} className="nav-cta">Enter Workspace</button></div>
    </nav>
    {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} />}
  </>
}
