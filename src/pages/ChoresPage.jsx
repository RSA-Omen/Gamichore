import { NavLink, Outlet } from 'react-router-dom'
import './SectionPage.css'

export default function ChoresPage() {
  return (
    <div className="section-page">
      <nav className="section-tabs">
        <NavLink to="/parent/chores/list" end>Chores</NavLink>
        <NavLink to="/parent/chores/sets">Chore sets</NavLink>
      </nav>
      <div className="section-content">
        <Outlet />
      </div>
    </div>
  )
}
