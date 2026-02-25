import { useState } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import './ApprovalLog.css'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function ApprovalLog() {
  const { kids, getChoresForKidOnDate, recordCompletion, getCompletionForPeriod, removeCompletion } = useHousehold()
  const [selectedDate, setSelectedDate] = useState(todayDateStr())

  async function handleToggle(kidId, choreId, periodKey, currentlyDone) {
    if (currentlyDone) {
      const c = getCompletionForPeriod(kidId, choreId, periodKey)
      if (c) await removeCompletion(c.id)
    } else {
      await recordCompletion(kidId, choreId, periodKey, selectedDate)
    }
  }

  return (
    <div className="page approval-log-page">
      <div className="page-head">
        <h1>Approval log</h1>
      </div>
      <p className="approval-log-intro">
        Pick a date to see all tasks per child. Tick to mark done, untick to unmark (stars adjusted).
      </p>

      <label className="approval-log-date-picker">
        <span>Date</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </label>
      <p className="approval-log-date-label">{formatDate(selectedDate)}</p>

      {kids.length === 0 ? (
        <p className="empty-state">Add kids and assign chore sets.</p>
      ) : (
        <div className="approval-log-list">
          {kids.map((kid) => (
            <KidDayCard
              key={kid.id}
              kid={kid}
              selectedDate={selectedDate}
              getChoresForKidOnDate={getChoresForKidOnDate}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function KidDayCard({ kid, selectedDate, getChoresForKidOnDate, onToggle }) {
  const { daily, weekly, monthly } = getChoresForKidOnDate(kid.id, selectedDate)
  const hasAny = daily.length > 0 || weekly.length > 0 || monthly.length > 0

  if (!hasAny) {
    return (
      <div className="card approval-log-day">
        <h3 className="approval-log-day-title">{kid.avatar || kid.name.charAt(0)} {kid.name}</h3>
        <p className="approval-log-no-tasks">No chore sets assigned.</p>
      </div>
    )
  }

  return (
    <div className="card approval-log-day">
      <h3 className="approval-log-day-title">{kid.avatar || kid.name.charAt(0)} {kid.name}</h3>
      <Section title="Daily" items={daily} kidId={kid.id} onToggle={onToggle} />
      <Section title="This week" items={weekly} kidId={kid.id} onToggle={onToggle} />
      <Section title="This month" items={monthly} kidId={kid.id} onToggle={onToggle} />
    </div>
  )
}

function Section({ title, items, kidId, onToggle }) {
  if (items.length === 0) return null
  return (
    <section className="approval-log-section">
      <h4 className="approval-log-section-title">{title}</h4>
      <ul className="approval-log-items">
        {items.map((item) => (
          <li key={`${item.chore.id}-${item.periodKey}`} className="approval-log-item">
            <label>
              <input
                type="checkbox"
                checked={item.alreadyDone}
                onChange={() => onToggle(kidId, item.chore.id, item.periodKey, item.alreadyDone)}
              />
              <span className="approval-log-item-name">{item.chore.name}</span>
              <span className="approval-log-item-stars">{item.chore.starValue} ⭐</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
