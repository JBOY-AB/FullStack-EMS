import { Loader2Icon, LogInIcon, LogOutIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import AttendanceVerificationModal from './AttendanceVerificationModal'

const CheckinButton = ({ todayRecord, onAction }) => {
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [sessionActive, setSessionActive] = useState(false)
    const [sessionLoading, setSessionLoading] = useState(true)

    const isCheckedIn = !!todayRecord?.checkIn;

    const loadSession = async () => {
        try {
            const { data } = await api.get("/attendance/session/current")
            setSessionActive(!!data?.active)
        } catch {
            setSessionActive(false)
        } finally {
            setSessionLoading(false)
        }
    }

    useEffect(() => {
        loadSession()
        const interval = setInterval(loadSession, 15000)
        return () => clearInterval(interval)
    }, [])

    // Clock-out keeps the original one-click behaviour — webcam verification is
    // a clock-in gate only, so nobody has to keep a camera handy all day.
    const handleCheckOut = async () => {
        setLoading(true)
        try {
            await api.post("/attendance")
            onAction()
        } catch (error) {
            toast.error(error.response?.data?.error || error?.message)
        }
        setLoading(false)
    }

    // Clock-in no longer writes the record directly; the verification modal
    // owns the camera → liveness → capture → submit sequence.
    const handleAttendance = () => {
        if (isCheckedIn) return handleCheckOut()
        if (!sessionActive) {
            toast.error("Clock-in is unavailable until an admin starts an attendance session.")
            return
        }
        setVerifying(true)
    }

    if (todayRecord?.checkOut) {
        return (
            <div className='flex flex-col items-center justify-center p-8 bg-slate-50
            rounded-2xl border border-slate-200'>
                <h3 className='text-lg font-bold text-slate-900'>
                    work Day  Completed
                </h3>
                <p className='text-slate-500 text-sm mt-1'>
                    Great Job! See you tomorrow
                </p>
            </div>
        )
    }

    return (
        <>
            <div className='absolute bottom-4 right-4 flex flex-col z-1'>
                <button
                    onClick={handleAttendance}
                    disabled={loading || sessionLoading || (!isCheckedIn && !sessionActive)}
                    className={`w-full max-w-xs flex justify-between items-center gap-8 p-4 rounded-xl bg-linear-to-br text-white ${isCheckedIn
                            ? "from-slate-700 to-slate-900"
                            : "from-navy-600 to-navy-700"
                        }`}
                >
                    {loading ? <Loader2Icon className='size-7 animate-spin' /> : isCheckedIn ?
                        <LogOutIcon className='size-7' /> : <LogInIcon className='size-7' />}

                    <div className='relative flex flex-col items-center text-center' >
                        <h2 className='text-lg font-medium mb-1'>{loading ? "Processing..." : isCheckedIn ? "Clock Out" : "Clock In"}</h2>
                        <p className='text-xs opacity-80'>{isCheckedIn ? "Click to end your shift" : sessionLoading ? "Checking session status" : sessionActive ? "Verify presence to start your work day" : "Waiting for admin to start a session"}</p>
                    </div>
                </button>
            </div>

            <AttendanceVerificationModal
                open={verifying}
                onClose={() => setVerifying(false)}
                onSuccess={onAction}
            />
        </>
    )
}

export default CheckinButton
