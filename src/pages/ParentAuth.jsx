import { useState } from 'react'
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import './ParentAuth.css'

export default function ParentAuth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/parent'
  const { isAuthenticated, user, householdId, loading, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  // User signed in but profile missing (e.g. created before trigger)
  if (!loading && user && !householdId) {
    return (
      <div className="parent-auth">
        <div className="card parent-auth-card">
          <h1>Account setup needed</h1>
          <p className="parent-auth-help">
            Run migration <code>20250225000002_backfill_profiles.sql</code> in Supabase SQL Editor, then refresh.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => signOut()}>Sign out</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Back</button>
        </div>
      </div>
    )
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Email and password required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password)
      } else {
        await signIn(email.trim(), password)
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="parent-auth">
        <div className="card parent-auth-card">
          <h1>Setup required</h1>
          <p className="parent-auth-help">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
            See <code>.env.example</code>.
          </p>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="parent-auth">
      <div className="card parent-auth-card">
        <h1>{mode === 'signup' ? 'Create account' : 'Sign in'}</h1>
        <p className="parent-auth-help">
          {mode === 'signup'
            ? 'Create an account to manage your family chores.'
            : 'Sign in to open parent controls.'}
        </p>
        <form onSubmit={submit} className="parent-auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>
          {error && <p className="parent-auth-error">{error}</p>}
          <div className="parent-auth-actions">
            <button type="submit" className="btn btn-primary">
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError('')
              }}
            >
              {mode === 'signin' ? 'Create account' : 'Already have an account? Sign in'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
