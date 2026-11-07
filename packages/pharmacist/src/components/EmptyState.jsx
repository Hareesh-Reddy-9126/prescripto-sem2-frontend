import PropTypes from 'prop-types'
import clsx from 'clsx'

const EmptyState = ({ title, description, action, className }) => (
  <div className={clsx('flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-10 py-16 text-center', className)}>
    <div className="mb-3 rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
      {title}
    </div>
    <p className="max-w-md text-sm text-slate-500">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
)

export default EmptyState

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.node,
  className: PropTypes.string,
}
