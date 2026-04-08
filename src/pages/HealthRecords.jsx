import axios from 'axios'
import { format } from 'date-fns'
import { useCallback, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const formatDate = (value) => {
  if (!value) return 'Not available'
  try {
    return format(new Date(value), 'dd MMM yyyy, hh:mm a')
  } catch (error) {
    return value
  }
}

const HealthRecords = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.post(
        `${backendUrl}/api/records/patient/timeline`,
        {},
        { headers: { token } },
      )

      if (data.success) {
        setTimeline(data.timeline)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [backendUrl, token])

  useEffect(() => {
    if (token) {
      fetchRecords()
    }
  }, [fetchRecords, token])

  if (!token) {
    return <p className='mt-16 text-center text-gray-600'>Sign in to view your health records.</p>
  }

  if (loading) {
    return <p className='mt-16 text-center text-gray-600'>Loading your health records…</p>
  }

  if (!timeline) {
    return null
  }

  const { appointments = [], prescriptions = [], labReports = [], pharmacyOrders = [] } = timeline

  return (
    <div className='mt-12'>
      <p className='border-b pb-3 text-lg font-medium text-gray-700'>My Health Records</p>
      <div className='mt-6 space-y-8'>
        <section>
          <h2 className='mb-3 text-base font-semibold text-gray-700'>Virtual Consultations</h2>
          <div className='space-y-3'>
            {appointments.length === 0 && <p className='rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500'>Consultations will appear here once you meet a doctor.</p>}
            {appointments.map((appointment) => (
              <div key={appointment._id} className='rounded border border-gray-200 bg-white p-4 shadow-sm'>
                <div className='flex flex-wrap justify-between gap-2 text-sm text-gray-600'>
                  <div>
                    <p className='font-semibold text-gray-800'>Dr. {appointment.docData?.name || appointment.docId}</p>
                    <p>{appointment.consultation?.summary || 'Summary will be available after your doctor completes the session.'}</p>
                  </div>
                  <div className='text-right'>
                    <p>{appointment.slotDate?.replace(/_/g, ' ')} · {appointment.slotTime}</p>
                    <p className='capitalize text-xs text-gray-500'>Status: {appointment.consultation?.status || (appointment.isCompleted ? 'completed' : 'scheduled')}</p>
                  </div>
                </div>
                {appointment.consultation?.followUpDate && (
                  <p className='mt-2 text-xs text-primary'>Follow-up: {formatDate(appointment.consultation.followUpDate)}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className='mb-3 text-base font-semibold text-gray-700'>Prescriptions</h2>
          <div className='space-y-3'>
            {prescriptions.length === 0 && <p className='rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500'>Prescriptions issued by your doctors will appear here.</p>}
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className='rounded border border-gray-200 bg-white p-4 shadow-sm'>
                <p className='text-sm text-gray-700'>Diagnosis: <span className='font-medium'>{prescription.diagnosis || 'Not provided'}</span></p>
                {Array.isArray(prescription.medications) && prescription.medications.length > 0 && (
                  <div className='mt-2 text-sm text-gray-600'>
                    <p className='font-medium text-gray-700'>Medications</p>
                    <ul className='list-inside list-disc'>
                      {prescription.medications.map((med, index) => (
                        <li key={index}>{typeof med === 'string' ? med : `${med.name || 'Medicine'} - ${med.dosage || med.instructions || ''}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className='mb-3 text-base font-semibold text-gray-700'>Lab Reports</h2>
          <div className='space-y-3'>
            {labReports.length === 0 && <p className='rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500'>Uploaded lab reports will appear here.</p>}
            {labReports.map((report) => (
              <div key={report._id} className='flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-600'>
                <div>
                  <p className='font-semibold text-gray-800'>{report.title}</p>
                  <p>{report.description || 'No description provided.'}</p>
                  <p className='text-xs text-gray-500'>Uploaded on {formatDate(report.createdAt)}</p>
                </div>
                {report.fileUrl && (
                  <a href={report.fileUrl} target='_blank' rel='noopener noreferrer' className='rounded border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white'>View file</a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className='mb-3 text-base font-semibold text-gray-700'>Pharmacy Orders</h2>
          <div className='space-y-3'>
            {pharmacyOrders.length === 0 && <p className='rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500'>Track orders once a pharmacist fulfills your prescriptions.</p>}
            {pharmacyOrders.map((order) => (
              <div key={order._id} className='rounded border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-600'>
                <div className='flex flex-wrap justify-between gap-2'>
                  <p className='font-semibold text-gray-800'>Order #{order.orderNumber}</p>
                  <p className='capitalize text-xs text-gray-500'>Status: {order.status}</p>
                </div>
                {order.logistics?.trackingNumber && (
                  <p className='mt-1 text-xs text-primary'>Tracking: {order.logistics.trackingNumber}</p>
                )}
                {order.notesForPatient && (
                  <p className='mt-2 rounded border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700'>
                    Pharmacist note: {order.notesForPatient}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default HealthRecords
