import LoginLeftSide from '../components/LoginLeftSide'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRightIcon, ChevronLeftIcon, ShieldIcon, UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading'
import { ACADEMY_NAME, ACADEMY_TAGLINE } from '../constants/brand'

const LoginLanding = () => {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  // "/" is the public landing page now, so a signed-in user belongs on their
  // dashboard rather than back on the marketing page.
  if (user) return <Navigate to="/dashboard" replace />
  const portaloptions = [
    {
      to: "/login/admin",
      title: "Administration Portal",
      description: "Manage staff records, departments, payroll and system configuration.",
      icon: ShieldIcon
    },
    {
      to: "/login/employee",
      title: "Staff Portal",
      description: "Check in, view your attendance record, request leave and access your payslips.",
      icon: UserIcon
    },

  ]

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <LoginLeftSide />

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto min-h-screen">
        <div className="w-full max-w-md animate-fade-in relative z-10">

          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors mb-6 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40"
            >
              <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
              Back to home
            </Link>
            <p className="eyebrow mb-2">{ACADEMY_TAGLINE}</p>
            <h2 className="text-3xl font-medium text-slate-900 tracking-tight mb-3">Welcome Back</h2>
            <p className="text-slate-500">Select your portal to securely sign in.</p>
          </div>

          {/* portals List */}

          <div className="space-y-4">

            {portaloptions.map((portal) => (
              <Link key={portal.to} to={portal.to} className="group block bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6 transition-all duration-300 hover:border-navy-400 hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40">


                <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-5">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <span className="w-10 h-10 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-navy-200 transition-colors">
                      <portal.icon className="w-[18px] h-[18px] text-slate-500 group-hover:text-navy-700 transition-colors" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg text-slate-800 group-hover:text-navy-700 mb-1 transition-colors">{portal.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{portal.description}</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-navy-700 group-hover:translate-x-1 transition-all duration-300" aria-hidden="true" />
                </div>


              </Link>

            ))}
          </div>

          {/* Footer */}

          <div className="mt-12 text-center md:text-left text-sm text-slate-400">
            <p>© {new Date().getFullYear()} {ACADEMY_NAME}. All rights reserved.</p>
          </div>


        </div>
      </div>
    </div>
  )
}

export default LoginLanding
