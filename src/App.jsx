import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import RoleChoice from './pages/RoleChoice'
import ParentAuth from './pages/ParentAuth'
import ParentLayout from './ParentLayout'
import KidLayout from './KidLayout'
import Kids from './pages/Kids'
import Chores from './pages/Chores'
import ChoreSets from './pages/ChoreSets'
import ChoresPage from './pages/ChoresPage'
import Approvals from './pages/Approvals'
import ApprovalLog from './pages/ApprovalLog'
import MarkDone from './pages/MarkDone'
import CompletedTasksPage from './pages/CompletedTasksPage'
import ShopAdmin from './pages/ShopAdmin'
import ManageAccountPage from './pages/ManageAccountPage'
import Shop from './pages/Shop'
import Settings from './pages/Settings'
import HabitTracker from './pages/HabitTracker'
import ParentHome from './pages/ParentHome'
import KidView from './pages/KidView'
import { HouseholdProvider } from './contexts/HouseholdContext'
import './App.css'

function App() {
  const [kidId, setKidId] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleChoice />} />
        <Route path="/parent-auth" element={<ParentAuth />} />
        <Route element={<RequireAuth />}>
          <Route element={<HouseholdLayout />}>
            <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<ParentHome />} />
              <Route path="chores" element={<ChoresPage />}>
                <Route index element={<Navigate to="list" replace />} />
                <Route path="list" element={<Chores />} />
                <Route path="sets" element={<ChoreSets />} />
              </Route>
              <Route path="completed-tasks" element={<CompletedTasksPage />}>
                <Route index element={<Navigate to="approvals" replace />} />
                <Route path="approvals" element={<Approvals />} />
                <Route path="mark-done" element={<MarkDone />} />
                <Route path="log" element={<ApprovalLog />} />
              </Route>
              <Route path="manage-account" element={<ManageAccountPage />}>
                <Route index element={<Navigate to="kids" replace />} />
                <Route path="kids" element={<Kids />} />
                <Route path="shop" element={<ShopAdmin />} />
              </Route>
              <Route path="shop" element={<Shop kidId={kidId} setKidId={setKidId} />} />
              <Route path="statistics" element={<HabitTracker />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/kid" element={<KidLayout />}>
              <Route index element={<KidView />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function RequireAuth() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="page">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/parent-auth" replace />
  return <Outlet />
}


function HouseholdLayout() {
  const { householdId } = useAuth()
  if (!householdId) return <div className="page">Loading...</div>
  return (
    <HouseholdProvider householdId={householdId}>
      <Outlet />
    </HouseholdProvider>
  )
}

export default App
