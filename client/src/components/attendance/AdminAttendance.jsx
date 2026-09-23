import { useCallback, useEffect, useState } from 'react'
import { CameraIcon, ImageIcon, RefreshCwIcon, ShieldAlertIcon, ShieldCheckIcon, UserCheckIcon } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loading from '../Loading'
import AttendanceSessionCard from './AttendanceSessionCard'
import VerificationImageModal from './VerificationImageModal'

// Employer view of today's attendance (Step 11) — who is in, and whether their
// clock-in was webcam verified.
const VerificationBadge = ({ record }) => {
    if (record.verificationMethod === "webcam" && record.verificationStatus === "verified") {
        return (
            <span className='badge badge-success inline-flex items-center gap-1.5'>
                <ShieldCheckIcon className='w-3.5 h-3.5' />
                Webcam Verified
            </span>
        )
    }
    // The employee's browser couldn't load the face model, so only the weaker
    // motion check ran. Still a valid clock-in — flagged so it can be told apart.
    if (record.verificationMethod === "webcam" && record.verificationStatus === "verified_degraded") {
        return (
            <span
                title='Face detection was unavailable on this device; presence was confirmed by motion only.'
                className='badge bg-amber-100 text-amber-700 inline-flex items-center gap-1.5'
            >
                <ShieldAlertIcon className='w-3.5 h-3.5' />
                Verified (motion only)
            </span>
        )
    }
    if (record.verificationStatus === "failed") {
        return <span className='badge badge-danger'>Verification Failed</span>
    }
    return <span className='badge bg-slate-100 text-slate-600'>Unverified</span>
}

const AdminAttendance = () => {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selected, setSelected] = useState(null)

    const fetchToday = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        try {
            const { data } = await api.get("/attendance/today")
            setRecords(data.data || [])
        } catch (error) {
            toast.error(error.response?.data?.error || error?.message)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => { fetchToday() }, [fetchToday])

    if (loading) return <Loading />

    // Counts BOTH modes: a degraded record is still a verified clock-in, and
    // dropping it here would quietly understate the day's headline number.
    const verifiedCount = records.filter(
        (r) =>
            r.verificationMethod === "webcam" &&
            (r.verificationStatus === "verified" || r.verificationStatus === "verified_degraded")
    ).length

    return (
        <div className='animate-fade-in'>
            <div className='page-header'>
                <h1 className='page-title'>Attendance</h1>
                <p className='page-subtitle'>Today's check-ins and presence verification</p>
            </div>

            <AttendanceSessionCard />

            <div className='card overflow-hidden'>
                <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4'>
                    <div>
                        <h3 className='font-semibold text-slate-900'>Today's Attendance</h3>
                        <p className='text-xs text-slate-500 mt-0.5 flex items-center gap-1.5'>
                            <UserCheckIcon className='w-3.5 h-3.5' />
                            {records.length} checked in — {verifiedCount} webcam verified
                        </p>
                    </div>

                    <button
                        onClick={() => fetchToday(true)}
                        disabled={refreshing}
                        className='btn-secondary flex items-center gap-2 shrink-0 disabled:opacity-60'
                    >
                        <RefreshCwIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                <div className='overflow-x-auto'>
                    <table className='table-modern'>
                        <thead>
                            <tr>
                                <th className='px-6 py-4'>Employee</th>
                                <th className='px-6 py-4'>Department</th>
                                <th className='px-6 py-4'>Clocked In</th>
                                <th className='px-6 py-4'>Clocked Out</th>
                                <th className='px-6 py-4'>Status</th>
                                <th className='px-6 py-4'>Verification</th>
                                <th className='px-6 py-4'></th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className='text-center py-12 text-slate-400'>
                                        No one has clocked in today
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record.id}>
                                        <td className='px-6 py-4 font-medium text-slate-900'>
                                            {record.employee?.name || "—"}
                                        </td>

                                        <td className='px-6 py-4 text-slate-600'>
                                            {record.employee?.department || "—"}
                                        </td>

                                        <td className='px-6 py-4 text-slate-600'>
                                            {record.checkIn ? format(new Date(record.checkIn), "hh:mm a") : "—"}
                                        </td>

                                        <td className='px-6 py-4 text-slate-600'>
                                            {record.checkOut ? format(new Date(record.checkOut), "hh:mm a") : "—"}
                                        </td>

                                        <td className='px-6 py-4'>
                                            <span className={`badge ${
                                                record.status === "PRESENT"
                                                    ? "badge-success"
                                                    : record.status === "LATE"
                                                        ? "badge-warning"
                                                        : "badge-danger"
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>

                                        <td className='px-6 py-4'>
                                            <VerificationBadge record={record} />
                                        </td>

                                        <td className='px-6 py-4 text-right'>
                                            {record.hasVerificationImage ? (
                                                <button
                                                    onClick={() => setSelected(record)}
                                                    className='inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 hover:text-navy-700 transition-colors'
                                                >
                                                    <ImageIcon className='w-3.5 h-3.5' />
                                                    View Verification
                                                </button>
                                            ) : (
                                                <span className='inline-flex items-center gap-1.5 text-xs text-slate-400'>
                                                    <CameraIcon className='w-3.5 h-3.5' />
                                                    No image
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <VerificationImageModal
                open={!!selected}
                record={selected}
                onClose={() => setSelected(null)}
            />
        </div>
    )
}

export default AdminAttendance
