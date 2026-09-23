import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, MenuIcon, XIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from '../BrandLogo'

const NAV_LINKS = [
    { label: 'Home', href: '#top' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
    { label: 'About', href: '#about' },
]

const HomeNavbar = () => {
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Don't leave the page scroll-locked behind an open mobile menu.
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    useEffect(() => {
        const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false) }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    // Someone already signed in shouldn't be asked to sign in again.
    const cta = user
        ? { to: '/dashboard', label: 'Go to Dashboard' }
        : { to: '/login', label: 'Sign In' }

    const brand = (
        <Link
            to='/'
            onClick={() => setOpen(false)}
            className='rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40'
        >
            <BrandLogo variant='full' />
        </Link>
    )

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/70'
                    : 'bg-transparent border-b border-transparent'
            }`}
        >
            <nav
                aria-label='Main'
                className='max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4'
            >
                {brand}

                {/* desktop links */}
                <ul className='hidden lg:flex items-center gap-1'>
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className='px-3 py-2 rounded-md text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40'
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className='flex items-center gap-2'>
                    <Link
                        to={cta.to}
                        className='hidden sm:inline-flex btn-primary items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40'
                    >
                        {cta.label}
                        <ArrowRightIcon className='w-4 h-4' aria-hidden='true' />
                    </Link>

                    <button
                        type='button'
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls='mobile-menu'
                        aria-label='Open menu'
                        className='lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40'
                    >
                        <MenuIcon className='w-5 h-5' />
                    </button>
                </div>
            </nav>

            {/* mobile menu */}
            {open && (
                <div className='lg:hidden fixed inset-0 z-50'>
                    <div
                        className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm'
                        onClick={() => setOpen(false)}
                    />

                    <div
                        id='mobile-menu'
                        className='absolute inset-x-0 top-0 bg-white border-b border-slate-200 shadow-xl animate-slide-up'
                    >
                        <div className='px-4 sm:px-6 h-16 flex items-center justify-between'>
                            {brand}
                            <button
                                type='button'
                                onClick={() => setOpen(false)}
                                aria-label='Close menu'
                                className='p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40'
                            >
                                <XIcon className='w-5 h-5' />
                            </button>
                        </div>

                        <ul className='px-3 pb-3 border-t border-slate-100 pt-2'>
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className='block px-3 py-3 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40'
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div className='px-4 pb-5'>
                            <Link
                                to={cta.to}
                                onClick={() => setOpen(false)}
                                className='btn-primary w-full inline-flex items-center justify-center gap-2'
                            >
                                {cta.label}
                                <ArrowRightIcon className='w-4 h-4' aria-hidden='true' />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default HomeNavbar
