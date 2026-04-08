import { useContext } from 'react'
import { PharmacistContext } from '../context/PharmacistContext.jsx'
import logo from '../assets/logo.svg'

const Navbar = () => {
  const { pharmacy, logout } = useContext(PharmacistContext)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Prescripto Pharmacist" className="h-8 w-auto" />
        <span className="hidden text-sm font-medium text-slate-500 md:block">Medication fulfillment dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden flex-col text-right text-sm md:flex">
          <span className="font-semibold text-slate-700">{pharmacy?.name || 'Pharmacist'}</span>
          <span className="text-xs text-slate-500">{pharmacy?.email || '—'}</span>
        </div>
        <button
          onClick={logout}
          className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar
