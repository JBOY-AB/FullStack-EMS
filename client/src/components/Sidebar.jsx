import { useState } from 'react'
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CalendarIcon,
  ChevronRightIcon,
  DollarSignIcon,
  FileTextIcon,
  LayoutGridIcon,
  Loader2,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { dummyProfileData } from '../assets/assets'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import BrandLogo from './BrandLogo'

const Sidebar = () => {
  const { pathname } = useLocation()
  const [userName, setUserName] = useState('')
  const [mobileopen, setMobileOpen] = useState(false)

  const { user, loading, logout } = useAuth()

  useEffect(() => {
    api.get("/profile").then(({ data }) => {
      if (data.firstName) setUserName(`${data.firstName} ${data.lastName || ""}`.trim());
    })
  }, [])

  // close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const role = user?.role;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGridIcon },
    // Admins manage employees; everyone gets Attendance — employees to clock
    // in/out, admins to run the session and review today's verifications.
    ...(role === 'ADMIN'
      ? [{ name: 'Team', path: '/employees', icon: UserIcon }]
      : []),
    { name: 'Attendance', path: '/attendance', icon: CalendarIcon },
    { name: 'Leave', path: '/leave', icon: FileTextIcon },
    { name: 'Payslips', path: '/payslips', icon: DollarSignIcon },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ]

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const sidebarContent = (
    <>
      {/* Band header */}
      <div className='px-5 pt-6 pb-5 border-b border-white/6'>
        <div className='flex items-center justify-between gap-2'>
          <BrandLogo variant='compact' theme='dark' />

          {/* close menu on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className='lg:hidden text-slate-400 hover:text-white p-1 shrink-0'
          >
            <XIcon size={20} />
          </button>
        </div>
      </div>

      {/* user profile card */}
      {userName && (
        <div className='mx-3 mt-4 mb-1 p-3 rounded-lg bg-white/3 border border-white/4'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center ring-1 ring-white/10 shrink-0'>
              <span className='text-navy-200 text-xs font-semibold'>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className='min-w-0'>
              <p className='text-[13px] font-medium text-slate-200 truncate'>{userName}</p>
              <p className='text-[11px] text-slate-500 truncate'>
                {role === 'ADMIN' ? 'Administrator' : 'Team Member'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section label */}
      <div className='px-5 pt-5 pb-2'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.12rem] text-slate-500'>
          Navigation
        </p>
      </div>

      {/* navigation list */}
      <div className='flex-1 px-3 space-y-0.5 overflow-y-auto'>
        {loading ? (
          <div className='px-3 py-3 flex items-center gap-2 text-slate-500'>
              <Loader2 className='animate-spin w-4 h-4' />
              <span className='text-sm'>Loading...</span>
          </div>
        ) : (

          navItems.map((item) => {
            const isActive = pathname.startsWith(item.path)

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150 relative ${isActive
                    ? 'bg-gold-500/10 text-gold-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/4'
                  }`}
              >
                {isActive && (
                  <div className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gold-500' />
                )}

                <item.icon
                  className={`w-[17px] h-[17px] shrink-0 ${isActive
                      ? 'text-gold-300'
                      : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                />

                <span className='flex-1'>{item.name}</span>

                {isActive && <ChevronRightIcon className='w-3.5 h-3.5 text-gold-500/60' />}
              </Link>
            )
          })

        )}

      </div>

      {/* logout */}
      <div className='p-3 border-t border-white/6'>
        <button onClick={handleLogout} className='flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-rose-400
         hover:bg-rose-500/8 transition-all duration-150'>
          <LogOutIcon className='w-[17px] h-[17px]' />
          <span>
            Log out
          </span>
        </button>
      </div>

    </>
  )

  return (
    <>
      {/* mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className='lg:hidden fixed top-4 left-4 z-50 p-2 bg-navy-900 text-white rounded-lg shadow-lg border border-white/10'
      >
        <MenuIcon size={20} />
      </button>

      {/* mobile overlay */}
      {mobileopen && (
        <div
          className='lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* sidebar desktop */}
      <aside className='hidden lg:flex flex-col h-full w-[260px] bg-linear-to-b from-navy-900 via-navy-900 to-navy-950 text-white shrink-0 border-r border-white/4'>
        {sidebarContent}
      </aside>

      {/* sidebar mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-linear-to-b from-navy-900 via-navy-900 to-navy-950 text-white z-50 flex flex-col transform transition-transform duration-300 ${mobileopen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

export default Sidebar