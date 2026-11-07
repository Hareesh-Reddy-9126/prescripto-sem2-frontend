import PropTypes from 'prop-types'
import clsx from 'clsx'

const STATUS_THEME = {
  pending: 'bg-orange-50 text-orange-600 ring-orange-100',
  accepted: 'bg-sky-50 text-sky-600 ring-sky-100',
  processing: 'bg-purple-50 text-purple-600 ring-purple-100',
  ready: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  shipped: 'bg-blue-50 text-blue-600 ring-blue-100',
  completed: 'bg-green-50 text-green-600 ring-green-100',
  rejected: 'bg-rose-50 text-rose-600 ring-rose-100',
  cancelled: 'bg-slate-100 text-slate-500 ring-slate-200',
}

const humanize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')

const StatusBadge = ({ status }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
      STATUS_THEME[status] || STATUS_THEME.pending,
    )}
  >
    {humanize(status)}
  </span>
)

export default StatusBadge

StatusBadge.propTypes = {
  status: PropTypes.string,
}
