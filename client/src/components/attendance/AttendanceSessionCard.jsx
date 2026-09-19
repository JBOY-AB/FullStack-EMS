import { useCallback, useEffect, useState } from 'react'
import { KeyRoundIcon, Loader2Icon, PlayIcon, SquareIcon, TimerIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

// Employer control for the attendance session (Step 2).
//
// The countdown here is DISPLAY ONLY — the backend re-checks `expiresAt` on
// every clock-in, so a tampered timer buys nothing.
const formatRemaining = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000))
    const m = String(Math.floor(total / 60)).padStart(2, "0")
    const s = String(total % 60).padStart(2, "0")
    return `${m}:${s}`
}

const AttendanceSessionCard = () => {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [remaining, setRemaining] = useState(0)

    const load = useCallback(async () => {
        try {
            const { data } = await api.get("/attendance/session/current")
            setSession(data?.active ? data : null)
        } catch {
            setSession(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        if (!session?.expiresAt) {
            setRemaining(0)
            return
        }
        const tick = () => {
            const left = new Date(session.expiresAt).getTime() - Date.now()
            setRemaining(left)
            if (left <= 0) setSession(null) // expired — fall back to the inactive card
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [session])

    const startSession = async () => {
        setBusy(true)
        try {
            const { data } = await api.post("/attendance/session/start")
            setSession({ active: true, code: data.session.code, expiresAt: data.session.expiresAt })
        } catch (error) {
            toast.error(error.response?.data?.error || error?.message)
        } finally {
            setBusy(false)
        }
    }

    const stopSession = async () => {
        setBusy(true)
        try {
            await api.post("/attendance/session/stop")
            setSession(null)
            toast.success("Attendance session ended")
        } catch (error) {
            toast.error(error.response?.data?.error || error?.message)
        } finally {
            setBusy(false)
        }
    }

    const isActive = !!session?.active && remaining > 0

    return (
        <div className='card p-5 sm:p-6 mb-6 relative overflow-hidden group'>
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-colors duration-200 ${
                isActive ? "bg-emerald-500/70" : "bg-slate-500/70"
            }`} />

            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5'>
                <div>
                    <div className='flex items-center gap-2'>
                        <KeyRoundIcon className='w-4 h-4 text-slate-400' />
                        <h3 className='font-semibold text-slate-900'>Attendance Session</h3>
                    </div>

                    <div className='flex items-center gap-2 mt-1.5'>
                        <span className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                        }`} />
                        <p className='text-sm text-slate-500'>
                            {loading
                                ? "Checking..."
                                : isActive
                                    ? "Active — share the code with your team"
                                    : "Inactive — employees can clock in without a code"}
                        </p>
                    </div>
                </div>

                {isActive ? (
                    <div className='flex items-center gap-5'>
                        <div>
                            <p className='text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
                                Today's Code
                            </p>
                            <p className='font-mono text-3xl font-semibold tracking-[0.25em] text-slate-900 leading-tight'>
                                {session.code}
                            </p>
                        </div>

                        <div>
                            <p className='text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
                                Expires in
                            </p>
                            <p className='font-mono text-xl text-slate-700 flex items-center gap-1.5 leading-tight mt-1'>
                                <TimerIcon className='w-4 h-4 text-slate-400' />
                                {formatRemaining(remaining)}
                            </p>
                        </div>

                        <button
                            onClick={stopSession}
                            disabled={busy}
                            className='btn-secondary flex items-center gap-2 shrink-0 disabled:opacity-60'
                        >
                            {busy ? <Loader2Icon className='w-4 h-4 animate-spin' /> : <SquareIcon className='w-4 h-4' />}
                            End
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={startSession}
                        disabled={busy || loading}
                        className='btn-primary flex items-center justify-center gap-2 shrink-0 disabled:opacity-60'
                    >
                        {busy ? <Loader2Icon className='w-4 h-4 animate-spin' /> : <PlayIcon className='w-4 h-4' />}
                        Start Session
                    </button>
                )}
            </div>
        </div>
    )
}

export default AttendanceSessionCard
