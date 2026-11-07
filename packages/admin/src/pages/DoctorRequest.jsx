import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getBackendUrl } from '../utils/runtimeConfig'

const DoctorRequest = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', speciality: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const backendUrl = getBackendUrl()
    if (!backendUrl) return toast.error('Backend URL not configured')
    if (!form.name || !form.email) return toast.error('Name and email required')
    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/api/doctor/request`, form)
      if (data.success) {
        toast.success(data.message || 'Request submitted')
        setForm({ name: '', email: '', phone: '', speciality: '', message: '' })
      } else {
        toast.error(data.message || 'Unable to submit request')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center">
      <form onSubmit={submit} className="m-auto p-8 bg-white rounded shadow max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Request Doctor Account</h2>
        <div className="mb-2">
          <label className="block text-sm">Full name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div className="mb-2">
          <label className="block text-sm">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div className="mb-2">
          <label className="block text-sm">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div className="mb-2">
          <label className="block text-sm">Speciality</label>
          <input name="speciality" value={form.speciality} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Message (optional)</label>
          <textarea name="message" value={form.message} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded">{loading ? 'Submitting...' : 'Request Account'}</button>
      </form>
    </div>
  )
}

export default DoctorRequest
