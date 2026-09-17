import { Loader2Icon, LockIcon, X } from 'lucide-react'
import React, { useState } from 'react'
import api from '../api/axios'

const ChangePasswordModal = ({ open, onClose, forced = false, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    // client-side validation
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }
    if (forced && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      // Forced first-login change: no current password (the employee just
      // authenticated with the temporary one). Settings change: verify current.
      const body = forced
        ? { newPassword, confirmPassword }
        : { currentPassword, newPassword };

      const { data } = await api.post("/auth/change-password", body);

      if (data?.error) throw new Error(data.error);

      setMessage({
        type: "success",
        text: "Password updated successfully"
      });

      e.target.reset();
      onSuccess?.();
      if (!forced) onClose?.();

    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>

      <div
        onClick={forced ? undefined : onClose}
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
      />

      <div
        className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between p-6 pb-0'>
          <h2 className='text-lg font-medium text-slate-900 flex items-center gap-2'>
            <LockIcon className='w-5 h-5 text-slate-400' />
            {forced ? "Password Change Required" : "Change Password"}
          </h2>

          {/* Forced flow cannot be dismissed */}
          {!forced && (
            <button
              onClick={onClose}
              className='p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600'
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {forced && (
            <p className='text-sm text-slate-500 leading-relaxed'>
              You're using a temporary password. For security, you must create a
              new password before continuing.
            </p>
          )}

          {message.text && (
            <div className={`p-3 rounded-xl text-sm flex items-start gap-3 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                message.type === "success" ? "bg-emerald-500" : "bg-rose-500"
              }`} />
              {message.text}
            </div>
          )}

          {!forced && (
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Current Password
              </label>
              <input
                type='password'
                name='currentPassword'
                required
                className="w-full border rounded-lg p-2"
              />
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              New Password
            </label>
            <input
              type='password'
              name='newPassword'
              required
              minLength={6}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {forced && (
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Confirm New Password
              </label>
              <input
                type='password'
                name='confirmPassword'
                required
                minLength={6}
                className="w-full border rounded-lg p-2"
              />
            </div>
          )}

          <div className='flex gap-3 pt-2'>
            {!forced && (
              <button
                type='button'
                onClick={onClose}
                className='btn-secondary flex-1'
              >
                cancel
              </button>
            )}

            <button
              type='submit'
              disabled={loading}
              className='btn-primary flex-1 flex items-center justify-center gap-2'
            >
              {loading && <Loader2Icon className='w-4 h-4 animate-spin' />}
              {forced ? "Change Password" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordModal
