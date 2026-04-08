import { useContext, useEffect, useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import { PharmacistContext } from '../context/PharmacistContext.jsx'

const Settings = () => {
  const { pharmacy, fetchProfile, api } = useContext(PharmacistContext)
  const [formState, setFormState] = useState({ ownerName: '', phone: '', alternatePhone: '', serviceRadiusKm: 5 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (typeof fetchProfile === 'function') {
      fetchProfile()
    }
  }, [fetchProfile])

  useEffect(() => {
    if (pharmacy) {
      setFormState({
        ownerName: pharmacy.ownerName || '',
        phone: pharmacy.phone || '',
        alternatePhone: pharmacy.alternatePhone || '',
        serviceRadiusKm: pharmacy.serviceRadiusKm || 5,
      })
    }
  }, [pharmacy])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      if (api?.post) {
        await api.post('/update-profile', {
          ...formState,
          serviceRadiusKm: Number(formState.serviceRadiusKm),
        })
      }
      if (typeof fetchProfile === 'function') {
        await fetchProfile()
      }
    } catch (error) {
      console.error('Failed to update profile', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRefresh = () => {
    if (typeof fetchProfile === 'function') {
      fetchProfile()
    }
  }

  if (!pharmacy) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <EmptyState
          title="No profile data"
          description="Your pharmacy profile will appear here after login. If you continue seeing this message, contact the administrator."
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Pharmacy profile</h1>
        <p className="mt-1 text-sm text-slate-500">Keep your contact information current so patients can reach you.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="ownerName">
              Owner name
            </label>
            <input
              id="ownerName"
              name="ownerName"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
              value={formState.ownerName}
              onChange={handleChange}
              placeholder="John Patel"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="serviceRadiusKm">
              Delivery radius (km)
            </label>
            <input
              id="serviceRadiusKm"
              name="serviceRadiusKm"
              type="number"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
              value={formState.serviceRadiusKm}
              onChange={handleChange}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="phone">
              Primary phone
            </label>
            <input
              id="phone"
              name="phone"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
              value={formState.phone}
              onChange={handleChange}
              placeholder="9876543210"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="alternatePhone">
              Alternate phone
            </label>
            <input
              id="alternatePhone"
              name="alternatePhone"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
              value={formState.alternatePhone}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Registered address</label>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>{pharmacy?.address?.line1 || 'Address not available'}</p>
              {pharmacy?.address?.line2 && <p>{pharmacy.address.line2}</p>}
              <p>
                {pharmacy?.address?.city || 'City'}, {pharmacy?.address?.state || 'State'} {pharmacy?.address?.postalCode || ''}
              </p>
              <p>{pharmacy?.address?.country || 'Country'}</p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Address changes require admin approval. Contact support for updates.
            </p>
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              onClick={handleRefresh}
            >
              Refresh
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings
