import { useState } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import './Kids.css'

export default function Kids() {
  const { kids, choreSets, getStarBalance, addKid, updateKid, deleteKid } = useHousehold()
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formAvatar, setFormAvatar] = useState('')
  const [formAge, setFormAge] = useState('')
  const [formStars, setFormStars] = useState('')
  const [formStarOverride, setFormStarOverride] = useState(false)
  const [formChoreSetIds, setFormChoreSetIds] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const balances = {}
  kids.forEach((k) => { balances[k.id] = getStarBalance(k.id) })

  function openNew() {
    setEditingId(null)
    setFormName('')
    setFormAvatar('')
    setFormAge('')
    setFormStars('')
    setFormStarOverride(false)
    setFormChoreSetIds([])
    setShowForm(true)
  }

  function openEdit(kid) {
    setEditingId(kid.id)
    setFormName(kid.name)
    setFormAvatar(kid.avatar || '')
    setFormAge(kid.age ?? '')
    const balance = getStarBalance(kid.id)
    setFormStars(String(kid.starBalanceOverride ?? balance))
    setFormStarOverride(kid.starBalanceOverride !== null && kid.starBalanceOverride !== undefined)
    setFormChoreSetIds(Array.isArray(kid.choreSetIds) ? [...kid.choreSetIds] : [])
    setShowForm(true)
  }

  async function submit(e) {
    e.preventDefault()
    if (!formName.trim()) return
    setSaving(true)
    try {
      const starOverride = formStarOverride ? (parseInt(formStars, 10) || 0) : null
      if (editingId) {
        await updateKid(editingId, {
          name: formName.trim(),
          avatar: formAvatar.trim(),
          age: formAge.trim(),
          starBalanceOverride: starOverride,
          choreSetIds: formChoreSetIds,
        })
      } else {
        const { id: newId } = await addKid(formName.trim(), formAvatar.trim(), formAge.trim())
        if (newId && formChoreSetIds.length) {
          await updateKid(newId, { choreSetIds: formChoreSetIds })
        }
      }
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  function toggleChoreSet(setId) {
    setFormChoreSetIds((prev) =>
      prev.includes(setId) ? prev.filter((id) => id !== setId) : [...prev, setId]
    )
  }

  async function remove(kid) {
    if (!confirm(`Remove ${kid.name}? Their star history will be deleted.`)) return
    await deleteKid(kid.id)
    setShowForm(false)
  }

  return (
    <div className="page kids-page">
      <div className="page-head">
        <h1>Kids</h1>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          Add kid
        </button>
      </div>

      {showForm && (
        <form className="card kid-form" onSubmit={submit}>
          <h3>{editingId ? 'Edit profile' : 'New kid'}</h3>
          <label>
            Name
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Sam"
              autoFocus
            />
          </label>
          <label>
            Avatar (emoji or initial)
            <input
              value={formAvatar}
              onChange={(e) => setFormAvatar(e.target.value)}
              placeholder="e.g. 🌟 or S"
            />
          </label>
          <label>
            Age
            <input
              type="text"
              value={formAge}
              onChange={(e) => setFormAge(e.target.value)}
              placeholder="e.g. 8"
            />
          </label>
          {editingId && (
            <>
              <label className="kid-form-star-override">
                <input
                  type="checkbox"
                  checked={formStarOverride}
                  onChange={(e) => setFormStarOverride(e.target.checked)}
                />
                <span>Override star balance</span>
              </label>
              {formStarOverride && (
                <label>
                  Star balance
                  <input
                    type="number"
                    min={0}
                    value={formStars}
                    onChange={(e) => setFormStars(e.target.value)}
                  />
                </label>
              )}
            </>
          )}
          <label>
            Chore sets
            <div className="kid-form-chore-sets">
              {choreSets.length === 0 ? (
                <p className="text-muted">None. Create sets on Chore sets page.</p>
              ) : (
                choreSets.map((s) => (
                  <label key={s.id} className="kid-form-chore-set-item">
                    <input
                      type="checkbox"
                      checked={formChoreSetIds.includes(s.id)}
                      onChange={() => toggleChoreSet(s.id)}
                    />
                    <span>{s.name}</span>
                  </label>
                ))
              )}
            </div>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="kids-grid">
        {kids.map((kid) => (
          <div key={kid.id} className="card kid-card">
            <div className="kid-avatar">{kid.avatar || kid.name.charAt(0)}</div>
            <div className="kid-info">
              <h3>{kid.name}</h3>
              <p className="kid-stars">
                <span className="star-icon">⭐</span> {balances[kid.id] ?? 0} stars
              </p>
              {kid.choreSetIds?.length > 0 && (
                <p className="kid-chore-set">
                  Chore sets: {kid.choreSetIds.map((id) => choreSets.find((s) => s.id === id)?.name).filter(Boolean).join(', ') || '—'}
                </p>
              )}
            </div>
            <div className="kid-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(kid)}>
                Edit
              </button>
              <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => remove(kid)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {kids.length === 0 && !showForm && (
        <p className="empty-state">Add a kid to get started.</p>
      )}
    </div>
  )
}
