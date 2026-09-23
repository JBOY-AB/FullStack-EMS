import {
    ACADEMY_NAME,
    ACADEMY_NAME_LINE_1,
    ACADEMY_NAME_LINE_2,
} from '../constants/brand'

// Brand colours are duplicated here as literal hex because they go into SVG
// `stroke`/`fill` attributes, which Tailwind utilities can't reach. They match
// --color-navy-700 and --color-gold-400 in index.css — change both together.
const NAVY = '#233a63'
const GOLD = '#e0b429'

// One "P", drawn as a stroked path so the letterform stays even at favicon size.
// Stem runs down the left; the bowl is a half-circle hung off the top.
const P_PATH = 'M 0 23 V 0 H 7.5 A 6.5 6.5 0 0 1 7.5 13 H 0'

/**
 * The academy mark: a rounded navy tile carrying an interlocking gold "PP".
 *
 * The back P is drawn at reduced opacity and the front P is stroked twice —
 * once in the tile colour at a wider width to knock out a gap, then in gold.
 * Without that gap the two letters merge into a blob below ~20px.
 */
const Monogram = ({ className = '', surface = NAVY, mark = GOLD }) => (
    <svg
        viewBox='0 0 48 48'
        className={className}
        aria-hidden='true'
        focusable='false'
    >
        <rect width='48' height='48' rx='11' fill={surface} />
        <g fill='none' strokeWidth='4.5' strokeLinejoin='round'>
            <path d={P_PATH} transform='translate(22 12)' stroke={mark} opacity='0.45' />
            <path d={P_PATH} transform='translate(12 12)' stroke={surface} strokeWidth='8.5' />
            <path d={P_PATH} transform='translate(12 12)' stroke={mark} />
        </g>
    </svg>
)

/**
 * @param {'full'|'compact'|'mark'} variant  How much of the lockup to render.
 * @param {'light'|'dark'} theme             'dark' is for navy surfaces
 *                                           (sidebar, login panel), where a
 *                                           navy tile would vanish.
 */
const BrandLogo = ({
    variant = 'full',
    theme = 'light',
    className = '',
}) => {
    const dark = theme === 'dark'
    const compact = variant === 'compact'

    // On navy the tile is a translucent well rather than another navy square.
    const tile = dark ? (
        <span
            className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} shrink-0 rounded-lg bg-white/10 ring-1 ring-white/15 flex items-center justify-center`}
        >
            <Monogram
                className={compact ? 'w-5 h-5' : 'w-[22px] h-[22px]'}
                surface='transparent'
            />
        </span>
    ) : (
        <Monogram
            className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} shrink-0 rounded-lg shadow-md shadow-navy-900/20`}
        />
    )

    if (variant === 'mark') {
        return (
            <span className={className}>
                {tile}
                <span className='sr-only'>{ACADEMY_NAME}</span>
            </span>
        )
    }

    return (
        <span className={`flex items-center gap-2.5 ${className}`}>
            {tile}
            {/* Marked up as one label so screen readers read the academy's
                name once, not as two orphaned fragments. */}
            <span className='leading-tight min-w-0'>
                <span className='sr-only'>{ACADEMY_NAME}</span>
                <span aria-hidden='true' className='block'>
                    <span
                        className={`block font-semibold tracking-tight truncate ${
                            compact ? 'text-[12px]' : 'text-[14px]'
                        } ${dark ? 'text-white' : 'text-navy-900'}`}
                    >
                        {ACADEMY_NAME_LINE_1}
                    </span>
                    <span
                        className={`block font-medium tracking-wide truncate ${
                            compact ? 'text-[10px]' : 'text-[11px]'
                        } ${dark ? 'text-navy-200/80' : 'text-navy-600'}`}
                    >
                        {ACADEMY_NAME_LINE_2}
                    </span>
                </span>
            </span>
        </span>
    )
}

export default BrandLogo
