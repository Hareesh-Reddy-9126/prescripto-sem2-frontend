import { useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { getBackendUrl } from '../utils/runtimeConfig'

const API_BASE_URL = getBackendUrl()

const Register = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    ownerName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    licenseNumber: '',
    gstNumber: '',
    serviceRadiusKm: 5,
    pickup: true,
    localDelivery: false,
    courier: false,
  })

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    if (!API_BASE_URL) {
      toast.error('Backend URL is not configured. Please set VITE_API_URL in your environment or provide deployed.json')
      return
    }

    try {
      setSubmitting(true)
      const deliveryOptions = [
        form.pickup ? 'pickup' : null,
        form.localDelivery ? 'local-delivery' : null,
        form.courier ? 'courier' : null,
      ].filter(Boolean)

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        address: {
          line1: form.line1.trim(),
          line2: form.line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim() || 'India',
        },
        licenseNumber: form.licenseNumber.trim(),
        gstNumber: form.gstNumber.trim(),
        deliveryOptions,
        serviceRadiusKm: Number(form.serviceRadiusKm) || 5,
      }

      const { data } = await axios.post(`${API_BASE_URL}/api/pharmacist/register`, payload)
      if (data.success) {
        toast.success('Submitted for approval. You can log in after admin approves.')
        navigate('/login', { replace: true })
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-white px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Prescripto Pharmacist" className="h-10 w-auto" />
            <h1 className="text-xl font-semibold text-slate-800">Pharmacist Registration</h1>
          </div>
          <Link to="/login" className="text-sm text-brand-600 hover:underline">Back to Sign in</Link>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Pharmacy Name</label>
            <input name="name" value={form.name} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Owner Name</label>
            <input name="ownerName" value={form.ownerName} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} minLength={8} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">License Number</label>
            <input name="licenseNumber" value={form.licenseNumber} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">GST Number (optional)</label>
            <input name="gstNumber" value={form.gstNumber} onChange={onChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Service Radius (km)</label>
            <input type="number" name="serviceRadiusKm" value={form.serviceRadiusKm} onChange={onChange} min={1} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Address Line 1</label>
              <input name="line1" value={form.line1} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm">Address Line 2</label>
              <input name="line2" value={form.line2} onChange={onChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm">City</label>
              <input name="city" value={form.city} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm">State</label>
              <input name="state" value={form.state} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm">Postal Code</label>
              <input name="postalCode" value={form.postalCode} onChange={onChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm">Country</label>
              <input name="country" value={form.country} onChange={onChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Delivery Options</label>
            <div className="mt-2 flex flex-wrap gap-6 text-sm">
              <label className="inline-flex items-center gap-2"><input type="checkbox" name="pickup" checked={form.pickup} onChange={onChange} /> Pickup</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" name="localDelivery" checked={form.localDelivery} onChange={onChange} /> Local delivery</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" name="courier" checked={form.courier} onChange={onChange} /> Courier</label>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Link to="/login" className="rounded-xl border px-4 py-2 text-sm">Cancel</Link>
            <button type="submit" disabled={submitting} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-brand-300">
              {submitting ? 'Submitting…' : 'Submit for approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
