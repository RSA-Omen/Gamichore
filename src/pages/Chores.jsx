import { useState } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import './Chores.css'

export default function Chores() {
  const { chores, addChore, updateChore, deleteChore } = useHousehold()
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formStars, setFormStars] = useState('1')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditingId(null)
    setFormName('')
    setFormStars('1')
    setShowForm(true)
  }

  function openEdit(chore) {
    setEditingId(chore.id)
    setFormName(chore.name)
    setFormStars(String(chore.starValue))
    setShowForm(true)
  }

  async function submit(e) {
    e.preventDefault()
    if (!formName.trim()) return
    setSaving(true)
    try {
      const stars = Math.max(0, parseInt(formStars, 10) || 0)
      if (editingId) {
        await updateChore(editingId, { name: formName.trim(), starValue: stars })
      } else {
        await addChore(formName.trim(), stars)
      }
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function remove(chore) {
    if (!confirm(`Delete chore "${chore.name}"?`)) return
    await deleteChore(chore.id)
    setShowForm(false)
  }

  return (
    <div className="page chores-page">
      <div className="page-head">
        <h1>Chores</h1>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          Add chore
        </button>
      </div>

      {showForm && (
        <form className="card chore-form" onSubmit={submit}>
          <h3>{editingId ? 'Edit chore' : 'New chore'}</h3>
          <label>
            Task name
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Set the table"
              autoFocus
            />
          </label>
          <label>
            Stars
            <input
              type="number"
              min="0"
              value={formStars}
              onChange={(e) => setFormStars(e.target.value)}
            />
          </label>
          <p className="chore-form-hint">Assign chores to kids by adding them to chore sets (Chore sets page).</p>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="chores-list">
        {chores.map((chore) => (
          <div key={chore.id} className="card chore-row">
            <div className="chore-main">
              <span className="chore-stars">{chore.starValue} ⭐</span>
              <div>
                <h3 className="chore-name">{chore.name}</h3>
              </div>
            </div>
            <div className="chore-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(chore)}>
                Edit
              </button>
              <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => remove(chore)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {chores.length === 0 && !showForm && (
        <p className="empty-state">Add chores, then add them to chore sets and assign sets to kids.</p>
      )}
    </div>
  )
}
