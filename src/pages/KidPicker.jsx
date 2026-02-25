import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../contexts/HouseholdContext'
import './KidPicker.css'

export default function KidPicker() {
  const navigate = useNavigate()
  const { kids } = useHousehold()

  if (kids.length === 0) {
    return (
      <div className="kid-picker">
        <h2>Who are you?</h2>
        <p className="kid-picker-empty">No kids yet. Ask a parent to add you.</p>
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="kid-picker">
      <h2>Who are you?</h2>
      <div className="kid-picker-buttons">
        {kids.map((kid) => (
          <button
            key={kid.id}
            type="button"
            className="kid-picker-btn"
            onClick={() => navigate(`/kid?kid=${kid.id}`)}
          >
            <span className="kid-picker-avatar">{kid.avatar || kid.name.charAt(0)}</span>
            {kid.name}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-ghost kid-picker-back" onClick={() => navigate('/')}>
        Back
      </button>
    </div>
  )
}
