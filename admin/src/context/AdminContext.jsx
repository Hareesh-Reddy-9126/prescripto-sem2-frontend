import axios from "axios";
import PropTypes from "prop-types";
import { createContext, useCallback, useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getBackendUrl } from '../utils/runtimeConfig'


export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    // backendUrl resolved at runtime (build-time VITE or runtime deployed.json)

    const [aToken, setAToken] = useState('')
    const [initializing, setInitializing] = useState(true)

    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [dashData, setDashData] = useState(null)
    const [pharmacies, setPharmacies] = useState({ pending: [], approved: [] })
    const [platformSettings, setPlatformSettings] = useState(null)

    // Getting all Doctors data from Database using API
    const getAllDoctors = useCallback(async () => {
        try {
            const backendUrl = getBackendUrl()
            if (!backendUrl) {
                toast.error('Backend URL not configured. Provide VITE_BACKEND_URL or deployed.json')
                return
            }
            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [aToken])

    // Function to change doctor availablity using API
    const changeAvailability = useCallback(async (docId) => {
        try {

            const backendUrl = getBackendUrl()
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [aToken, getAllDoctors])


    // Getting all appointment data from Database using API
    const getAllAppointments = useCallback(async () => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }, [aToken])

    // Function to cancel appointment using API
    const cancelAppointment = useCallback(async (appointmentId) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }, [aToken, getAllAppointments])

    // Getting Admin Dashboard data from Database using API
    const getDashData = useCallback(async () => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })
            if (data.success) {
                setDashData(data.dashData)
                return true
            } else {
                toast.error(data.message)
                setDashData(null)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            setDashData(null)
        }
        return false
    }, [aToken])

    // Pharmacies: list pending/approved
    const getPharmacies = useCallback(async (status) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(`${backendUrl}/api/admin/pharmacies`, { params: { status }, headers: { aToken } })
            if (data.success) {
                if (status === 'pending') {
                    setPharmacies((p) => ({ ...p, pending: data.pharmacies }))
                } else if (status === 'approved') {
                    setPharmacies((p) => ({ ...p, approved: data.pharmacies }))
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [aToken])

    // Pharmacies: approve/reject
    const reviewPharmacy = useCallback(async ({ pharmacyId, approve, notes }) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.post(`${backendUrl}/api/admin/pharmacies/review`, { pharmacyId, approve, notes }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await Promise.all([getPharmacies('pending'), getPharmacies('approved')])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [aToken, getPharmacies])

    // Pharmacies: toggle active
    const togglePharmacyActive = useCallback(async ({ pharmacyId, isActive }) => {
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.post(`${backendUrl}/api/admin/pharmacies/toggle-active`, { pharmacyId, isActive }, { headers: { aToken } })
            if (data.success) {
                toast.success('Pharmacy status updated')
                await getPharmacies('approved')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [aToken, getPharmacies])

    const loadPlatformSettings = useCallback(async () => {
        if (!aToken) return null
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(`${backendUrl}/api/admin/settings`, { headers: { aToken } })
            if (data.success) {
                setPlatformSettings(data.settings)
                return data.settings
            }
            toast.error(data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        return null
    }, [aToken])

    const savePlatformSettings = useCallback(async (payload) => {
        if (!aToken) return false
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.post(`${backendUrl}/api/admin/settings`, payload, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setPlatformSettings(data.settings)
                return true
            }
            toast.error(data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        return false
    }, [aToken])

    const getDatabaseTables = useCallback(async () => {
        if (!aToken) return null
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(`${backendUrl}/api/admin/db/tables`, { headers: { aToken } })
            if (data.success) {
                return data
            }
            toast.error(data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        return null
    }, [aToken])

    const getDatabaseRows = useCallback(async ({ table, page = 1, limit = 25 }) => {
        if (!aToken) return null
        try {
            const backendUrl = getBackendUrl()
            const { data } = await axios.get(`${backendUrl}/api/admin/db/rows`, {
                params: { table, page, limit },
                headers: { aToken },
            })
            if (data.success) {
                return data
            }
            toast.error(data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        return null
    }, [aToken])

    const value = useMemo(() => ({
        aToken,
        setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData,
        pharmacies,
        getPharmacies,
        reviewPharmacy,
        togglePharmacyActive,
        platformSettings,
        loadPlatformSettings,
        savePlatformSettings,
        getDatabaseTables,
        getDatabaseRows,
    }), [aToken, appointments, cancelAppointment, changeAvailability, dashData, doctors, getAllAppointments, getAllDoctors, getDashData, getDatabaseRows, getDatabaseTables, getPharmacies, loadPlatformSettings, pharmacies, platformSettings, reviewPharmacy, savePlatformSettings, togglePharmacyActive])

    useEffect(() => {
        // Verify any stored admin token on mount before trusting it
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        if (params && params.get('forceLogin') === '1') {
            // clear stored admin token and skip verification
            localStorage.removeItem('aToken')
            setAToken('')
            setInitializing(false)
            return
        }

        const verifyStoredAdmin = async () => {
            const stored = localStorage.getItem('aToken')
            if (!stored) {
                setInitializing(false)
                return
            }
            try {
                const backendUrl = getBackendUrl()
                const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, { headers: { aToken: stored } })
                if (data && data.success) {
                    setAToken(stored)
                    setDashData(data.dashData || null)
                } else {
                    localStorage.removeItem('aToken')
                    setAToken('')
                }
            } catch (error) {
                localStorage.removeItem('aToken')
                setAToken('')
            } finally {
                setInitializing(false)
            }
        }

        verifyStoredAdmin()
    }, [])

    return (
        <AdminContext.Provider value={{ ...value, initializing }}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider

AdminContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}