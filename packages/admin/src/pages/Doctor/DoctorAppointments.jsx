import { useContext, useEffect, useMemo, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    ensureConsultation,
    startConsultation,
    getConsultationDetails,
    completeConsultation,
    uploadLabReport,
    getAppointmentRecords,
  } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const [consultationStatus, setConsultationStatus] = useState({})
  const [summaryModal, setSummaryModal] = useState({
    open: false,
    appointmentId: '',
    summary: '',
    notesForPatient: '',
    notesForInternal: '',
    followUpDate: '',
    labTitle: '',
    labDescription: '',
    labFile: null,
    prescription: null,
    labReports: [],
  })

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken, getAppointments])

  useEffect(() => {
    const statusMap = appointments.reduce((acc, item) => {
      acc[item._id] = item.consultation?.status || (item.isCompleted ? 'completed' : 'not_scheduled')
      return acc
    }, {})
    setConsultationStatus(statusMap)
  }, [appointments])

  const upcomingAppointments = useMemo(() => appointments.filter((item) => !item.cancelled), [appointments])

  const handleJoinConsultation = async (appointmentId) => {
    const scheduled = await ensureConsultation(appointmentId)
  if (!scheduled?.roomCode) return

  const active = await startConsultation(appointmentId)
  const room = active?.roomCode || scheduled.roomCode
    const url = `https://meet.jit.si/${room}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openSummaryModal = async (appointmentId) => {
    const details = await getConsultationDetails(appointmentId)
    const records = await getAppointmentRecords(appointmentId)

    setSummaryModal({
      open: true,
      appointmentId,
      summary: details?.summary || '',
      notesForPatient: details?.notesForPatient || '',
      notesForInternal: details?.notesForInternal || '',
      followUpDate: details?.followUpDate ? details.followUpDate.split('T')[0] : '',
      labTitle: '',
      labDescription: '',
      labFile: null,
      prescription: records?.prescription || null,
      labReports: records?.labReports || [],
    })
  }

  const closeSummaryModal = () => {
    setSummaryModal({
      open: false,
      appointmentId: '',
      summary: '',
      notesForPatient: '',
      notesForInternal: '',
      followUpDate: '',
      labTitle: '',
      labDescription: '',
      labFile: null,
      prescription: null,
      labReports: [],
    })
  }

  const handleSummarySubmit = async (event) => {
    event.preventDefault()
    const saved = await completeConsultation({
      appointmentId: summaryModal.appointmentId,
      summary: summaryModal.summary,
      notesForPatient: summaryModal.notesForPatient,
      notesForInternal: summaryModal.notesForInternal,
      followUpDate: summaryModal.followUpDate || undefined,
    })
    if (saved) {
      if (summaryModal.labTitle && summaryModal.labFile) {
        await uploadLabReport({
          appointmentId: summaryModal.appointmentId,
          title: summaryModal.labTitle,
          description: summaryModal.labDescription,
          file: summaryModal.labFile,
        })
      }
      closeSummaryModal()
    }
  }

  const renderConsultationControls = (item) => {
    if (item.cancelled) {
      return <p className='text-red-400 text-xs font-medium'>Cancelled</p>
    }

    if (item.isCompleted || consultationStatus[item._id] === 'completed') {
      return (
        <button
          type='button'
          onClick={() => openSummaryModal(item._id)}
          className='text-xs text-primary underline'
        >
          View Summary
        </button>
      )
    }

    return (
      <div className='flex flex-col gap-1'>
        <button
          type='button'
          onClick={() => handleJoinConsultation(item._id)}
          className='rounded bg-primary px-3 py-1 text-xs text-white shadow-sm'
        >
          Join Call
        </button>
        <button
          type='button'
          onClick={() => openSummaryModal(item._id)}
          className='rounded border border-primary px-3 py-1 text-xs text-primary'
        >
          Wrap Up
        </button>
      </div>
    )
  }

  return (
    <div className='w-full max-w-6xl m-5 '>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1.5fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Status</p>
          <p>Action</p>
        </div>
        {appointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1.5fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.payment?'Online':'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>
            <p className='text-xs font-medium capitalize'>{item.cancelled ? 'cancelled' : consultationStatus[item._id] || 'scheduled'}</p>
            <div className='flex items-start gap-2'>
              {!item.cancelled && !item.isCompleted && (
                <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="Cancel appointment" />
              )}
              {renderConsultationControls(item)}
            </div>
          </div>
        ))}
      </div>

      {summaryModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div className='w-full max-w-xl rounded-lg bg-white p-6 shadow-xl'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-800'>Consultation Wrap-up</h2>
              <button type='button' onClick={closeSummaryModal} className='text-gray-500 transition hover:text-gray-700'>✕</button>
            </div>
            <form onSubmit={handleSummarySubmit} className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-600'>Summary</label>
                <textarea
                  required
                  value={summaryModal.summary}
                  onChange={(event) => setSummaryModal((prev) => ({ ...prev, summary: event.target.value }))}
                  className='h-28 w-full rounded border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none'
                  placeholder='Key observations, diagnosis, treatment plan'
                />
              </div>
              <div className='grid gap-3 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-600'>Follow-up Date (Optional)</label>
                  <input
                    type='date'
                    value={summaryModal.followUpDate}
                    onChange={(event) => setSummaryModal((prev) => ({ ...prev, followUpDate: event.target.value }))}
                    className='w-full rounded border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-600'>Patient Notes</label>
                  <textarea
                    value={summaryModal.notesForPatient}
                    onChange={(event) => setSummaryModal((prev) => ({ ...prev, notesForPatient: event.target.value }))}
                    className='h-24 w-full rounded border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none'
                    placeholder='Lifestyle guidance, medication reminders'
                  />
                </div>
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-600'>Internal Notes</label>
                <textarea
                  value={summaryModal.notesForInternal}
                  onChange={(event) => setSummaryModal((prev) => ({ ...prev, notesForInternal: event.target.value }))}
                  className='h-20 w-full rounded border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none'
                  placeholder='Observations visible to clinical staff only'
                />
              </div>
              <div className='grid gap-3 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-600'>Lab report title (optional)</label>
                  <input
                    type='text'
                    value={summaryModal.labTitle}
                    onChange={(event) => setSummaryModal((prev) => ({ ...prev, labTitle: event.target.value }))}
                    placeholder='e.g. Blood Test Results'
                    className='w-full rounded border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-600'>Lab report file</label>
                  <input
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(event) => setSummaryModal((prev) => ({ ...prev, labFile: event.target.files?.[0] || null }))}
                    className='w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white'
                  />
                </div>
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-600'>Lab report description</label>
                <textarea
                  value={summaryModal.labDescription}
                  onChange={(event) => setSummaryModal((prev) => ({ ...prev, labDescription: event.target.value }))}
                  className='h-20 w-full rounded border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none'
                  placeholder='Reference ranges, preparation notes, etc.'
                />
              </div>
              {(summaryModal.prescription || summaryModal.labReports.length > 0) && (
                <div className='rounded-lg border border-gray-200 p-4'>
                  <h3 className='text-sm font-semibold text-gray-700'>Patient files for this appointment</h3>
                  {summaryModal.prescription && (
                    <div className='mt-3 text-sm text-gray-600'>
                      <p className='font-medium text-gray-700'>Prescription</p>
                      {Array.isArray(summaryModal.prescription.medications) && summaryModal.prescription.medications.length > 0 ? (
                        <ul className='mt-2 list-inside list-disc'>
                          {summaryModal.prescription.medications.map((medication, index) => (
                            <li key={index}>
                              {typeof medication === 'string'
                                ? medication
                                : `${medication.name || 'Medicine'} ${medication.dosage ? `• ${medication.dosage}` : ''}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className='text-xs text-gray-500'>No medications listed.</p>
                      )}
                    </div>
                  )}
                  {summaryModal.labReports.length > 0 && (
                    <div className='mt-4 text-sm text-gray-600'>
                      <p className='font-medium text-gray-700'>Lab reports</p>
                      <ul className='mt-2 space-y-2'>
                        {summaryModal.labReports.map((report) => (
                          <li key={report._id} className='flex items-center justify-between rounded border border-gray-200 px-3 py-2'>
                            <div>
                              <p className='font-medium text-gray-800'>{report.title}</p>
                              <p className='text-xs text-gray-500'>{report.description || 'No description provided'}</p>
                            </div>
                            {report.fileUrl && (
                              <a href={report.fileUrl} target='_blank' rel='noopener noreferrer' className='text-xs font-medium text-primary underline'>Open</a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={closeSummaryModal}
                  className='rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:shadow-md'
                >
                  Save Summary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default DoctorAppointments