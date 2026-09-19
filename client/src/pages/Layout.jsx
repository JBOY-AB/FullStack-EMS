import { Navigate, Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { useAuth } from "../context/AuthContext"
import Loading from "../components/Loading"
import ChangePasswordModal from "../components/ChangePasswordModal"

const Layout = () => {
  const {user, loading, refreshSession} = useAuth()
  if(loading) return <Loading />
  if(!user) return <Navigate to="/login" />

  // Force the temporary-password change before anything else renders.
  // The app (Outlet) is not mounted until mustChangePassword is cleared.
  if(user.mustChangePassword) {
    return (
      <div className="h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30">
        <ChangePasswordModal forced open onSuccess={refreshSession} />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
            <div className="p-4 pt-16 sm:p-6 sm:pt-6 lg:p-8 max-w-400 mx-auto">
                <Outlet />
            </div>
        </main>
    </div>
  )
}

export default Layout