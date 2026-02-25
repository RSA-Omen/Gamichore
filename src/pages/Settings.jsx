import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { supabase } from '../lib/supabase'
import './Settings.css'

export default function Settings() {
  const { theme, setTheme, themes } = useTheme()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLink, setInviteLink] = useState(null)
  const [inviteError, setInviteError] = useState('')
  const [inviting, setInviting] = useState(false)

  async function handleCreateInvite(e) {
    e.preventDefault()
    if (!inviteEmail.trim() || !supabase) return
    setInviting(true)
    setInviteError('')
    setInviteLink(null)
    try {
      const { data, error } = await supabase.rpc('create_household_invite', {
        invite_email: inviteEmail.trim(),
      })
      if (error) throw error
      const link = `${window.location.origin}/invite/${data.token}`
      setInviteLink(link)
    } catch (err) {
      setInviteError(err.message || 'Failed to create invite')
    } finally {
      setInviting(false)
    }
  }

  function copyInviteLink() {
    if (inviteLink) navigator.clipboard?.writeText(inviteLink)
  }

  return (
    <div className="page settings-page">
      <h1>Settings</h1>
      <div className="settings-theme">
        <label htmlFor="theme-select">Theme</label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="settings-theme-select"
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <section className="settings-section card">
        <h2>Invite co-parent</h2>
        <p className="settings-section-desc">
          Share your household with another parent. They&apos;ll see the same kids, chores, and shop. Invite expires in 7 days.
        </p>
        <form onSubmit={handleCreateInvite} className="settings-invite-form">
          <label>
            Co-parent email
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="parent@example.com"
              disabled={inviting}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={inviting}>
            {inviting ? 'Creating…' : 'Create invite link'}
          </button>
        </form>
        {inviteError && <p className="settings-invite-error">{inviteError}</p>}
        {inviteLink && (
          <div className="settings-invite-link">
            <p>Share this link with the co-parent:</p>
            <div className="settings-invite-link-row">
              <input type="text" readOnly value={inviteLink} className="settings-invite-link-input" />
              <button type="button" className="btn btn-ghost" onClick={copyInviteLink}>
                Copy
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
