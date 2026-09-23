import { Link } from 'react-router-dom'
import {
    ArrowRightIcon,
    BellIcon,
    CalendarCheckIcon,
    CameraIcon,
    CheckIcon,
    ClockIcon,
    KeyRoundIcon,
    LayoutGridIcon,
    LockIcon,
    LogInIcon,
    LogOutIcon,
    ReceiptIcon,
    ScrollTextIcon,
    ShieldCheckIcon,
    TrendingUpIcon,
    UserCheckIcon,
    UserPlusIcon,
    UsersIcon,
} from 'lucide-react'
import HomeNavbar from '../components/home/HomeNavbar'
import HomeFooter from '../components/home/HomeFooter'
import DashboardMockup from '../components/home/DashboardMockup'
import Reveal from '../components/home/Reveal'
import { ACADEMY_NAME } from '../constants/brand'

// Public landing page for the academy staff portal. Everything described here
// maps to functionality that actually exists in this codebase — no AI, no
// analytics, no biometric identity matching, no break tracking. See the
// Security section note: the webcam step is a presence check, not facial
// recognition.
//
// Page title / description / og tags live in client/index.html.

const FEATURES = [
    {
        icon: UsersIcon,
        title: 'Staff Records',
        body: 'Create staff accounts, assign departments and job titles, update records, and deactivate people who leave the academy.',
    },
    {
        icon: ClockIcon,
        title: 'Attendance',
        body: 'Verified clock-ins and clock-outs, with working hours and day type calculated and stored automatically.',
    },
    {
        icon: ReceiptIcon,
        title: 'Leave & Payslips',
        body: 'Staff request leave and open their payslips. Administrators review requests and generate payslips for printing.',
    },
    {
        icon: LayoutGridIcon,
        title: 'Staff Overview',
        body: 'Dashboards show headcount, departments, who has checked in today, and requests still waiting on a decision.',
    },
]

const ATTENDANCE_STEPS = [
    {
        icon: KeyRoundIcon,
        title: 'Start attendance',
        body: 'An administrator opens an attendance session. A short code appears on their dashboard and expires on its own.',
    },
    {
        icon: CameraIcon,
        title: 'Verify presence',
        body: 'The staff member starts the check themselves and grants camera access. A few seconds of live video confirm a real person is there.',
    },
    {
        icon: UserCheckIcon,
        title: 'Clock in',
        body: 'The camera switches off before anything is sent. The server validates the attempt and records the check-in with a single still frame.',
    },
    {
        icon: ClockIcon,
        title: 'Work',
        body: 'Nothing stays on. There is no camera, no tracking and no monitoring during the day — just an open attendance record.',
    },
    {
        icon: LogOutIcon,
        title: 'Clock out',
        body: 'One click ends the day. Working hours and day type are calculated and saved to the staff member’s history.',
    },
]

const SECURITY = [
    {
        icon: LockIcon,
        title: 'Hashed passwords',
        body: 'Passwords are hashed with bcrypt before they are stored. Plain-text passwords are never saved.',
    },
    {
        icon: ShieldCheckIcon,
        title: 'Role-based access',
        body: 'Administration and staff accounts see different data. Admin-only endpoints reject staff tokens outright.',
    },
    {
        icon: KeyRoundIcon,
        title: 'Temporary passwords',
        body: 'New staff are issued a one-time password and must set their own before the portal will load for them.',
    },
    {
        icon: CameraIcon,
        title: 'Verified clock-ins',
        body: 'Each check-in needs a single-use, short-lived challenge from the server, so a captured request cannot be replayed.',
    },
    {
        icon: ScrollTextIcon,
        title: 'Verification audit trail',
        body: 'Successful and failed verification attempts are logged with a reason, so attendance disputes can be reviewed.',
    },
    {
        icon: CalendarCheckIcon,
        title: 'Protected verification images',
        body: 'Capture frames are never public. Only admins can open them, and they are cleared automatically after the retention window.',
    },
]

const ADMIN_POINTS = [
    'Add staff and issue temporary passwords',
    'Manage accounts, departments and employment status',
    'Open and close attendance sessions',
    'Review today’s check-ins and verification status',
    'Approve or decline leave requests',
    'Generate payslips and print them',
]

const STAFF_POINTS = [
    'Sign in securely to your own account',
    'Verify your presence and clock in',
    'Clock out and see your working hours',
    'Request leave and follow its status',
    'Open and print your payslips',
    'Keep your profile details up to date',
]

const HOW_IT_WORKS = [
    {
        icon: UserPlusIcon,
        title: 'Add your staff',
        body: 'Add staff, set their department and role, and the portal issues each one a temporary password.',
    },
    {
        icon: LogInIcon,
        title: 'Staff get secure access',
        body: 'They sign in with that password and are required to replace it before anything else opens.',
    },
    {
        icon: CalendarCheckIcon,
        title: 'Track attendance',
        body: 'Verified clock-ins and clock-outs build an accurate daily record for every staff member.',
    },
    {
        icon: TrendingUpIcon,
        title: 'Manage from one dashboard',
        body: 'Attendance, leave and payslips all stay in one place, split by what each role should see.',
    },
]

