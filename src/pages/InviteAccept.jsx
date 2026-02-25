import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import './InviteAccept.css'

export default function InviteAccept() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [status, setStatus] = useState('loading') // loading | success | error | need-auth

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    async function accept() {
      if (!supabase) {
        setStatus('error')
        return
      }
      if (!user) {
        setStatus('need-auth')
        return
      }
      try {
        const { data, error } = await supabase.rpc('accept_household_invite', {
          invite_token: token,
        })
        if (error) throw error
        if (data) {
          setStatus('success')
          window.location.href = '/parent'
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }
    accept()
  }, [token, user])

  if (status === 'loading') {
    return (
      <div className="page invite-accept-page">
        <p>Joining household…</p>
      </div>
    )
  }

  if (status === 'need-auth') {
    return (
      <div className="page invite-accept-page">
        <h1>Sign in to join</h1>
        <p>You need to sign in before you can accept this invite.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate(`/parent-auth?redirect=/invite/${token}`)}>
          Sign in
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="page invite-accept-page invite-accept-error">
        <h1>Invalid or expired invite</h1>
        <p>This invite link may have expired or already been used. Ask the person who invited you to create a new one.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
          Go home
        </button>
      </div>
    )
  }

  return (
    <div className="page invite-accept-page">
      <p>Redirecting…</p>
    </div>
  )
}
