import { useNavigate } from 'react-router-dom'
import './RoleChoice.css'

export default function RoleChoice() {
  const navigate = useNavigate()

  return (
    <div className="role-choice">
      <h1 className="role-choice-logo">GamiChore</h1>
      <p className="role-choice-tagline">Earn stars. Do chores. Spend in the shop.</p>
      <div className="role-choice-buttons">
        <button
          type="button"
          className="role-choice-btn role-choice-parent"
          onClick={() => navigate('/parent-auth')}
        >
          I'm a parent
        </button>
        <button
          type="button"
          className="role-choice-btn role-choice-kid"
          onClick={() => navigate('/kid')}
        >
          I'm a kid
        </button>
      </div>
    </div>
  )
}
