import { CheckIcon, CopyIcon, X } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

const EmployeeCreatedModal = ({ open, onClose, employee, temporaryPassword }) => {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      setCopied(true)
      toast.success("Password copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy — please copy it manually")
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>

      <div
        onClick={onClose}
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
      />

      <div
        className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between p-6 pb-0'>
          <h2 className='text-lg font-semibold text-slate-900 flex items-center gap-2'>
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100'>
              <CheckIcon className='w-4 h-4 text-emerald-600' />
            </span>
            Team Member Created
          </h2>

          <button
            onClick={onClose}
            className='p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-6 space-y-5'>
          <div className='space-y-1 text-sm'>
            {fullName && (
              <p>
                <span className='text-slate-500'>Name: </span>
                <span className='font-medium text-slate-900'>{fullName}</span>
              </p>
            )}
            {employee?.email && (
              <p>
                <span className='text-slate-500'>Email: </span>
                <span className='font-medium text-slate-900'>{employee.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              Temporary Password
            </label>
            <div className='flex items-center gap-2'>
              <code className='flex-1 font-mono text-lg tracking-wide bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 break-all'>
                {temporaryPassword}
              </code>
              <button
                type='button'
                onClick={handleCopy}
                className='btn-secondary flex items-center gap-2 shrink-0'
              >
                <CopyIcon className='w-4 h-4' />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className='text-xs text-slate-500 mt-2'>
              Share this with the team member. They'll be required to change it on
              first login, and it won't be shown again.
            </p>
          </div>

          <div className='flex justify-end pt-2'>
            <button onClick={onClose} className='btn-primary'>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeCreatedModal
