import { useState } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import './KidToday.css'

export default function KidToday({ kidId, kid }) {
  const { getChoresForKidToday, submitCompletions, getStarBalance } = useHousehold()
  const [checked, setChecked] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const { daily, weekly, monthly } = getChoresForKidToday(kidId)
  const balance = getStarBalance(kidId)

  const toggle = (choreId, periodKey) => {
    const key = `${choreId}:${periodKey}`
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const allItems = [
    ...daily.filter((d) => !d.alreadyDone).map((d) => ({ ...d, frequency: 'daily' })),
    ...weekly.filter((w) => !w.alreadyDone).map((w) => ({ ...w, frequency: 'weekly' })),
    ...monthly.filter((m) => !m.alreadyDone).map((m) => ({ ...m, frequency: 'monthly' })),
  ]

  const selectedItems = allItems.filter((item) => checked[`${item.chore.id}:${item.periodKey}`])

  async function handleSubmit() {
    if (selectedItems.length === 0) {
      alert('Check at least one task to submit.')
      return
    }
    const result = await submitCompletions(
      kidId,
      selectedItems.map((item) => ({ choreId: item.chore.id, periodKey: item.periodKey }))
    )
    if (!result || result.created === 0) {
      alert('Those tasks were already submitted.')
      setChecked({})
      return
    }
    setChecked({})
    setSubmitted(true)
  }

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="page kid-today-page">
      <div className="kid-today-header card">
        <h1>Today</h1>
        <p className="kid-today-date">{todayLabel}</p>
        <p className="kid-today-stars">
          <span className="star-icon">⭐</span> {kid?.name} has <strong>{balance}</strong> stars
        </p>
      </div>

      {submitted && (
        <div className="kid-today-message card">
          Submitted. Wait for a parent to approve to earn your stars.
        </div>
      )}

      {allItems.length === 0 ? (
        <p className="empty-state">No tasks for today. Ask a parent to assign chores or a chore set.</p>
      ) : (
        <>
          {daily.filter((d) => !d.alreadyDone).length > 0 && (
            <section className="kid-today-section card">
              <h2>Daily</h2>
              <ul className="kid-today-list">
                {daily.map((d) =>
                  d.alreadyDone ? (
                    <li key={`${d.chore.id}-${d.periodKey}`} className="kid-today-done">
                      <span className="kid-today-check">✓</span> {d.chore.name} ({d.chore.starValue} ⭐)
                    </li>
                  ) : (
                    <li key={`${d.chore.id}-${d.periodKey}`}>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!checked[`${d.chore.id}:${d.periodKey}`]}
                          onChange={() => toggle(d.chore.id, d.periodKey)}
                        />
                        <span>{d.chore.name}</span>
                        <span className="kid-today-stars-inline">{d.chore.starValue} ⭐</span>
                      </label>
                    </li>
                  )
                )}
              </ul>
            </section>
          )}

          {weekly.filter((w) => !w.alreadyDone).length > 0 && (
            <section className="kid-today-section card">
              <h2>This week</h2>
              <ul className="kid-today-list">
                {weekly.map((w) =>
                  w.alreadyDone ? (
                    <li key={`${w.chore.id}-${w.periodKey}`} className="kid-today-done">
                      <span className="kid-today-check">✓</span> {w.chore.name} ({w.chore.starValue} ⭐)
                    </li>
                  ) : (
                    <li key={`${w.chore.id}-${w.periodKey}`}>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!checked[`${w.chore.id}:${w.periodKey}`]}
                          onChange={() => toggle(w.chore.id, w.periodKey)}
                        />
                        <span>{w.chore.name}</span>
                        <span className="kid-today-stars-inline">{w.chore.starValue} ⭐</span>
                      </label>
                    </li>
                  )
                )}
              </ul>
            </section>
          )}

          {monthly.filter((m) => !m.alreadyDone).length > 0 && (
            <section className="kid-today-section card">
              <h2>This month</h2>
              <ul className="kid-today-list">
                {monthly.map((m) =>
                  m.alreadyDone ? (
                    <li key={`${m.chore.id}-${m.periodKey}`} className="kid-today-done">
                      <span className="kid-today-check">✓</span> {m.chore.name} ({m.chore.starValue} ⭐)
                    </li>
                  ) : (
                    <li key={`${m.chore.id}-${m.periodKey}`}>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!checked[`${m.chore.id}:${m.periodKey}`]}
                          onChange={() => toggle(m.chore.id, m.periodKey)}
                        />
                        <span>{m.chore.name}</span>
                        <span className="kid-today-stars-inline">{m.chore.starValue} ⭐</span>
                      </label>
                    </li>
                  )
                )}
              </ul>
            </section>
          )}

          {selectedItems.length > 0 && (
            <div className="kid-today-submit">
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                Submit to parent ({selectedItems.length} task{selectedItems.length !== 1 ? 's' : ''})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
