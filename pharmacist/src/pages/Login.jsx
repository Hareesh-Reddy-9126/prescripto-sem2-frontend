import { useContext, useState } from 'react'
import logo from '../assets/logo.svg'
import { PharmacistContext } from '../context/PharmacistContext.jsx'
import { Link } from 'react-router-dom'

const Login = () => {
  const { login, loading } = useContext(PharmacistContext)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (typeof login === 'function') {
      await login(formData)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Prescripto Pharmacist" className="h-12 w-auto" />
          <h1 className="mt-6 text-2xl font-semibold text-slate-800">Pharmacist Panel</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to fulfill prescriptions from verified doctors.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              placeholder="pharmacy@prescripto.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-600">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            New pharmacy?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:underline">Register for approval</Link>
          </p>
          <p className="mt-2 text-slate-400">Already applied? You can sign in after admin approval.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
