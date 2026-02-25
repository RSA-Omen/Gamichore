import { NavLink, Outlet } from 'react-router-dom'
import './SectionPage.css'

export default function CompletedTasksPage() {
  return (
    <div className="section-page">
      <nav className="section-tabs">
        <NavLink to="/parent/completed-tasks/approvals" end>Approvals</NavLink>
        <NavLink to="/parent/completed-tasks/mark-done">Mark done</NavLink>
        <NavLink to="/parent/completed-tasks/log">Approval log</NavLink>
      </nav>
      <div className="section-content">
        <Outlet />
      </div>
    </div>
  )
}
