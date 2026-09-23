import BrandLogo from './BrandLogo'
import { ACADEMY_NAME_LINE_1, ACADEMY_NAME_LINE_2 } from '../constants/brand'

const LoginLeftSide = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-navy-950 relative overflow-hidden border-r border-slate-200">

      <div className="absolute -top-30 -left-30 w-72 h-72 bg-navy-500/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-start justify-center p-12 lg:p-20 w-full h-full">
        <BrandLogo variant='mark' theme='dark' className='mb-10' />

        <h1 className="text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight tracking-tight">
          {ACADEMY_NAME_LINE_1} <br /> {ACADEMY_NAME_LINE_2}
        </h1>
        <p className="text-navy-200/80 text-lg max-w-md leading-relaxed">
          Staff records, verified attendance, leave and payslips — managed securely in one place.
        </p>
      </div>

    </div>
  )
}

export default LoginLeftSide
