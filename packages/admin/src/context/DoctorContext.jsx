import axios from 'axios'
import PropTypes from 'prop-types'
import { createContext, useCallback, useMemo, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getBackendUrl } from '../utils/runtimeConfig'


export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const [dToken, setDToken] = useState('')
    const [initializing, setInitializing] = useState(true)
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(null)
    const [profileData, setProfileData] = useState(false)
    const [consultationCache, setConsultationCache] = useState({})

    // Getting Doctor appointment data from Database using API
    const getAppointments = useCallback(async () => {
        try {

            const backendUrl = getBackendUrl()
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })

            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }, [dToken])

    // Getting Doctor profile data from Database using API
    const getProfileData = useCallback(async () => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
            setProfileData(data.profileData)
        } catch (error) {
            toast.error(error.message)
        }
    }, [dToken])

    // Getting Doctor dashboard data using API
    const getDashData = useCallback(async () => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })
            if (data.success) {
                setDashData(data.dashData)
                return true
            } else {
                toast.error(data.message)
                setDashData(null)
            }
        } catch (error) {
            toast.error(error.message)
            setDashData(null)
        }
        return false
    }, [dToken])

    // Function to cancel doctor appointment using API
    const cancelAppointment = useCallback(async (appointmentId) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getAppointments()
                // after creating dashboard
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [dToken, getAppointments, getDashData])

    // Function to Mark appointment completed using API
    const ensureConsultation = useCallback(async (appointmentId) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.post(`${backendUrl}/api/consultations/doctor/schedule`, { appointmentId }, { headers: { dToken } })

            if (data.success) {
                setConsultationCache((prev) => ({ ...prev, [appointmentId]: data.consultation }))
                return data.consultation
            }

            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [dToken])

    const startConsultation = useCallback(async (appointmentId) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.post(`${backendUrl}/api/consultations/doctor/start`, { appointmentId }, { headers: { dToken } })

            if (data.success) {
                setConsultationCache((prev) => ({ ...prev, [appointmentId]: data.consultation }))
                return data.consultation
            }
            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [dToken])

    const getConsultationDetails = useCallback(async (appointmentId) => {
        try {
            const cached = consultationCache[appointmentId]
            if (cached) return cached

            const backendUrl = getBackendUrl()
            const { data } = await axios.post(`${backendUrl}/api/consultations/doctor/details`, { appointmentId }, { headers: { dToken } })

            if (data.success) {
                setConsultationCache((prev) => ({ ...prev, [appointmentId]: data.consultation }))
                return data.consultation
            }
            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [consultationCache, dToken])

    const completeConsultation = useCallback(async ({ appointmentId, summary, followUpDate, notesForPatient, notesForInternal }) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.post(`${backendUrl}/api/consultations/doctor/complete`, { appointmentId, summary, followUpDate, notesForPatient, notesForInternal }, { headers: { dToken } })

            if (data.success) {
                toast.success('Consultation saved')
                setConsultationCache((prev) => ({ ...prev, [appointmentId]: data.consultation }))
                getAppointments()
                getDashData()
                return true
            }
            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return false
    }, [dToken, getAppointments, getDashData])

    const uploadLabReport = useCallback(async ({ appointmentId, title, description, file }) => {
        try {
            const formData = new FormData()
            formData.append('appointmentId', appointmentId)
            formData.append('title', title)
            if (description) formData.append('description', description)
            if (file) formData.append('report', file)

            const backendUrl = getBackendUrl()
            const { data } = await axios.post(`${backendUrl}/api/records/doctor/lab-report`, formData, { headers: { dToken, 'Content-Type': 'multipart/form-data' } })

            if (data.success) {
                toast.success('Lab report shared with patient')
                return data.report
            }

            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [dToken])

    const getAppointmentRecords = useCallback(async (appointmentId) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(`${backendUrl}/api/records/doctor/appointment/${appointmentId}`, { headers: { dToken } })
            if (data.success) {
                return data
            }
            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [dToken])

    const value = useMemo(() => ({
        dToken,
        setDToken,
        backendUrl: getBackendUrl(),
        appointments,
        getAppointments,
        cancelAppointment,
        ensureConsultation,
        startConsultation,
        getConsultationDetails,
        completeConsultation,
        uploadLabReport,
        getAppointmentRecords,
        dashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData,
    }), [appointments, cancelAppointment, completeConsultation, dashData, dToken, ensureConsultation, getAppointmentRecords, getAppointments, getConsultationDetails, getDashData, getProfileData, profileData, startConsultation, uploadLabReport])

    useEffect(() => {
        // verify any stored doctor token on mount before trusting it
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        if (params && params.get('forceLogin') === '1') {
            localStorage.removeItem('dToken')
            setDToken('')
            setInitializing(false)
            return
        }

        const verifyStoredDoctor = async () => {
            const stored = localStorage.getItem('dToken')
            if (!stored) {
                setInitializing(false)
                return
            }
            try {
                const backendUrl = getBackendUrl()
                const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, { headers: { dToken: stored } })
                if (data && data.profileData) {
                    setDToken(stored)
                    setProfileData(data.profileData)
                } else {
                    setDToken('')
                    localStorage.removeItem('dToken')
                }
            } catch (error) {
                setDToken('')
                localStorage.removeItem('dToken')
            } finally {
                setInitializing(false)
            }
        }

        verifyStoredDoctor()
    }, [])

    return (
        <DoctorContext.Provider value={{ ...value, initializing }}>
            {props.children}
        </DoctorContext.Provider>
    )


}

export default DoctorContextProvider

DoctorContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}