import { Link, Outlet } from 'react-router-dom'
import './KidLayout.css'

export default function KidLayout() {
  return (
    <div className="kid-layout">
      <header className="kid-layout-header">
        <span className="kid-layout-logo">GamiChore</span>
        <Link to="/" className="kid-layout-exit">Log out</Link>
      </header>
      <main className="kid-layout-main">
        <Outlet />
      </main>
    </div>
  )
}
