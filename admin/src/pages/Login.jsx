import axios from 'axios'
import { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { getBackendUrl } from '../utils/runtimeConfig'
import { useEffect } from 'react'

const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const normalizedBackendUrl = getBackendUrl()

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const role = params.get('role')
      if (role === 'doctor') setState('Doctor')
    } catch (e) {
      // ignore
    }
  }, [])

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!normalizedBackendUrl) {
      toast.error('Backend URL is not configured. Please set VITE_BACKEND_URL in your environment or provide deployed.json')
      return
    }

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(`${normalizedBackendUrl}/api/admin/login`, { email, password })
        if (data.success) {
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(`${normalizedBackendUrl}/api/doctor/login`, { email, password })
        if (data.success) {
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Unable to sign in right now. Please try again.'
      toast.error(message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state}</span> Login</p>
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" autoComplete='email' required />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" autoComplete='current-password' required />
        </div>
        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
        {
          state === 'Admin'
            ? <p>Doctor Login? <span onClick={() => setState('Doctor')} className='text-primary underline cursor-pointer'>Click here</span></p>
            : <p>Admin Login? <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login