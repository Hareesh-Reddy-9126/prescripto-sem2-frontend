import PropTypes from "prop-types";
import { createContext, useCallback, useMemo } from "react";
import { getBackendUrl } from '../utils/runtimeConfig'

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY || '₹'
    const backendUrl = getBackendUrl()

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = useCallback((slotDate) => {
        if (typeof slotDate !== 'string' || slotDate.trim() === '') {
            return 'Date unavailable'
        }
        const dateArray = slotDate.split('_')
        const day = dateArray[0] ?? ''
    const monthIndex = Number(dateArray[1])
    const year = dateArray[2] ?? ''
    const monthNumber = Number.isFinite(monthIndex) ? monthIndex - 1 : -1
    const month = monthNumber >= 0 ? MONTHS[monthNumber] ?? '' : ''
        return `${day} ${month} ${year}`.trim() || 'Date unavailable'
    }, [])

    // Function to calculate the age eg. ( 20_01_2000 => 24 )
    const calculateAge = useCallback((dob) => {
        const today = new Date()
        const birthDate = new Date(dob)
        const age = today.getFullYear() - birthDate.getFullYear()
        return age
    }, [])

    const value = useMemo(() => ({
        backendUrl,
        currency,
        slotDateFormat,
        calculateAge,
    }), [backendUrl, currency, calculateAge, slotDateFormat])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}