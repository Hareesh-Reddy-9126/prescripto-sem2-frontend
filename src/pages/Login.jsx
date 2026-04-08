import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Sign Up')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { backendUrl, token, setToken, initializing } = useContext(AppContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!backendUrl) {
      toast.error('Backend URL is not configured. Please set VITE_BACKEND_URL in your environment.')
      return
    }

    if (state === 'Sign Up' && password.length < 8) {
      toast.error('Password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)

    try {
      if (state === 'Sign Up') {

        const { data } = await axios.post(`${backendUrl}/api/user/register`, { name: name.trim(), email: email.trim(), password })

        if (data.success) {
          toast.success('Account created successfully')
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }

      } else {

        const { data } = await axios.post(`${backendUrl}/api/user/login`, { email: email.trim(), password })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }

      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }

  }

  // Only redirect to home if we have a confirmed token and the app finished
  // its initialization/verification phase. This prevents immediate redirect
  // when SPA navigation includes `?forceLogin=1` and the context is still
  // clearing/verifying stored tokens.
  useEffect(() => {
    // If URL includes ?forceLogin=1, ensure tokens are cleared so the
    // login form will be shown even if some stale token existed.
    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      if (params && params.get('forceLogin') === '1') {
        try { localStorage.removeItem('token') } catch (e) {}
        setToken('')
      }
    } catch (e) {
      // ignore
    }

    if (token && !initializing) {
      navigate('/')
    }
  }, [navigate, token, initializing])

  // Sync state with query param (?tab=signup|login)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'signup') setState('Sign Up')
    else if (tab === 'login') setState('Login')
  }, [location.search])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
        {state === 'Sign Up'
          ? <div className='w-full '>
            <p>Full Name</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="text" autoComplete='name' required />
          </div>
          : null
        }
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" autoComplete={state === 'Sign Up' ? 'email' : 'username'} required />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" autoComplete={state === 'Sign Up' ? 'new-password' : 'current-password'} minLength={state === 'Sign Up' ? 8 : undefined} required />
        </div>
        <button type='submit' disabled={isSubmitting} className={`bg-primary text-white w-full py-2 my-2 rounded-md text-base transition-opacity ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
          {isSubmitting ? 'Please wait…' : state === 'Sign Up' ? 'Create account' : 'Login'}
        </button>
        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => navigate('/login?tab=login')} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Create a new account? <span onClick={() => navigate('/login?tab=signup')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login