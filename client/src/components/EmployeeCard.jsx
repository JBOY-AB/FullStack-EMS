import { PencilIcon, Trash2Icon } from 'lucide-react'
import React from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const EmployeeCard = ({ employee, onDelete, onEdit }) => {

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this team member?")) return
    try {
      await api.delete(`/employees/${employee.id}`)
      toast.success("Team member removed")
      onDelete()
    } catch (error) {
      toast.error(error.response?.data?.error || error.message)
    }
  }

  return (
    <div className='group relative card card-hover overflow-hidden rounded-2xl'>
      {/* Top gradient + circle */}
      <div className='relative aspect-4/3 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50'>
        <div className='w-full h-full flex items-center justify-center'>
          {/* circle icon */}
          <div className='w-20 h-20 rounded-full bg-gradient-to-br from-navy-100 to-slate-100 flex items-center justify-center shadow-md'>
            <span className='text-2xl font-medium text-navy-400'>
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Department badge */}
      <div className='absolute top-3 left-3 flex gap-2'>
        <span className='bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-600 rounded-lg shadow-sm'>
          {employee.department || "Remote"}
        </span>
      </div>

      {/* Hover action buttons */}
      <div className='absolute inset-0 bg-gradient-to-t from-navy-700/20 via-transparent to-transparent opacity-0
        group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 gap-3'>
        <button
          onClick={() => onEdit(employee)}
          className='transition-all hover:scale-105 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg'
        >
          <PencilIcon className='w-4 h-4 text-slate-700' />
        </button>
        <button
          onClick={handleDelete}
          className='p-2.5 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600 rounded-xl shadow-lg transition-all hover:scale-105'
        >
          <Trash2Icon className='w-4 h-4' />
        </button>
      </div>

      {/* Name & position */}
      <div className='p-5 text-center'>
        <h3 className='text-slate-900 font-semibold'>
          {employee.firstName} {employee.lastName}
        </h3>
        <p className='text-xs text-slate-500'>{employee.position}</p>
      </div>
    </div>
  )
}

export default EmployeeCard