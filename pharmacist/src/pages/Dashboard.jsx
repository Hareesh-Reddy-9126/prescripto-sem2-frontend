import { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import EmptyState from '../components/EmptyState.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { PharmacistContext } from '../context/PharmacistContext.jsx'

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
  </div>
)

const Dashboard = () => {
  const { dashboard, fetchDashboard, orders } = useContext(PharmacistContext)

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : []

  return (
    <div className="flex-1 space-y-8 overflow-y-auto px-6 py-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Track fulfillment progress and keep patients informed.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={dashboard?.totalOrders ?? 0} hint="All time" />
        <StatCard label="Pending" value={dashboard?.pending ?? 0} hint="Waiting for action" />
        <StatCard label="In progress" value={dashboard?.inProgress ?? 0} hint="Accepted, processing or in transit" />
        <StatCard label="Completed" value={dashboard?.completed ?? 0} hint="Delivered to patient" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Latest orders</h2>
          <span className="text-sm text-brand-600">Updated just now</span>
        </div>
        <div className="mt-6 space-y-4">
          {recentOrders.length === 0 && (
            <EmptyState
              title="No orders yet"
              description="Once a patient chooses this pharmacy during checkout, their prescriptions will appear here for fulfillment."
            />
          )}
          {recentOrders.map((order) => (
            <div key={order._id} className="flex flex-wrap items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-700">Order #{order.orderNumber}</span>
                <span className="text-xs text-slate-500">{order.createdAt ? dayjs(order.createdAt).format('DD MMM YYYY, HH:mm') : 'Date unavailable'}</span>
              </div>
              <div className="flex flex-col text-right">
                <StatusBadge status={order.status} />
                <span className="mt-1 text-xs text-slate-500">{order?.patientSnapshot?.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  hint: PropTypes.string,
}

export default Dashboard
