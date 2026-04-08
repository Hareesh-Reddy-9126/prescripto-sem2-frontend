import { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const Settings = () => {
  const { platformSettings, loadPlatformSettings, savePlatformSettings } = useContext(AdminContext)
  const [form, setForm] = useState({
    consultationFee: 499,
    cancellationWindowHours: 12,
    videoProvider: 'jitsi',
    emergencyContact: '',
    allowedDeliveryRadiusKm: 15,
    enforceMfa: false,
    sessionTimeoutMinutes: 60,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPlatformSettings()
  }, [loadPlatformSettings])

  useEffect(() => {
    if (platformSettings) {
      setForm({
        consultationFee: platformSettings.consultationFee ?? 499,
        cancellationWindowHours: platformSettings.cancellationWindowHours ?? 12,
        videoProvider: platformSettings.videoProvider ?? 'jitsi',
        emergencyContact: platformSettings.emergencyContact ?? '',
        allowedDeliveryRadiusKm: platformSettings.allowedDeliveryRadiusKm ?? 15,
        enforceMfa: platformSettings.security?.enforceMfa ?? false,
        sessionTimeoutMinutes: platformSettings.security?.sessionTimeoutMinutes ?? 60,
      })
    }
  }, [platformSettings])

  const handleChange = (field) => (event) => {
    const value = field === 'enforceMfa' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await savePlatformSettings({
        consultationFee: Number(form.consultationFee),
        cancellationWindowHours: Number(form.cancellationWindowHours),
        videoProvider: form.videoProvider,
        emergencyContact: form.emergencyContact,
        allowedDeliveryRadiusKm: Number(form.allowedDeliveryRadiusKm),
        security: {
          enforceMfa: form.enforceMfa,
          sessionTimeoutMinutes: Number(form.sessionTimeoutMinutes),
        },
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="m-5 w-full max-w-4xl">
      <h1 className="mb-4 text-lg font-semibold text-slate-800">Platform Settings</h1>
      <p className="mb-6 text-sm text-slate-500">
        Configure how consultations, cancellations, and security behave across the platform.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Default consultation fee (₹)
            <input
              type="number"
              min="0"
              value={form.consultationFee}
              onChange={handleChange('consultationFee')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Cancellation window (hours)
            <input
              type="number"
              min="0"
              value={form.cancellationWindowHours}
              onChange={handleChange('cancellationWindowHours')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Video provider
            <select
              value={form.videoProvider}
              onChange={handleChange('videoProvider')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="jitsi">Jitsi Meet (default)</option>
              <option value="daily">Daily</option>
              <option value="zoom">Zoom</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Platform emergency contact
            <input
              type="tel"
              value={form.emergencyContact}
              onChange={handleChange('emergencyContact')}
              placeholder="e.g. +91 9876543210"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Pharmacy delivery radius (km)
            <input
              type="number"
              min="1"
              value={form.allowedDeliveryRadiusKm}
              onChange={handleChange('allowedDeliveryRadiusKm')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-col justify-end rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input type="checkbox" checked={form.enforceMfa} onChange={handleChange('enforceMfa')} />
              Require MFA for admins
            </label>
            <label className="mt-3 text-xs uppercase tracking-wider text-slate-500">
              Session timeout (minutes)
              <input
                type="number"
                min="15"
                step="5"
                value={form.sessionTimeoutMinutes}
                onChange={handleChange('sessionTimeoutMinutes')}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
