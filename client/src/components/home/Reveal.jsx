import { useEffect, useRef, useState } from 'react'

// Scroll reveal for the landing page sections.
//
// Uses IntersectionObserver rather than an animation library — the app has no
// animation dependency and this doesn't justify adding one. Honours
// prefers-reduced-motion by rendering visible from the first paint, so the
// content is never withheld from someone who has motion turned off.
const Reveal = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null)
    const [shown, setShown] = useState(
        () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    )

    useEffect(() => {
        if (shown) return
        const node = ref.current
        if (!node) return

        if (typeof IntersectionObserver === 'undefined') {
            setShown(true)
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return
                setShown(true)
                observer.disconnect() // reveal once — never animate back out
            },
            { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
        )

        observer.observe(node)
        return () => observer.disconnect()
    }, [shown])

    return (
        <div
            ref={ref}
            style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
            className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
                shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${className}`}
        >
            {children}
        </div>
    )
}

export default Reveal
