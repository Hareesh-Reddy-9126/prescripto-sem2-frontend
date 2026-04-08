import { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {

    let isSubscribed = true

    if (dToken) {
      setIsLoading(true)
      setHasError(false)
      getDashData()
        .then((success) => {
          if (isSubscribed && !success) {
            setHasError(true)
          }
        })
        .catch(() => {
          if (isSubscribed) {
            setHasError(true)
          }
        })
        .finally(() => {
          if (isSubscribed) {
            setIsLoading(false)
          }
        })
    } else {
      setIsLoading(false)
      setHasError(false)
    }

    return () => {
      isSubscribed = false
    }

  }, [dToken, getDashData])

  if (!dToken) {
    return (
      <div className='m-5 rounded border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500'>
        Sign in as a doctor to view your dashboard metrics.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='m-5 rounded border border-slate-200 bg-white p-6 text-sm text-slate-500'>
        Loading dashboard data…
      </div>
    )
  }

  if (hasError || !dashData) {
    return (
      <div className='m-5 rounded border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600'>
        Unable to load dashboard metrics right now. Please refresh or check your backend connection.
      </div>
    )
  }

  const latestAppointments = Array.isArray(dashData.latestAppointments) ? dashData.latestAppointments.slice(0, 5) : []

  return (
    <div className='m-5'>

      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {dashData.earnings}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p></div>
        </div>
      </div>

      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-4 border border-t-0'>
          {latestAppointments.length === 0 && (
            <p className='px-6 py-10 text-center text-sm text-slate-500'>No recent bookings found.</p>
          )}
          {latestAppointments.map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
              <img className='rounded-full w-10' src={item.userData?.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData?.name ?? 'Unknown Patient'}</p>
                <p className='text-gray-600 '>Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="Cancel appointment" />
                    <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="Complete appointment" />
                  </div>
              }
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard