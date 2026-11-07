import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import StatusBadge from './StatusBadge.jsx'

const OrderCard = ({ order, onSelect }) => {
  const patient = order?.patientSnapshot || {}
  const createdLabel = order?.createdAt ? dayjs(order.createdAt).format('DD MMM, HH:mm') : '—'

  return (
    <button
      onClick={() => onSelect(order)}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Order #{order.orderNumber}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-800">{patient.name || 'Unknown patient'}</h3>
          <p className="text-sm text-slate-500">{patient.phone}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 md:grid-cols-4">
        <div>
          <dt className="font-medium text-slate-400">Placed</dt>
          <dd>{createdLabel}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">Medicines</dt>
          <dd>{order?.prescriptionSnapshot?.medications?.length || 0}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">Logistics</dt>
          <dd className="capitalize">{order?.logistics?.method || 'pickup'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-400">Amount</dt>
          <dd>{order.totalAmount ? `₹${order.totalAmount}` : 'Pending'}</dd>
        </div>
      </dl>
    </button>
  )
}

export default OrderCard

OrderCard.propTypes = {
  order: PropTypes.shape({
    orderNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    totalAmount: PropTypes.number,
    patientSnapshot: PropTypes.shape({
      name: PropTypes.string,
      phone: PropTypes.string,
    }),
    prescriptionSnapshot: PropTypes.shape({
      medications: PropTypes.arrayOf(PropTypes.object),
    }),
    logistics: PropTypes.shape({
      method: PropTypes.string,
    }),
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
}
