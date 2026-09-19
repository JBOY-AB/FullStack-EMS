import { useEffect, useState } from 'react'
import { AlertCircleIcon, Loader2Icon, ShieldCheckIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../api/axios'

// Admin-only viewer for a stored verification frame (Steps 11–12).
//
// The image is NOT a public URL — it is fetched through the authenticated axios
// instance from an admin-guarded endpoint and held as a short-lived object URL
// that is revoked as soon as the modal closes.
const VerificationImageModal = ({ open, onClose, record }) => {
    const [url, setUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open || !record?.id) return

        let objectUrl = null
        let cancelled = false
        setLoading(true)
        setError(null)

        api
            .get(`/attendance/${record.id}/verification-image`, { responseType: "blob" })
            .then((res) => {
                if (cancelled) return
                objectUrl = URL.createObjectURL(res.data)
                setUrl(objectUrl)
            })
            .catch((err) => {
                if (cancelled) return
                // Error bodies arrive as Blobs on a blob request, so map by status.
                const status = err.response?.status
                setError(
                    status === 404
                        ? "No verification image is stored for this record. It may have passed the retention window."
                        : status === 403
                            ? "You don't have permission to view this image."
                            : "Could not load the verification image."
                )
            })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => {
            cancelled = true
            if (objectUrl) URL.revokeObjectURL(objectUrl)
            setUrl(null)
        }
    }, [open, record?.id])

    if (!open) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div onClick={onClose} className='absolute inset-0 bg-black/40 backdrop-blur-sm' />

            <div
                className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex items-center justify-between p-6 pb-0'>
                    <div>
                        <h2 className='text-lg font-semibold text-slate-900 flex items-center gap-2'>
                            <ShieldCheckIcon className='w-5 h-5 text-slate-400' />
                            Verification
                        </h2>
                        <p className='text-sm text-slate-400 mt-0.5'>
                            {record?.employee?.name || "Employee"}
                            {record?.verifiedAt
                                ? ` — ${format(new Date(record.verifiedAt), "MMM dd, hh:mm a")}`
                                : ""}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className='p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6 space-y-4'>
                    <div className='rounded-xl overflow-hidden bg-slate-900 aspect-[4/3] flex items-center justify-center'>
                        {loading && <Loader2Icon className='w-6 h-6 text-slate-400 animate-spin' />}

                        {!loading && error && (
                            <div className='flex flex-col items-center text-center px-6'>
                                <AlertCircleIcon className='w-7 h-7 text-slate-500' />
                                <p className='text-sm text-slate-300 mt-3'>{error}</p>
                            </div>
                        )}

                        {!loading && !error && url && (
                            <img src={url} alt='Attendance verification frame' className='w-full h-full object-cover' />
                        )}
                    </div>

                    <p className='text-[11px] text-slate-400 leading-relaxed'>
                        Captured once at clock-in as a presence check — not an identity match. Visible
                        to admins only, and removed automatically after the retention window.
                    </p>

                    <div className='flex justify-end'>
                        <button onClick={onClose} className='btn-primary'>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerificationImageModal
