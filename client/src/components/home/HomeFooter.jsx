import { Link } from 'react-router-dom'
import BrandLogo from '../BrandLogo'
import { ACADEMY_NAME } from '../../constants/brand'

const HomeFooter = () => {
    return (
        <footer id='about' className='scroll-mt-20 border-t border-slate-200 bg-white'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14'>
                <div className='grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]'>
                    {/* about */}
                    <div>
                        <BrandLogo variant='full' />

                        <p className='text-sm text-slate-500 mt-4 leading-relaxed max-w-sm'>
                            The staff portal for {ACADEMY_NAME}. It keeps staff records,
                            verified attendance, leave requests and payslips in one place,
                            with role-based access separating what administration and staff
                            can see.
                        </p>
                    </div>

                    {/* product */}
                    <div>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.12rem] text-slate-400'>
                            Portal
                        </p>
                        <ul className='mt-4 space-y-2.5'>
                            {[
                                { label: 'Features', href: '#features' },
                                { label: 'Attendance', href: '#attendance' },
                                { label: 'How It Works', href: '#how-it-works' },
                                { label: 'Security', href: '#security' },
                            ].map((l) => (
                                <li key={l.href}>
                                    <a
                                        href={l.href}
                                        className='text-sm text-slate-500 hover:text-navy-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40 rounded'
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* access */}
                    <div>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.12rem] text-slate-400'>
                            Sign In
                        </p>
                        <ul className='mt-4 space-y-2.5'>
                            <li>
                                <Link
                                    to='/login/admin'
                                    className='text-sm text-slate-500 hover:text-navy-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40 rounded'
                                >
                                    Administration
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/login/employee'
                                    className='text-sm text-slate-500 hover:text-navy-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40 rounded'
                                >
                                    Staff
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className='mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3'>
                    <p className='text-xs text-slate-400'>
                        © {new Date().getFullYear()} {ACADEMY_NAME}. All rights reserved.
                    </p>
                    <p className='text-xs text-slate-400'>
                        Attendance verification confirms presence — it is not facial recognition.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default HomeFooter
