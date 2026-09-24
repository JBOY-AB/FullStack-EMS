import { Building2Icon, CalendarCheckIcon, FileTextIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react'
import { ACADEMY_NAME } from '../../constants/brand'

// A native UI mockup of the real admin dashboard — same stat cards, same badge
// styles, same table treatment as the signed-in app. Deliberately not a stock
// photo, and deliberately built only from things the product actually shows:
// headcount, departments, today's attendance, pending leaves, and the webcam
// verification badge. (There is no break tracking in this EMS, so none is shown.)

const STATS = [
    { icon: UsersIcon, label: 'Team Members', value: '42' },
    { icon: Building2Icon, label: 'Departments', value: '6' },
    { icon: CalendarCheckIcon, label: "Today's Attendance", value: '35' },
    { icon: FileTextIcon, label: 'Pending Leaves', value: '3' },
]

const ROWS = [
    { name: 'John Doe', dept: 'Engineering', time: '08:03 AM', status: 'PRESENT', verified: true },
    { name: 'Sarah Smith', dept: 'Finance', time: '08:07 AM', status: 'PRESENT', verified: true },
    { name: 'David Brown', dept: 'Operations', time: '09:14 AM', status: 'LATE', verified: true },
    { name: 'Amara Okoye', dept: 'Human Resources', time: '08:22 AM', status: 'PRESENT', verified: false },
]

const DashboardMockup = () => {
    return (
        <div
            role='img'
            aria-label={`Illustration of the ${ACADEMY_NAME} admin dashboard, showing staff headcount, departments, today’s attendance and pending leaves above a table of today’s check-ins with their verification status.`}
            className='relative'
        >
            {/* soft glow behind the panel */}
            <div
                aria-hidden='true'
                className='absolute -inset-6 bg-linear-to-tr from-navy-500/12 via-gold-400/8 to-transparent blur-2xl rounded-[2rem]'
            />

            <div className='relative card shadow-2xl shadow-slate-900/10 overflow-hidden'>
                {/* window chrome */}
                <div className='flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/70'>
                    <span className='w-2.5 h-2.5 rounded-full bg-rose-300' />
                    <span className='w-2.5 h-2.5 rounded-full bg-amber-300' />
                    <span className='w-2.5 h-2.5 rounded-full bg-emerald-300' />
                    <p className='ml-2 text-[11px] font-medium text-slate-400'>Academy — Dashboard</p>
                </div>

                <div className='p-4 sm:p-5'>
                    {/* stat cards */}
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3'>
                        {STATS.map((s) => (
                            <div
                                key={s.label}
                                className='relative overflow-hidden rounded-lg border border-slate-200/70 bg-white p-3'
                            >
                                <div className='absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-navy-500/60' />
                                <s.icon className='w-4 h-4 text-slate-400' />
                                <p className='text-xl font-semibold text-slate-900 mt-1.5 leading-none'>
                                    {s.value}
                                </p>
                                <p className='text-[11px] text-slate-500 mt-1 truncate'>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* today's attendance */}
                    <div className='mt-4 rounded-lg border border-slate-200/70 overflow-hidden'>
                        <div className='px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between'>
                            <p className='text-[11px] font-semibold uppercase tracking-wider text-slate-500'>
                                Today's Attendance
                            </p>
                            <p className='text-[11px] text-slate-400'>3 webcam verified</p>
                        </div>

                        <div className='divide-y divide-slate-100'>
                            {ROWS.map((row) => (
                                <div
                                    key={row.name}
                                    className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/50 transition-colors'
                                >
                                    <span className='w-7 h-7 shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-[11px] font-semibold text-slate-500'>
                                        {row.name.charAt(0)}
                                    </span>

                                    <div className='min-w-0 flex-1'>
                                        <p className='text-[13px] font-medium text-slate-800 truncate leading-tight'>
                                            {row.name}
                                        </p>
                                        <p className='text-[11px] text-slate-400 truncate'>{row.dept}</p>
                                    </div>

                                    {row.verified && (
                                        <span className='hidden sm:inline-flex badge badge-success items-center gap-1 text-[10px] px-1.5 py-0.5'>
                                            <ShieldCheckIcon className='w-3 h-3' />
                                            Verified
                                        </span>
                                    )}

                                    <span
                                        className={`badge text-[10px] px-1.5 py-0.5 ${
                                            row.status === 'PRESENT' ? 'badge-success' : 'badge-warning'
                                        }`}
                                    >
                                        {row.status}
                                    </span>

                                    <span className='text-[11px] text-slate-500 tabular-nums w-[62px] text-right shrink-0'>
                                        {row.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardMockup
