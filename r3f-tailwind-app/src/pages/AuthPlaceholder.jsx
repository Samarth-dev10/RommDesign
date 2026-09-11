import React from 'react';
import { navigateTo } from '../utils/navigation.js';

export default function AuthPlaceholder({ mode }) {
  const isLogin = mode === 'login';
  return (
    <div className="placeholder-page">
      <div className="eyebrow">INTELLISPACE / {isLogin ? 'LOGIN' : 'REGISTER'}</div>
      <h1 className="placeholder-title">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
      <div className="auth-form">
        <input placeholder="Email" className="auth-input" />
        <input placeholder="Password" type="password" className="auth-input" />
        <button className="btn-primary full-width">{isLogin ? 'Sign In' : 'Sign Up'}</button>
      </div>
      <button onClick={() => navigateTo('/')} className="btn-link mt-lg">
        ← Back to landing
      </button>
    </div>
  );
}