const SectionHeading = ({ eyebrow, title, body }) => (
    <div className='max-w-2xl'>
        {eyebrow && <p className='eyebrow'>{eyebrow}</p>}
        <h2 className='text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight mt-3'>
            {title}
        </h2>
        {body && <p className='text-slate-500 mt-3 leading-relaxed'>{body}</p>}
    </div>
)

const Home = () => {
    return (
        <div className='min-h-screen bg-white overflow-x-hidden'>
            <HomeNavbar />

            {/* ================= HERO ================= */}
            <section id='top' className='relative scroll-mt-20'>
                {/* background wash */}
                <div aria-hidden='true' className='absolute inset-0 -z-10 overflow-hidden'>
                    <div className='absolute -top-40 -right-32 w-[34rem] h-[34rem] bg-navy-500/10 rounded-full blur-3xl' />
                    <div className='absolute -top-24 -left-40 w-[28rem] h-[28rem] bg-gold-400/10 rounded-full blur-3xl' />
                </div>

                <div className='max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24'>
                    <div className='grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14'>
                        <div className='animate-fade-in'>
                            <span className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-700 text-xs font-medium ring-1 ring-navy-600/10'>
                                <ShieldCheckIcon className='w-3.5 h-3.5' aria-hidden='true' />
                                Verified attendance, built in
                            </span>

                            <h1 className='text-3xl sm:text-4xl lg:text-[2.75rem] font-medium text-slate-900 tracking-tight leading-[1.15] mt-5'>
                                The staff portal for
                                <span className='block text-navy-700'>{ACADEMY_NAME}</span>
                            </h1>

                            <p className='text-base sm:text-lg text-slate-500 mt-5 leading-relaxed max-w-xl'>
                                Onboard staff, verify attendance, handle leave and issue payslips —
                                from one secure dashboard, with administration and staff each seeing
                                only what they should.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-3 mt-8'>
                                <Link
                                    to='/login'
                                    className='btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40'
                                >
                                    Sign In
                                    <ArrowRightIcon className='w-4 h-4' aria-hidden='true' />
                                </Link>

                                <a
                                    href='#features'
                                    className='btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40'
                                >
                                    Explore Features
                                </a>
                            </div>

                            <ul className='flex flex-wrap items-center gap-x-5 gap-y-2 mt-8'>
                                {['Role-based access', 'Verified clock-ins', 'Hashed passwords'].map(
                                    (item) => (
                                        <li
                                            key={item}
                                            className='flex items-center gap-1.5 text-xs text-slate-500'
                                        >
                                            <CheckIcon
                                                className='w-3.5 h-3.5 text-emerald-500'
                                                aria-hidden='true'
                                            />
                                            {item}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        <Reveal delay={120}>
                            <DashboardMockup />
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ================= WHAT THE EMS DOES ================= */}
            <section id='features' className='scroll-mt-20 py-16 sm:py-20 bg-slate-50/60 border-y border-slate-200/70'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6'>
                    <Reveal>
                        <SectionHeading
                            eyebrow='What it does'
                            title='Everything the academy needs, in one place.'
                            body='Four areas of day-to-day work, handled by the same portal and the same set of accounts.'
                        />
                    </Reveal>

                    <div className='grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-10'>
                        {FEATURES.map((feature, i) => (
                            <Reveal key={feature.title} delay={i * 80}>
                                <div className='card card-hover h-full p-5 sm:p-6 hover:border-navy-200 hover:shadow-lg hover:shadow-slate-900/5'>
                                    <span className='inline-flex w-10 h-10 rounded-lg bg-navy-50 items-center justify-center'>
                                        <feature.icon
                                            className='w-[18px] h-[18px] text-navy-600'
                                            aria-hidden='true'
                                        />
                                    </span>
                                    <h3 className='text-[15px] font-semibold text-slate-900 mt-4'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-sm text-slate-500 mt-2 leading-relaxed'>
                                        {feature.body}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= ATTENDANCE ================= */}
            <section id='attendance' className='scroll-mt-20 py-16 sm:py-24'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6'>
                    <Reveal>
                        <SectionHeading
                            eyebrow='Attendance'
                            title='Attendance that is actually verified.'
                            body='Clock-in asks the staff member to confirm they are present before the record is written — and the camera is only on for those few seconds.'
                        />
                    </Reveal>

                    <ol className='mt-12 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-5'>
                        {ATTENDANCE_STEPS.map((step, i) => (
                            <li key={step.title} className='h-full'>
                                <Reveal delay={i * 70} className='h-full'>
                                    <div className='card card-hover h-full p-5 relative overflow-hidden hover:border-navy-200 hover:shadow-lg hover:shadow-slate-900/5'>
                                        <span
                                            aria-hidden='true'
                                            className='absolute top-3 right-4 text-3xl font-semibold text-slate-100 select-none'
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>

                                        <span className='relative inline-flex w-9 h-9 rounded-lg bg-navy-800 items-center justify-center'>
                                            <step.icon className='w-4 h-4 text-white' aria-hidden='true' />
                                        </span>

                                        <h3 className='relative text-[15px] font-semibold text-slate-900 mt-4'>
                                            {step.title}
                                        </h3>
                                        <p className='relative text-sm text-slate-500 mt-2 leading-relaxed'>
                                            {step.body}
                                        </p>
                                    </div>
                                </Reveal>
                            </li>
                        ))}
                    </ol>

                    {/* Honest framing — this matters more than the marketing. */}
                    <Reveal delay={120}>
                        <div className='mt-8 rounded-lg border border-slate-200 bg-slate-50/70 p-5 sm:p-6 flex flex-col sm:flex-row gap-4'>
                            <span className='inline-flex w-10 h-10 shrink-0 rounded-lg bg-white border border-slate-200 items-center justify-center'>
                                <ShieldCheckIcon
                                    className='w-[18px] h-[18px] text-slate-500'
                                    aria-hidden='true'
                                />
                            </span>
                            <div>
                                <h3 className='text-[15px] font-semibold text-slate-900'>
                                    Presence verification — not facial recognition.
                                </h3>
                                <p className='text-sm text-slate-500 mt-2 leading-relaxed'>
                                    The camera check confirms that a live person is at the device. It
                                    does not identify faces and does not match anyone against a
                                    biometric record — identity comes from the staff member’s own
                                    login. The camera is started by the staff member, runs for a few
                                    seconds, and stops before the attendance request is sent. No video
                                    is recorded and nothing runs in the background.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ================= SECURITY ================= */}
            <section id='security' className='scroll-mt-20 py-16 sm:py-24 bg-navy-900'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6'>
                    <Reveal>
                        <div className='max-w-2xl'>
                            <p className='text-[11px] font-semibold uppercase tracking-[0.14rem] text-gold-400'>
                                Security
                            </p>
                            <h2 className='text-2xl sm:text-3xl font-medium text-white tracking-tight mt-3'>
                                Built with the boring safeguards that matter.
                            </h2>
                            <p className='text-navy-200 mt-3 leading-relaxed'>
                                Every item below is implemented in the portal today. Nothing here is a
                                roadmap promise.
                            </p>
                        </div>
                    </Reveal>

                    <div className='grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10'>
                        {SECURITY.map((item, i) => (
                            <Reveal key={item.title} delay={i * 60} className='h-full'>
                                <div className='h-full rounded-lg border border-white/10 bg-white/5 p-5 hover:bg-white/8 hover:border-white/15 transition-colors duration-200'>
                                    <span className='inline-flex w-9 h-9 rounded-lg bg-white/8 items-center justify-center ring-1 ring-gold-400/25'>
                                        <item.icon
                                            className='w-4 h-4 text-gold-400'
                                            aria-hidden='true'
                                        />
                                    </span>
                                    <h3 className='text-[15px] font-semibold text-white mt-4'>
                                        {item.title}
                                    </h3>
                                    <p className='text-sm text-navy-200 mt-2 leading-relaxed'>
                                        {item.body}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= ADMINISTRATION / STAFF ================= */}
            <section id='roles' className='scroll-mt-20 py-16 sm:py-24'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6'>
                    <Reveal>
                        <SectionHeading
                            eyebrow='Two sides, one portal'
                            title='Different views for administration and staff.'
                            body='The same accounts and the same records — but each role only sees the part of the portal that belongs to them.'
                        />
                    </Reveal>

                    <div className='grid gap-5 lg:grid-cols-2 mt-10'>
                        {[
                            {
                                eyebrow: 'For Administration',
                                title: 'Run the academy from a single dashboard.',
                                points: ADMIN_POINTS,
                                to: '/login/admin',
                                cta: 'Administration Login',
                                dark: true,
                            },
                            {
                                eyebrow: 'For Staff',
                                title: 'A simple way to manage your working day.',
                                points: STAFF_POINTS,
                                to: '/login/employee',
                                cta: 'Staff Login',
                                dark: false,
                            },
                        ].map((panel, i) => (
                            <Reveal key={panel.eyebrow} delay={i * 100} className='h-full'>
                                <div
                                    className={`h-full rounded-lg border p-6 sm:p-8 flex flex-col ${
                                        panel.dark
                                            ? 'bg-navy-800 border-navy-700 text-white shadow-lg shadow-navy-900/20'
                                            : 'bg-white border-slate-200/70'
                                    }`}
                                >
                                    <p
                                        className={`text-[11px] font-semibold uppercase tracking-[0.14rem] ${
                                            panel.dark ? 'text-gold-400' : 'text-gold-700'
                                        }`}
                                    >
                                        {panel.eyebrow}
                                    </p>

                                    <h3
                                        className={`text-xl font-medium tracking-tight mt-3 ${
                                            panel.dark ? 'text-white' : 'text-slate-900'
                                        }`}
                                    >
                                        {panel.title}
                                    </h3>

                                    <ul className='space-y-3 mt-6 flex-1'>
                                        {panel.points.map((point) => (
                                            <li key={point} className='flex items-start gap-2.5'>
                                                <CheckIcon
                                                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                                                        panel.dark
                                                            ? 'text-navy-200'
                                                            : 'text-emerald-500'
                                                    }`}
                                                    aria-hidden='true'
                                                />
                                                <span
                                                    className={`text-sm leading-relaxed ${
                                                        panel.dark
                                                            ? 'text-navy-50'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    {point}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to={panel.to}
                                        className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 ${
                                            panel.dark
                                                ? 'bg-white text-navy-800 hover:bg-navy-50 focus-visible:ring-gold-400/60'
                                                : 'bg-navy-800 text-white hover:bg-navy-900 focus-visible:ring-navy-500/40'
                                        }`}
                                    >
                                        {panel.cta}
                                        <ArrowRightIcon className='w-4 h-4' aria-hidden='true' />
                                    </Link>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= HOW IT WORKS ================= */}
            <section
                id='how-it-works'
                className='scroll-mt-20 py-16 sm:py-24 bg-slate-50/60 border-y border-slate-200/70'
            >
                <div className='max-w-6xl mx-auto px-4 sm:px-6'>
                    <Reveal>
                        <SectionHeading
                            eyebrow='How it works'
                            title='From an empty portal to a running academy.'
                        />
                    </Reveal>

                    <div className='relative mt-12'>
                        {/* connecting line, desktop only */}
                        <div
                            aria-hidden='true'
                            className='hidden lg:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-transparent via-slate-300 to-transparent'
                        />

                        <ol className='grid gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 relative'>
                            {HOW_IT_WORKS.map((step, i) => (
                                <Reveal key={step.title} delay={i * 90}>
                                    <li className='list-none text-center lg:text-left'>
                                        <div className='flex justify-center lg:justify-start'>
                                            <span className='relative inline-flex w-10 h-10 rounded-full bg-white border-2 border-gold-400 items-center justify-center text-sm font-semibold text-gold-700 shadow-sm'>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        <h3 className='text-[15px] font-semibold text-slate-900 mt-4 flex items-center gap-2 justify-center lg:justify-start'>
                                            <step.icon
                                                className='w-4 h-4 text-slate-400'
                                                aria-hidden='true'
                                            />
                                            {step.title}
                                        </h3>
                                        <p className='text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto lg:mx-0'>
                                            {step.body}
                                        </p>
                                    </li>
                                </Reveal>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* ================= CALL TO ACTION ================= */}
            <section className='py-16 sm:py-24'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6'>
                    <Reveal>
                        <div className='relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-12 sm:px-12 sm:py-16 text-center'>
                            <div
                                aria-hidden='true'
                                className='absolute -top-24 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-navy-500/25 rounded-full blur-3xl'
                            />
                            <div
                                aria-hidden='true'
                                className='absolute -bottom-32 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] bg-gold-500/12 rounded-full blur-3xl'
                            />

                            <div className='relative'>
                                <h2 className='text-2xl sm:text-3xl font-medium text-white tracking-tight'>
                                    One portal for the whole academy.
                                </h2>
                                <p className='text-navy-200 mt-3 max-w-lg mx-auto leading-relaxed'>
                                    Sign in to record verified attendance, request leave and open your
                                    payslips.
                                </p>

                                <div className='flex flex-col sm:flex-row gap-3 justify-center mt-8'>
                                    <Link
                                        to='/login'
                                        className='inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium bg-white text-navy-800 hover:bg-navy-50 transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60'
                                    >
                                        Sign In
                                        <ArrowRightIcon className='w-4 h-4' aria-hidden='true' />
                                    </Link>

                                    <a
                                        href='#features'
                                        className='inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-navy-100 border border-white/15 hover:bg-white/5 hover:border-white/25 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50'
                                    >
                                        See what's included
                                    </a>
                                </div>

                                <p className='text-xs text-navy-300 mt-6 flex items-center justify-center gap-1.5'>
                                    <BellIcon className='w-3.5 h-3.5' aria-hidden='true' />
                                    Staff are emailed their access details when their account is
                                    created.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <HomeFooter />
        </div>
    )
}

export default Home
