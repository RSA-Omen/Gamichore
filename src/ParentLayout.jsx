import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useHousehold } from './contexts/HouseholdContext'
import './Layout.css'

export default function ParentLayout() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { getPendingCompletions } = useHousehold()
  const pendingCount = getPendingCompletions().length

  function handleLogout() {
    signOut()
    navigate('/')
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <NavLink to="/parent" className="logo">GamiChore</NavLink>
        <nav className="layout-nav">
          <NavLink to="/parent" end>Home</NavLink>
          <NavLink to="/parent/chores">Chores</NavLink>
          <NavLink to="/parent/completed-tasks" className="nav-with-badge">
            Completed tasks
            {pendingCount > 0 && (
              <span className="nav-badge" title={`${pendingCount} awaiting approval`}>
                {pendingCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/parent/manage-account">Manage account</NavLink>
          <NavLink to="/parent/shop">Shop</NavLink>
          <NavLink to="/kid">Kid view</NavLink>
          <NavLink to="/parent/statistics">Statistics</NavLink>
          <NavLink to="/parent/settings">Settings</NavLink>
          <button type="button" className="layout-logout" onClick={handleLogout}>Log out</button>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
