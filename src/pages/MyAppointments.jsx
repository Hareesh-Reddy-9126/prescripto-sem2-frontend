import axios from 'axios'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const MyAppointments = () => {

    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')
    const [summaryModal, setSummaryModal] = useState({
        open: false,
        summary: '',
        notesForPatient: '',
        followUpDate: '',
    })

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = useCallback((slotDate) => {
        const dateArray = slotDate.split('_')
        const monthIndex = Math.max(Number(dateArray[1]) - 1, 0)
        return `${dateArray[0]} ${MONTHS[monthIndex] ?? ''} ${dateArray[2]}`
    }, [])

    // Getting User Appointments Data Using API
    const getUserAppointments = useCallback(async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            setAppointments(data.appointments.reverse())

        } catch (error) {
            toast.error(error.message)
        }
    }, [backendUrl, token])

    // Function to cancel appointment Using API
    const cancelAppointment = useCallback(async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }, [backendUrl, getUserAppointments, token])

    const initPay = useCallback((order) => {
        if (!window.Razorpay) {
            toast.error('Unable to initiate payment. Please try again later.')
            return
        }
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Appointment Payment',
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {

                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    if (data.success) {
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    toast.error(error.message)
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    }, [backendUrl, getUserAppointments, navigate, token])

    // Function to make payment using razorpay
    const appointmentRazorpay = useCallback(async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
            if (data.success) {
                initPay(data.order)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [backendUrl, initPay, token])

    // Function to make payment using stripe
    const appointmentStripe = useCallback(async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
            if (data.success) {
                const { session_url } = data
                window.location.replace(session_url)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [backendUrl, token])



    const openSummaryModal = (consultation = {}) => {
        setSummaryModal({
            open: true,
            summary: consultation.summary || '',
            notesForPatient: consultation.notesForPatient || '',
            followUpDate: consultation.followUpDate ? consultation.followUpDate.split('T')[0] : '',
        })
    }

    const closeSummaryModal = () => {
        setSummaryModal({ open: false, summary: '', notesForPatient: '', followUpDate: '' })
    }

    const joinConsultation = useCallback(async (appointmentId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/consultations/patient/details`, { appointmentId }, { headers: { token } })
            if (data.success && data.consultation?.roomCode) {
                const url = `https://meet.jit.si/${data.consultation.roomCode}`
                window.open(url, '_blank', 'noopener,noreferrer')
            } else {
                toast.error(data.message || 'Consultation not ready yet. Please try again closer to the appointment time.')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [backendUrl, token])

    useEffect(() => {
        if (token) {
            getUserAppointments()
        }
    }, [getUserAppointments, token])

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            <div className=''>
                {appointments.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img className='w-36 bg-[#EAEFFF]' src={item.docData.image} alt="" />
                        </div>
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold'>{item.docData.name}</p>
                            <p>{item.docData.speciality}</p>
                            <p className='text-[#464646] font-medium mt-1'>Address:</p>
                            <p className=''>{item.docData.address.line1}</p>
                            <p className=''>{item.docData.address.line2}</p>
                            <p className=' mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} |  {item.slotTime}</p>
                        </div>
                        <div></div>
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && <button onClick={() => setPayment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentStripe(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.stripe_logo} alt="" /></button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentRazorpay(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt="" /></button>}
                            {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-[#696969]  bg-[#EAEFFF]'>Paid</button>}

                            {item.isCompleted && (
                                <button
                                    onClick={() => openSummaryModal(item.consultation)}
                                    className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'
                                >
                                    View Summary
                                </button>
                            )}

                            {!item.cancelled && !item.isCompleted && ['scheduled', 'ready', 'live'].includes(item.consultation?.status) && (
                                <button
                                    onClick={() => joinConsultation(item._id)}
                                    className='sm:min-w-48 py-2 border border-primary rounded text-primary hover:bg-primary hover:text-white transition-all duration-300'
                                >
                                    Join Consultation
                                </button>
                            )}

                            {!item.cancelled && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                            {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
                        </div>
                    </div>
                ))}
            </div>

            {summaryModal.open && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
                    <div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-xl'>
                        <div className='mb-4 flex items-center justify-between'>
                            <h2 className='text-lg font-semibold text-gray-800'>Consultation Summary</h2>
                            <button type='button' onClick={closeSummaryModal} className='text-gray-500 transition hover:text-gray-700'>✕</button>
                        </div>
                        <div className='space-y-4 text-sm text-gray-600'>
                            <div>
                                <p className='font-semibold text-gray-700'>Summary</p>
                                <p className='whitespace-pre-line rounded border border-gray-200 bg-gray-50 p-3 text-gray-700'>{summaryModal.summary || 'Summary will appear once doctor submits it.'}</p>
                            </div>
                            <div className='grid gap-3 md:grid-cols-2'>
                                <div>
                                    <p className='font-semibold text-gray-700'>Follow-up</p>
                                    <p className='rounded border border-gray-200 bg-gray-50 p-3'>{summaryModal.followUpDate || 'Not scheduled'}</p>
                                </div>
                                <div>
                                    <p className='font-semibold text-gray-700'>Doctor Notes</p>
                                    <p className='whitespace-pre-line rounded border border-gray-200 bg-gray-50 p-3 text-gray-700'>{summaryModal.notesForPatient || 'Available after consultation concludes.'}</p>
                                </div>
                            </div>
                        </div>
                        <div className='mt-6 flex justify-end'>
                            <button onClick={closeSummaryModal} className='rounded bg-primary px-4 py-2 text-sm font-medium text-white'>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyAppointments