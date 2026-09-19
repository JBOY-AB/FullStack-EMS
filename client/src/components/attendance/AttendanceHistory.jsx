import React from 'react'
import { ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react'
import { getDayTypeDisplay, getWorkingHoursDisplay } from '../../assets/assets'
import {format} from 'date-fns'

const AttendanceHistory = ({history}) => {
  return (
    <div className='card overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-100'>
          <h3 className='font-semibold text-slate-900'>Recent Activity</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='table-modern'>
              <thead>
                  <tr>
                    <th className='px-6 py-4'>Date</th>
                    <th className='px-6 py-4'>Check In</th>
                    <th className='px-6 py-4'>Check Out</th>
                    <th className='px-6 py-4'>Working Hours</th>
                    <th className='px-6 py-4'>Day Type</th>
                    <th className='px-6 py-4'>Status</th>
                    <th className='px-6 py-4'>Verification</th>
                  </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='text-center py-12 text-slate-400'>
                      No records found
                    </td>
                  </tr>
                ) :(
                  history.map((record)=>{
                    const dayType = getDayTypeDisplay(record)
                    return (
                      <tr key={record._id || record.id}>
                            <td className='px-6 py-4 font-medium text-slate-900'>
                             {format(new Date(record.date), "MMM dd, yyyy")}
                            </td>

                            <td className='px-6 py-4  text-slate-600'>
                              {record.checkIn ?  format(new Date(record.checkIn), "hh:mm a")
                              : "-"}
                             
                            </td>

                            <td className='px-6 py-4  text-slate-600'>
                              {record.checkOut ?  format(new Date(record.checkOut), "hh:mm a")
                              : "-"}
                             
                            </td>

                            <td className='px-6 py-4  text-slate-600 font-medium'>
                              {getWorkingHoursDisplay(record)}
                            </td>

                              <td className='px-6 py-4'>
                              {dayType.label !== "-" ? <span className={`badge ${dayType.className}`}>{
                                dayType.label}</span> : "-"}
                             </td>

                              <td className='px-6 py-4'>
                               <span className={`badge ${record.status === "PRESENT" ? "badge-success" : record.status
                                === "LATE" ? "badge-warning" : "badge-danger"
                               }`}>
                                  {record.status}
                              </span>
                              </td>

                              <td className='px-6 py-4'>
                                {record.verificationMethod === "webcam" && record.verificationStatus === "verified" ? (
                                  <span className='badge badge-success inline-flex items-center gap-1.5'>
                                    <ShieldCheckIcon className='w-3.5 h-3.5' />
                                    Webcam
                                  </span>
                                ) : record.verificationMethod === "webcam" && record.verificationStatus === "verified_degraded" ? (
                                  <span
                                    title='Face detection was unavailable on this device; presence was confirmed by motion only.'
                                    className='badge bg-amber-100 text-amber-700 inline-flex items-center gap-1.5'
                                  >
                                    <ShieldAlertIcon className='w-3.5 h-3.5' />
                                    Motion
                                  </span>
                                ) : (
                                  <span className='text-slate-400'>—</span>
                                )}
                              </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
          </table>
        </div>
    </div>
  )
}

export default AttendanceHistory