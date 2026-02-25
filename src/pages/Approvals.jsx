import { useMemo } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import './Approvals.css'

export default function Approvals() {
  const { chores, kids, getPendingCompletions, approveCompletion, rejectCompletion } = useHousehold()
  const pending = getPendingCompletions()
  const choreById = useMemo(() => Object.fromEntries(chores.map((c) => [c.id, c])), [chores])
  const kidById = useMemo(() => Object.fromEntries(kids.map((k) => [k.id, k])), [kids])

  const byKidAndDate = useMemo(() => {
    const map = {}
    pending.forEach((c) => {
      const kidName = kidById[c.kidId]?.name ?? c.kidId
      const date = c.date || '—'
      const key = `${c.kidId}:${date}`
      if (!map[key]) map[key] = { kidId: c.kidId, kidName, date, items: [] }
      map[key].items.push(c)
    })
    return Object.values(map).sort((a, b) => String(b.date).localeCompare(String(a.date)))
  }, [pending, kidById])

  async function handleApprove(completionId) {
    await approveCompletion(completionId)
  }

  async function handleReject(completionId) {
    await rejectCompletion(completionId)
  }

  return (
    <div className="page approvals-page">
      <div className="page-head">
        <h1>Approvals</h1>
      </div>
      <p className="approvals-intro">
        Kids submit completed tasks here. Approve to award stars; reject to discard.
      </p>

      {byKidAndDate.length === 0 ? (
        <p className="empty-state">No pending submissions.</p>
      ) : (
        <div className="approvals-list">
          {byKidAndDate.map(({ kidId, kidName, date, items }) => (
            <div key={`${kidId}-${date}`} className="card approvals-card">
              <div className="approvals-card-header">
                <h3>{kidName}</h3>
                <span className="approvals-date">{date}</span>
              </div>
              <ul className="approvals-items">
                {items.map((c) => {
                  const chore = choreById[c.choreId]
                  return (
                    <li key={c.id} className="approvals-item">
                      <span className="approvals-item-name">
                        {chore?.name ?? c.choreId} — {chore?.starValue ?? 0} ⭐
                      </span>
                      <div className="approvals-item-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApprove(c.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-danger"
                          onClick={() => handleReject(c.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
