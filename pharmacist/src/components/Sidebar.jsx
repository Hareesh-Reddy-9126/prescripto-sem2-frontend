import { NavLink } from 'react-router-dom'
import { ClipboardDocumentListIcon, HomeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/orders', label: 'Orders', icon: ClipboardDocumentListIcon },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
]

const Sidebar = () => (
  <aside className="hidden min-h-[calc(100vh-4rem)] w-60 flex-col border-r border-slate-200 bg-white/60 px-3 py-6 md:flex">
    <nav className="space-y-1">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-brand-50 text-brand-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
            ].join(' ')
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
    <div className="mt-auto rounded-lg bg-brand-50 px-3 py-4 text-xs text-brand-700">
      Keep patients updated by moving orders through the fulfillment stages.
    </div>
  </aside>
)

export default Sidebar
