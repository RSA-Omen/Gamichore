import { useState } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import './HabitTracker.css'

const DAYS = 28
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function dayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  return day === 0 ? 6 : day - 1
}

function formatShort(dateStr) {
  return new Date(dateStr + 'T12:00:00').getDate()
}

function chunkByWeek(stats) {
  const weeks = []
  let current = []
  stats.forEach((day) => {
    const dow = dayOfWeek(day.date)
    if (dow === 0 && current.length > 0) {
      while (current.length < 7) current.push(null)
      weeks.push(current)
      current = []
    }
    while (current.length < dow) current.push(null)
    current.push(day)
  })
  if (current.length > 0) {
    while (current.length < 7) current.push(null)
    weeks.push(current)
  }
  return weeks
}

export default function HabitTracker() {
  const { kids, getHabitStats } = useHousehold()
  const [selectedKidId, setSelectedKidId] = useState(kids[0]?.id || null)
  const stats = selectedKidId ? getHabitStats(selectedKidId, DAYS) : []

  const totalCompleted = stats.reduce((s, d) => s + d.completed, 0)
  const totalSkipped = stats.reduce((s, d) => s + d.skipped, 0)
  const totalDue = totalCompleted + totalSkipped
  const completionRate = totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0

  return (
    <div className="page habit-tracker-page">
      <h1>Habit tracker</h1>
      <p className="habit-tracker-intro">
        When kids complete tasks vs when they skip. Last 4 weeks.
      </p>

      {kids.length === 0 ? (
        <p className="habit-tracker-empty">Add kids in Manage account to see habits.</p>
      ) : (
        <>
          <div className="habit-tracker-kid-picker">
            <label htmlFor="habit-kid">Kid</label>
            <select
              id="habit-kid"
              value={selectedKidId || ''}
              onChange={(e) => setSelectedKidId(e.target.value || null)}
            >
              {kids.map((k) => (
                <option key={k.id} value={k.id}>{k.avatar} {k.name}</option>
              ))}
            </select>
          </div>

          <div className="habit-tracker-stats">
            <div className="habit-stat">
              <span className="habit-stat-value habit-stat-done">{totalCompleted}</span>
              <span className="habit-stat-label">Done</span>
            </div>
            <div className="habit-stat">
              <span className="habit-stat-value habit-stat-skipped">{totalSkipped}</span>
              <span className="habit-stat-label">Skipped</span>
            </div>
            <div className="habit-stat">
              <span className="habit-stat-value">{completionRate}%</span>
              <span className="habit-stat-label">Rate</span>
            </div>
          </div>

          <div className="habit-tracker-legend">
            <span className="habit-legend-item habit-legend-done">All done</span>
            <span className="habit-legend-item habit-legend-partial">Partial</span>
            <span className="habit-legend-item habit-legend-skipped">Skipped</span>
            <span className="habit-legend-item habit-legend-none">No tasks</span>
          </div>

          <div className="habit-tracker-grid">
            <div className="habit-grid-header">
              {WEEKDAYS.map((d) => (
                <span key={d} className="habit-grid-weekday">{d}</span>
              ))}
            </div>
            {chunkByWeek(stats).map((week, wi) => (
              <div key={wi} className="habit-grid-week">
                {WEEKDAYS.map((_, di) => {
                  const dayStats = week[di]
                  if (!dayStats) {
                    return <div key={di} className="habit-cell habit-cell-empty" />
                  }
                  const { date, completed, skipped, due } = dayStats
                  const isToday = date === new Date().toISOString().slice(0, 10)
                  let cellClass = 'habit-cell'
                  if (due === 0) cellClass += ' habit-cell-none'
                  else if (skipped === 0) cellClass += ' habit-cell-done'
                  else if (completed > 0) cellClass += ' habit-cell-partial'
                  else cellClass += ' habit-cell-skipped'
                  if (isToday) cellClass += ' habit-cell-today'
                  return (
                    <div
                      key={di}
                      className={cellClass}
                      title={`${date}: ${completed} done, ${skipped} skipped`}
                    >
                      <span className="habit-cell-day">{formatShort(date)}</span>
                      <span className="habit-cell-bar">
                        {completed > 0 && <span className="habit-bar-done" style={{ width: `${due ? (completed / due) * 100 : 0}%` }} />}
                        {skipped > 0 && <span className="habit-bar-skipped" style={{ width: `${due ? (skipped / due) * 100 : 0}%` }} />}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
