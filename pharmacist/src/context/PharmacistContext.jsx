import PropTypes from 'prop-types'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getBackendUrl } from '../utils/runtimeConfig'

// eslint-disable-next-line react-refresh/only-export-components
export const PharmacistContext = createContext()

const createApiClient = (token) => {
  const base = getBackendUrl() || 'http://localhost:4000'
  const client = axios.create({
    baseURL: `${base}/api/pharmacist`,
  })

  client.interceptors.request.use((config) => {
    const configCopy = { ...config }
    configCopy.headers = { ...config.headers }
    if (token) {
      configCopy.headers.token = token
    }
    return configCopy
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error?.response?.data?.message || error.message
      toast.error(message)
      return Promise.reject(error)
    },
  )

  return client
}

export const PharmacistProvider = ({ children }) => {
  const [token, setToken] = useState('')
  const [pharmacy, setPharmacy] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const api = useMemo(() => createApiClient(token), [token])

  const persistToken = useCallback((value) => {
    if (value) {
      localStorage.setItem('pToken', value)
    } else {
      localStorage.removeItem('pToken')
    }
    setToken(value || '')
  }, [])

  const logout = useCallback(() => {
    persistToken('')
    setPharmacy(null)
    setDashboard(null)
    setOrders([])
  }, [persistToken])

  const login = useCallback(async ({ email, password }) => {
    try {
      setLoading(true)
      const base = getBackendUrl() || 'http://localhost:4000'
      const { data } = await axios.post(`${base}/api/pharmacist/login`, { email, password })

      if (!data.success) {
        toast.error(data.message || 'Unable to login')
        return { success: false, requiresApproval: data.requiresApproval }
      }

      if (data.requiresApproval) {
        toast.warning('Account pending admin approval')
        return { success: false, requiresApproval: true }
      }

      persistToken(data.token)
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [persistToken])

  const fetchProfile = useCallback(async () => {
    if (!token) return null
    const { data } = await api.get('/profile')
    if (data.success) {
      setPharmacy(data.pharmacy)
      return data.pharmacy
    }
    return null
  }, [api, token])

  const fetchDashboard = useCallback(async () => {
    if (!token) return null
    const { data } = await api.get('/dashboard')
    if (data.success) {
      setDashboard(data.stats)
      return data.stats
    }
    return null
  }, [api, token])

  const fetchOrders = useCallback(async (filters = {}) => {
    if (!token) return []
    const { data } = await api.post('/orders', filters)
    if (data.success) {
      setOrders(data.orders)
      return data.orders
    }
    return []
  }, [api, token])

  const fetchOrderDetail = useCallback(async (orderId) => {
    if (!token || !orderId) return null
    const { data } = await api.post('/orders/detail', { orderId })
    if (data.success) {
      return data.order
    }
    return null
  }, [api, token])

  const updateOrderStatus = useCallback(async ({ orderId, status, note, logistics }) => {
    if (!token) return { success: false }
    const { data } = await api.post('/orders/update-status', { orderId, status, note, logistics })
    if (data.success) {
      toast.success('Order status updated')
      await fetchOrders()
      return { success: true, order: data.order }
    }
    toast.error(data.message || 'Unable to update order')
    return { success: false }
  }, [api, token, fetchOrders])

  const fetchTimeline = useCallback(async (orderId) => {
    if (!token) return []
    const { data } = await api.post('/orders/timeline', { orderId })
    if (data.success) {
      return data.timeline
    }
    return []
  }, [api, token])

  useEffect(() => {
    // On mount, if there's a stored token, verify it with the backend before trusting it.
    // This prevents automatic access to the dashboard from stale/invalid tokens.
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    if (params && params.get('forceLogin') === '1') {
      // clear stored pharmacist token and skip verification
      localStorage.removeItem('pToken')
      setToken('')
      setInitializing(false)
    } else {
      const verifyStoredToken = async () => {
        const stored = localStorage.getItem('pToken')
        if (!stored) {
          setInitializing(false)
          return
        }

        try {
          setLoading(true)
          const base = getBackendUrl() || 'http://localhost:4000'
          // verify by calling profile endpoint with the stored token
          const { data } = await axios.get(`${base}/api/pharmacist/profile`, { headers: { token: stored } })
          if (data && data.success) {
            // token is valid — persist and let the existing bootstrap effect run
            persistToken(stored)
          } else {
            persistToken('')
          }
        } catch (error) {
          // invalid or expired token
          persistToken('')
        } finally {
          setLoading(false)
          setInitializing(false)
        }
      }

      verifyStoredToken()
    }

    const bootstrap = async () => {
      if (!token) {
        setInitializing(false)
        return
      }

      try {
        setLoading(true)
        await Promise.all([fetchProfile(), fetchDashboard(), fetchOrders()])
      } catch (error) {
        toast.error('Session expired, please login again')
        logout()
      } finally {
        setLoading(false)
        setInitializing(false)
      }
    }

    bootstrap()
  }, [token, fetchProfile, fetchDashboard, fetchOrders, logout])

  const value = {
    token,
    pharmacy,
    dashboard,
    orders,
    loading,
    initializing,
    login,
    logout,
    fetchProfile,
    fetchDashboard,
    fetchOrders,
    fetchOrderDetail,
    updateOrderStatus,
    fetchTimeline,
    api,
  }

  return (
    <PharmacistContext.Provider value={value}>
      {children}
    </PharmacistContext.Provider>
  )
}

PharmacistProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
