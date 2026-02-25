import { useState, useMemo } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import { AGE_CHORE_PRESETS } from '../agePresets'
import './ChoreSets.css'

const presetAges = AGE_CHORE_PRESETS.map((p) => p.age)

export default function ChoreSets() {
  const {
    choreSets: sets,
    chores,
    kids,
    addChoreSet,
    updateChoreSet,
    deleteChoreSet,
    updateKid,
    importAgePresetData,
  } = useHousehold()
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formChoreIds, setFormChoreIds] = useState([])
  const [formFrequency, setFormFrequency] = useState('daily')
  const [formAssignedKidIds, setFormAssignedKidIds] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [presetAge, setPresetAge] = useState('all')
  const [presetAssignByAge, setPresetAssignByAge] = useState(true)
  const [presetMessage, setPresetMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const choreById = useMemo(() => Object.fromEntries(chores.map((c) => [c.id, c])), [chores])

  function openNew() {
    setEditingId(null)
    setFormName('')
    setFormChoreIds([])
    setFormFrequency('daily')
    setFormAssignedKidIds([])
    setShowForm(true)
  }

  function openEdit(set) {
    setEditingId(set.id)
    setFormName(set.name)
    setFormChoreIds(set.choreIds || [])
    setFormFrequency(set.frequency || 'daily')
    setFormAssignedKidIds(kids.filter((k) => (k.choreSetIds || []).includes(set.id)).map((k) => k.id))
    setShowForm(true)
  }

  function toggleChore(choreId) {
    setFormChoreIds((prev) =>
      prev.includes(choreId) ? prev.filter((id) => id !== choreId) : [...prev, choreId]
    )
  }

  async function submit(e) {
    e.preventDefault()
    if (!formName.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateChoreSet(editingId, {
          name: formName.trim(),
          choreIds: formChoreIds,
          frequency: formFrequency,
        })
        for (const k of kids) {
          const hasSet = (k.choreSetIds || []).includes(editingId)
          const shouldHave = formAssignedKidIds.includes(k.id)
          if (hasSet !== shouldHave) {
            const next = shouldHave
              ? [...(k.choreSetIds || []), editingId]
              : (k.choreSetIds || []).filter((id) => id !== editingId)
            await updateKid(k.id, { choreSetIds: next })
          }
        }
      } else {
        const { id: newSetId } = await addChoreSet(formName.trim(), formChoreIds, formFrequency)
        for (const kidId of formAssignedKidIds) {
          const k = kids.find((x) => x.id === kidId)
          if (k) await updateKid(kidId, { choreSetIds: [...(k.choreSetIds || []), newSetId] })
        }
      }
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  function toggleAssignKid(kidId) {
    setFormAssignedKidIds((prev) =>
      prev.includes(kidId) ? prev.filter((id) => id !== kidId) : [...prev, kidId]
    )
  }

  async function remove(set) {
    if (!confirm(`Delete chore set "${set.name}"? Kids assigned to it will have it cleared.`)) return
    await deleteChoreSet(set.id)
    setShowForm(false)
  }

  async function importPresets() {
    const selectedAge = presetAge === 'all' ? null : Number(presetAge)
    const result = await importAgePresetData(selectedAge, { assignToMatchingKids: presetAssignByAge })
    setPresetMessage(
      `Loaded ages ${result.agesLoaded.join(', ')}. ` +
        `Created ${result.choresCreated} chore(s), ${result.setsCreated} set(s), updated ${result.setsUpdated} set(s), assigned ${result.kidsAssigned} kid profile(s).`
    )
  }

  async function handleAssignKid(kid, set, checked) {
    const next = checked
      ? [...(kid.choreSetIds || []), set.id]
      : (kid.choreSetIds || []).filter((id) => id !== set.id)
    await updateKid(kid.id, { choreSetIds: next })
  }

  return (
    <div className="page chore-sets-page">
      <div className="page-head">
        <h1>Chore sets</h1>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          Add chore set
        </button>
      </div>

      <div className="card chore-set-presets">
        <h3>Age presets</h3>
        <p className="text-muted">
          Load ready-made chores for ages 3-12. After loading, edit or remove anything using normal chore and chore set screens.
        </p>
        <div className="chore-set-presets-controls">
          <label>
            Preset age
            <select value={presetAge} onChange={(e) => setPresetAge(e.target.value)}>
              <option value="all">All ages</option>
              {presetAges.map((age) => (
                <option key={age} value={String(age)}>Age {age}</option>
              ))}
            </select>
          </label>
          <label className="chore-set-presets-checkbox">
            <input
              type="checkbox"
              checked={presetAssignByAge}
              onChange={(e) => setPresetAssignByAge(e.target.checked)}
            />
            <span>Assign imported sets to kids with matching age</span>
          </label>
          <button type="button" className="btn btn-primary" onClick={importPresets}>
            Import presets
          </button>
        </div>
        {presetMessage && <p className="chore-set-presets-message">{presetMessage}</p>}
      </div>

      {showForm && (
        <form className="card chore-set-form" onSubmit={submit}>
          <h3>{editingId ? 'Edit chore set' : 'New chore set'}</h3>
          <label>
            Name
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Morning routine"
              autoFocus
            />
          </label>
          <label>
            Frequency
            <select
              value={formFrequency}
              onChange={(e) => setFormFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label>
            Chores in this set
            <div className="chore-set-chore-list">
              {chores.length === 0 ? (
                <p className="text-muted">Add chores first (Chores page).</p>
              ) : (
                chores.map((c) => (
                  <label key={c.id} className="chore-set-chore-item">
                    <input
                      type="checkbox"
                      checked={formChoreIds.includes(c.id)}
                      onChange={() => toggleChore(c.id)}
                    />
                    <span>{c.name}</span>
                    <span className="chore-set-stars">{c.starValue} ⭐</span>
                  </label>
                ))
              )}
            </div>
          </label>
          <label>
            Assign to kids
            <div className="chore-set-chore-list">
              {kids.map((k) => (
                <label key={k.id} className="chore-set-chore-item">
                  <input
                    type="checkbox"
                    checked={formAssignedKidIds.includes(k.id)}
                    onChange={() => toggleAssignKid(k.id)}
                  />
                  <span>{k.name}</span>
                </label>
              ))}
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

      <div className="chore-sets-list">
        {sets.map((set) => {
          const setChores = (set.choreIds || []).map((id) => choreById[id]).filter(Boolean)
          return (
            <div key={set.id} className="card chore-set-card">
              <div className="chore-set-header">
                <h3>{set.name}</h3>
                <span className="chore-set-frequency">{set.frequency === 'weekly' ? 'Weekly' : set.frequency === 'monthly' ? 'Monthly' : 'Daily'}</span>
                <div className="chore-set-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(set)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => remove(set)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="chore-set-chores">
                {setChores.length === 0 ? (
                  <p className="text-muted">No chores in set.</p>
                ) : (
                  <ul>
                    {setChores.map((c) => (
                      <li key={c.id}>{c.name} ({c.starValue} ⭐)</li>
                    ))}
                  </ul>
                )}
              </div>
              <label className="chore-set-assign">
                <span>Assigned to:</span>
                <div className="chore-set-kid-list">
                  {kids.length === 0 ? (
                    <p className="text-muted">Add kids first.</p>
                  ) : (
                    kids.map((k) => (
                      <label key={k.id} className="chore-set-kid-item">
                        <input
                          type="checkbox"
                          checked={(k.choreSetIds || []).includes(set.id)}
                          onChange={(e) => handleAssignKid(k, set, e.target.checked)}
                        />
                        <span>{k.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </label>
            </div>
          )
        })}
      </div>

      {sets.length === 0 && !showForm && (
        <p className="empty-state">Create a chore set (e.g. Morning routine) and assign it to a kid.</p>
      )}
    </div>
  )
}
