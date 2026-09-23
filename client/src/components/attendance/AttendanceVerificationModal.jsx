import { useCallback, useEffect, useRef, useState } from 'react'
import {
    AlertCircleIcon,
    CameraIcon,
    CameraOffIcon,
    CheckIcon,
    EyeIcon,
    KeyRoundIcon,
    Loader2Icon,
    RefreshCwIcon,
    ScanFaceIcon,
    ShieldCheckIcon,
    UserIcon,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import useWebcam from '../../hooks/useWebcam'
import { runLivenessChallenge } from '../../utils/liveness'
import { loadFaceLandmarker, runFaceLivenessChallenge } from '../../utils/faceLiveness'

// Clock-in verification flow.
//
// Privacy contract: the camera is only ever live during the
// "preparing" | "ready" | "checking" stages. It is stopped the instant a frame
// is captured — before the attendance request is even sent — and on every exit
// path (close, cancel, failure, unmount via useWebcam).
//
// Honest framing: this is face DETECTION plus a presence challenge (is a live
// person at the camera), not facial identity recognition. Identity comes from
// the EMS login. Detection runs entirely in the browser.

const STAGE_SUBTITLE = {
    intro: "Confirm your presence before we record your attendance",
    preparing: "Preparing camera...",
    ready: "Camera ready",
    checking: "Verification in progress...",
    submitting: "Recording attendance...",
    success: "Verification successful",
    "camera-error": "We couldn't use your camera",
}

// Per-gate failure copy. The old flow had a single catch-all message that gave
// the employee no idea which step they'd missed.
const FAILURE_COPY = {
    no_face: "We couldn't find your face in the frame. Move into the oval, check the room isn't too dark, then try again.",
    no_blink: "We found your face but didn't see you blink. Look at the camera and blink clearly, then try again.",
    no_turn: "Almost there — we didn't catch the head turn. Turn your head slowly to one side, then try again.",
    motion: "We couldn't confirm a live person. Look at the camera, blink, and turn your head slightly, then try again.",
}

const EMPTY_GATES = { faceFound: false, blinked: false, turned: false }

const GATE_ROWS = [
    { key: "faceFound", label: "Face detected", Icon: UserIcon },
    { key: "blinked", label: "Blink", Icon: EyeIcon },
    { key: "turned", label: "Turn your head", Icon: ScanFaceIcon },
]

const AttendanceVerificationModal = ({ open, onClose, onSuccess }) => {
    const { videoRef, error: camError, start, stop, capture } = useWebcam()

    const [stage, setStage] = useState("intro")
    const [progress, setProgress] = useState(0)
    const [gates, setGates] = useState(EMPTY_GATES)
    const [failure, setFailure] = useState(null)
    const [sessionInfo, setSessionInfo] = useState(null)
    const [sessionCode, setSessionCode] = useState("")
    const closeTimer = useRef(null)
    // Mirrors `gates` so the per-frame progress callback can diff against the
    // current value without re-rendering on every single animation frame.
    const gatesRef = useRef(EMPTY_GATES)
    // Tracks whether the modal is still open, so anything awaiting (liveness,
    // network) can bail out instead of writing state into a closed modal.
    const openRef = useRef(open)
    useEffect(() => { openRef.current = open }, [open])

    const codeRequired = !!sessionInfo?.active

    const resetState = useCallback(() => {
        setStage("intro")
        setProgress(0)
        setGates(EMPTY_GATES)
        gatesRef.current = EMPTY_GATES
        setFailure(null)
    }, [])

    const handleClose = useCallback(() => {
        stop()
        resetState()
        onClose?.()
    }, [stop, resetState, onClose])

    // Is an employer session running? If so the employee must supply its code.
    const loadSession = useCallback(async () => {
        try {
            const { data } = await api.get("/attendance/session/current")
            setSessionInfo(data)
            return data
        } catch {
            setSessionInfo(null)
            return null
        }
    }, [])

    useEffect(() => {
        if (!open) return
        resetState()
        setSessionCode("")
        loadSession()
        // Warm the face model while the employee is still reading the intro and
        // typing the code, so the challenge itself starts instantly. Failure is
        // fine here — runVerification falls back to the motion check.
        loadFaceLandmarker().catch(() => {})
    }, [open, resetState, loadSession])

    // The <video> must already be in the DOM when getUserMedia resolves, so the
    // camera starts one render AFTER we enter "preparing".
    useEffect(() => {
        if (stage !== "preparing") return
        let cancelled = false
        start().then((ok) => {
            if (cancelled) {
                stop() // modal was closed mid-request — don't leave a live stream
                return
            }
            setStage(ok ? "ready" : "camera-error")
        })
        return () => { cancelled = true }
    }, [stage, start, stop])

    useEffect(() => () => clearTimeout(closeTimer.current), [])

    const handleStart = () => {
        if (codeRequired && !sessionCode.trim()) {
            setFailure("Enter the attendance code your employer is showing.")
            return
        }
        setFailure(null)
        setStage("preparing")
    }

    // The face loop runs on requestAnimationFrame, so this fires ~60x/sec.
    // Both updates are change-gated to keep React out of that hot path.
    const handleProgress = useCallback((update) => {
        // 50 discrete steps is smoother than the eye can follow on a progress bar.
        const stepped = Math.round((update.progress ?? 0) * 50) / 50
        setProgress((current) => (current === stepped ? current : stepped))

        if (!("faceFound" in update)) return
        const prev = gatesRef.current
        if (
            update.faceFound !== prev.faceFound ||
            update.blinked !== prev.blinked ||
            update.turned !== prev.turned
        ) {
            const next = {
                faceFound: update.faceFound,
                blinked: update.blinked,
                turned: update.turned,
            }
            gatesRef.current = next
            setGates(next)
        }
    }, [])

    const runVerification = async () => {
        setFailure(null)
        setProgress(0)
        setGates(EMPTY_GATES)
        gatesRef.current = EMPTY_GATES
        setStage("checking")

        const isCancelled = () => !openRef.current
        let result

        try {
            result = await runFaceLivenessChallenge(videoRef.current, {
                onProgress: handleProgress,
                isCancelled,
            })
        } catch {
            // Model couldn't load or run (old browser, WASM blocked, offline).
            // Degrade to the motion check rather than locking the employee out;
            // the record is flagged so the employer can see which mode ran.
            result = await runLivenessChallenge(videoRef.current, {
                onProgress: handleProgress,
                isCancelled,
            })
        }

        // Abandoned mid-check (backdrop click, navigation): make sure the
        // camera is off and touch nothing else.
        if (!openRef.current) {
            stop()
            return
        }

        if (!result.passed) {
            setStage("ready")
            setFailure(FAILURE_COPY[result.reason] || FAILURE_COPY.motion)
            return
        }

        // One frame from the live stream, then the camera goes off immediately —
        // nothing past this point needs it. 480px/0.8 lands around 40–60 KB,
        // well under the server's 500 KB cap but still legible to an employer.
        const image = capture(480, 0.8)
        stop()

        if (!image) {
            setStage("camera-error")
            return
        }

        setStage("submitting")
        try {
            // Single-use nonce requested as late as possible, so the window
            // between issuing it and using it stays tiny.
            const { data: challenge } = await api.post("/attendance/verify/challenge")

            await api.post("/attendance", {
                nonce: challenge.nonce,
                image,
                sessionCode: sessionCode.trim() || undefined,
                verificationMode: result.mode,
            })

            // Attendance is recorded either way — if the employee closed the
            // modal while it was in flight, still refresh the page behind it.
            if (!openRef.current) {
                onSuccess?.()
                return
            }

            setStage("success")
            toast.success("Attendance recorded")
            closeTimer.current = setTimeout(() => {
                onSuccess?.()
                handleClose()
            }, 1300)
        } catch (error) {
            // Never claim success on a failed request (Step 18).
            const message =
                error.response?.data?.error || error?.message || "Could not record attendance."
            if (!openRef.current) return
            setStage("intro")
            setFailure(message)
            // The employer may have started/stopped a session mid-flow.
            loadSession()
            if (error.response?.status === 409) onSuccess?.()
        }
    }

    if (!open) return null

    const showVideo = stage === "preparing" || stage === "ready" || stage === "checking"
    // Don't let a stray backdrop click abandon a verification that is mid-flight.
    const dismissable = stage !== "checking" && stage !== "submitting"

    // What the person should be doing right now — the next unmet gate.
    const activeHint = !gates.faceFound
        ? "Position your face inside the oval."
        : !gates.blinked
            ? "Now blink."
            : !gates.turned
                ? "Now turn your head slowly to one side."
                : "All set!"

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div
                onClick={dismissable ? handleClose : undefined}
                className='absolute inset-0 bg-black/40 backdrop-blur-sm'
            />

            <div
                className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className='flex items-center justify-between p-6 pb-0'>
                    <div>
                        <h2 className='text-lg font-semibold text-slate-900 flex items-center gap-2'>
                            <ShieldCheckIcon className='w-5 h-5 text-slate-400' />
                            Attendance Verification
                        </h2>
                        <p className='text-sm text-slate-400 mt-0.5'>{STAGE_SUBTITLE[stage]}</p>
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={!dismissable}
                        className='p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6 space-y-5'>
                    {failure && (
                        <div className='p-3 rounded-xl text-sm flex items-start gap-3 bg-rose-50 text-rose-700 border border-rose-200'>
                            <AlertCircleIcon className='w-4 h-4 mt-0.5 shrink-0' />
                            <span>{failure}</span>
                        </div>
                    )}

                    {/* ---------- Camera error ---------- */}
                    {stage === "camera-error" && (
                        <>
                            <div className='flex flex-col items-center text-center py-6 px-4 rounded-xl bg-slate-50 border border-slate-200'>
                                <CameraOffIcon className='w-8 h-8 text-slate-400' />
                                <p className='text-sm font-medium text-slate-900 mt-3'>
                                    {camError?.message || "We couldn't access your camera."}
                                </p>

                                {camError?.kind === "denied" ? (
                                    <p className='text-xs text-slate-500 mt-2 leading-relaxed'>
                                        Camera access is required for attendance verification. Allow
                                        camera access for this site in your browser settings, then try
                                        again.
                                    </p>
                                ) : (
                                    <ul className='text-xs text-slate-500 mt-2 space-y-1 text-left'>
                                        <li>• Check that your webcam is connected</li>
                                        <li>• Close any other app that is using it</li>
                                        <li>• Make sure browser camera permission is enabled</li>
                                    </ul>
                                )}
                            </div>

                            <div className='flex gap-3'>
                                <button onClick={handleClose} className='btn-secondary flex-1'>
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setStage("preparing")}
                                    className='btn-primary flex-1 flex items-center justify-center gap-2'
                                >
                                    <RefreshCwIcon className='w-4 h-4' />
                                    Try again
                                </button>
                            </div>
                        </>
                    )}

                    {/* ---------- Intro ---------- */}
                    {stage === "intro" && (
                        <>
                            <p className='text-sm text-slate-500 leading-relaxed'>
                                We need to verify your presence before recording your attendance.
                                Your camera turns on for a few seconds and stops as soon as
                                verification finishes.
                            </p>

                            {codeRequired && (
                                <div>
                                    <label className='flex items-center gap-2 text-sm font-medium text-slate-700 mb-2'>
                                        <KeyRoundIcon className='w-4 h-4 text-slate-400' />
                                        Attendance Code
                                    </label>
                                    <input
                                        value={sessionCode}
                                        onChange={(e) =>
                                            setSessionCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                        }
                                        inputMode='numeric'
                                        autoComplete='off'
                                        placeholder='e.g. 4829'
                                        className='font-mono tracking-[0.3em] text-center text-lg'
                                    />
                                    <p className='text-xs text-slate-500 mt-2'>
                                        Your employer is displaying this code. It expires
                                        automatically.
                                    </p>
                                </div>
                            )}

                            <div className='flex gap-3 pt-1'>
                                <button onClick={handleClose} className='btn-secondary flex-1'>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStart}
                                    className='btn-primary flex-1 flex items-center justify-center gap-2'
                                >
                                    <CameraIcon className='w-4 h-4' />
                                    Start camera
                                </button>
                            </div>
                        </>
                    )}

                    {/* ---------- Live camera ---------- */}
                    {showVideo && (
                        <>
                            <div className='relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/3]'>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className='w-full h-full object-cover -scale-x-100'
                                />

                                {/* face guide + vignette */}
                                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                                    <div
                                        className={`w-36 h-48 rounded-[50%] border-2 transition-colors duration-300 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)] ${
                                            stage !== "checking"
                                                ? "border-white/70"
                                                : gates.faceFound
                                                    ? "border-emerald-400"
                                                    : "border-navy-400"
                                        }`}
                                    />
                                </div>

                                {stage === "preparing" && (
                                    <div className='absolute inset-0 flex items-center justify-center bg-slate-900'>
                                        <div className='flex items-center gap-2 text-slate-300 text-sm'>
                                            <Loader2Icon className='w-4 h-4 animate-spin' />
                                            Preparing camera...
                                        </div>
                                    </div>
                                )}

                                {/* honest "camera is on" indicator */}
                                {stage !== "preparing" && (
                                    <div className='absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50 text-white text-[11px] font-medium'>
                                        <span className='w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse' />
                                        Camera on
                                    </div>
                                )}

                                {stage === "checking" && (
                                    <div className='absolute left-0 right-0 bottom-0 h-1 bg-white/20'>
                                        <div
                                            className='h-full bg-navy-400 transition-all duration-150'
                                            style={{ width: `${Math.round(progress * 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Live gate checklist — tells the employee exactly which
                                step they're on instead of a single opaque bar. */}
                            {stage === "checking" && (
                                <div className='space-y-2'>
                                    {GATE_ROWS.map(({ key, label, Icon }) => {
                                        const done = gates[key]
                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center gap-2.5 text-sm transition-colors duration-300 ${
                                                    done ? "text-emerald-600" : "text-slate-400"
                                                }`}
                                            >
                                                <span
                                                    className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors duration-300 ${
                                                        done ? "bg-emerald-100" : "bg-slate-100"
                                                    }`}
                                                >
                                                    {done ? (
                                                        <CheckIcon className='w-3.5 h-3.5' />
                                                    ) : (
                                                        <Icon className='w-3.5 h-3.5' />
                                                    )}
                                                </span>
                                                <span className={done ? "font-medium" : ""}>{label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <p className='text-sm text-center text-slate-500'>
                                {stage === "checking"
                                    ? activeHint
                                    : "Position your face inside the frame."}
                            </p>

                            <div className='flex gap-3'>
                                <button
                                    onClick={handleClose}
                                    disabled={stage === "checking"}
                                    className='btn-secondary flex-1 disabled:opacity-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={runVerification}
                                    disabled={stage !== "ready"}
                                    className='btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60'
                                >
                                    {stage === "checking" ? (
                                        <>
                                            <Loader2Icon className='w-4 h-4 animate-spin' />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheckIcon className='w-4 h-4' />
                                            Verify Presence
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ---------- Submitting ---------- */}
                    {stage === "submitting" && (
                        <div className='flex flex-col items-center text-center py-10 rounded-xl bg-slate-50 border border-slate-200'>
                            <Loader2Icon className='w-7 h-7 text-navy-500 animate-spin' />
                            <p className='text-sm font-medium text-slate-900 mt-3'>
                                Recording attendance...
                            </p>
                            <p className='text-xs text-slate-500 mt-1'>Camera stopped</p>
                        </div>
                    )}

                    {/* ---------- Success ---------- */}
                    {stage === "success" && (
                        <div className='flex flex-col items-center text-center py-10 rounded-xl bg-emerald-50 border border-emerald-200'>
                            <span className='flex items-center justify-center w-11 h-11 rounded-full bg-emerald-100'>
                                <CheckIcon className='w-6 h-6 text-emerald-600' />
                            </span>
                            <p className='text-sm font-semibold text-emerald-800 mt-3'>
                                Attendance recorded
                            </p>
                            <p className='text-xs text-emerald-700/80 mt-1'>
                                Verification successful — camera stopped
                            </p>
                        </div>
                    )}

                    {stage !== "success" && (
                        <p className='text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4'>
                            This is face detection, not facial identity recognition. You're already
                            identified by your EMS login — the camera only confirms someone is
                            actually here. Detection runs entirely on your device and no face data
                            leaves it. A single still frame is stored for your employer; no video is
                            recorded.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AttendanceVerificationModal
