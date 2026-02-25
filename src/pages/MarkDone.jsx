import { useHousehold } from '../contexts/HouseholdContext'
import './MarkDone.css'

export default function MarkDone() {
  const { kids, getChoresForKidToday, recordCompletion, getCompletionForPeriod, removeCompletion, getStarBalance } = useHousehold()
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  async function handleToggle(kidId, choreId, periodKey, currentlyDone) {
    if (currentlyDone) {
      const c = getCompletionForPeriod(kidId, choreId, periodKey)
      if (c) await removeCompletion(c.id)
    } else {
      await recordCompletion(kidId, choreId, periodKey)
    }
  }

  return (
    <div className="page mark-done-page">
      <div className="page-head">
        <h1>Mark done</h1>
      </div>
      <p className="mark-done-intro">
        Tick or untick tasks for today. Changes apply immediately (stars awarded or removed).
      </p>
      <p className="mark-done-date">{todayLabel}</p>

      {kids.length === 0 ? (
        <p className="empty-state">Add kids and assign chore sets to them.</p>
      ) : (
        <div className="mark-done-kids">
          {kids.map((kid) => (
            <KidDaySection
              key={kid.id}
              kid={kid}
              balance={getStarBalance(kid.id)}
              getChoresForKidToday={getChoresForKidToday}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function KidDaySection({ kid, balance, getChoresForKidToday, onToggle }) {
  const { daily, weekly, monthly } = getChoresForKidToday(kid.id)
  const hasAny = daily.length > 0 || weekly.length > 0 || monthly.length > 0

  if (!hasAny) {
    return (
      <div className="card mark-done-kid-card">
        <h3 className="mark-done-kid-name">{kid.avatar || kid.name.charAt(0)} {kid.name}</h3>
        <p className="mark-done-no-tasks">No chore sets assigned. Assign sets on Chore sets or Kids page.</p>
      </div>
    )
  }

  return (
    <div className="card mark-done-kid-card">
      <div className="mark-done-kid-header">
        <h3 className="mark-done-kid-name">{kid.avatar || kid.name.charAt(0)} {kid.name}</h3>
        <span className="mark-done-kid-stars">{balance} ⭐</span>
      </div>
      <Section title="Daily" items={daily} kidId={kid.id} onToggle={onToggle} />
      <Section title="This week" items={weekly} kidId={kid.id} onToggle={onToggle} />
      <Section title="This month" items={monthly} kidId={kid.id} onToggle={onToggle} />
    </div>
  )
}

function Section({ title, items, kidId, onToggle }) {
  if (items.length === 0) return null
  return (
    <section className="mark-done-section">
      <h4 className="mark-done-section-title">{title}</h4>
      <ul className="mark-done-list">
        {items.map((item) => (
          <li key={`${item.chore.id}-${item.periodKey}`} className="mark-done-item">
            <label>
              <input
                type="checkbox"
                checked={item.alreadyDone}
                onChange={() => onToggle(kidId, item.chore.id, item.periodKey, item.alreadyDone)}
              />
              <span>{item.chore.name}</span>
              <span className="mark-done-item-stars">{item.chore.starValue} ⭐</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
