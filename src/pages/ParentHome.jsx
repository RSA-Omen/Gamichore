import { Link } from 'react-router-dom'
import { useHousehold } from '../contexts/HouseholdContext'
import './ParentHome.css'

export default function ParentHome() {
  const {
    kids,
    chores,
    getPendingCompletions,
    getChoresForKidToday,
    getStarBalance,
    approveCompletion,
    rejectCompletion,
  } = useHousehold()
  const choreById = Object.fromEntries(chores.map((c) => [c.id, c]))
  const kidById = Object.fromEntries(kids.map((k) => [k.id, k]))
  const pending = getPendingCompletions()
  const preview = pending.slice(0, 3)

  return (
    <div className="home">
      <h1>Parent</h1>
      <p className="home-tagline">Manage kids, chores, and the shop.</p>

      {pending.length > 0 && (
        <section className="home-section home-pending">
          <div className="home-section-head">
            <h2>Pending approvals</h2>
            <Link to="/parent/completed-tasks/approvals" className="home-link">
              View all ({pending.length})
            </Link>
          </div>
          <div className="home-pending-list">
            {preview.map((c) => {
              const chore = choreById[c.choreId]
              const kid = kidById[c.kidId]
              return (
                <div key={c.id} className="home-pending-item card">
                  <span className="home-pending-kid">{kid?.avatar} {kid?.name ?? c.kidId}</span>
                  <span className="home-pending-chore">{chore?.name ?? 'Chore'}</span>
                  <span className="home-pending-stars">{c.stars} ★</span>
                  <div className="home-pending-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => approveCompletion(c.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => rejectCompletion(c.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="home-section home-kids">
        <h2>Kids</h2>
        <div className="home-kids-grid">
          {kids.map((kid) => {
            const { daily, weekly, monthly } = getChoresForKidToday(kid.id)
            const total = daily.length + weekly.length + monthly.length
            const done =
              daily.filter((d) => d.alreadyDone).length +
              weekly.filter((w) => w.alreadyDone).length +
              monthly.filter((m) => m.alreadyDone).length
            const balance = getStarBalance(kid.id)
            return (
              <Link
                key={kid.id}
                to="/parent/manage-account/kids"
                className="home-kid-card card"
              >
                <span className="home-kid-avatar">{kid.avatar || '👤'}</span>
                <span className="home-kid-name">{kid.name}</span>
                <span className="home-kid-balance">{balance} ★</span>
                <span className="home-kid-chores">
                  {done}/{total} tasks today
                </span>
              </Link>
            )
          })}
        </div>
        {kids.length === 0 && (
          <p className="home-empty">Add kids in Manage account.</p>
        )}
      </section>
    </div>
  )
}
