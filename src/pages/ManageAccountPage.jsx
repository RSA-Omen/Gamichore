import { NavLink, Outlet } from 'react-router-dom'
import './SectionPage.css'

export default function ManageAccountPage() {
  return (
    <div className="section-page">
      <nav className="section-tabs">
        <NavLink to="/parent/manage-account/kids" end>Kids</NavLink>
        <NavLink to="/parent/manage-account/shop">Manage shop</NavLink>
      </nav>
      <div className="section-content">
        <Outlet />
      </div>
    </div>
  )
}
