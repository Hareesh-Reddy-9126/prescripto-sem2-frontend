import PropTypes from 'prop-types'
import dayjs from 'dayjs'

const StatusTimeline = ({ items = [] }) => (
  <ol className="relative space-y-4 border-l border-slate-200 pl-4">
    {items.length === 0 && (
      <li className="text-sm text-slate-500">No status updates yet.</li>
    )}
    {items.map((item, index) => (
      <li key={`${item.status}-${index}`} className="ml-2">
        <div className="absolute -left-[9px] mt-1 h-2.5 w-2.5 rounded-full border border-white bg-brand-500"></div>
        <p className="text-sm font-semibold capitalize text-slate-700">{item.status}</p>
        <p className="text-xs text-slate-500">{item.timestamp ? dayjs(item.timestamp).format('DD MMM YYYY, HH:mm') : '—'}</p>
        {item.note && <p className="mt-1 text-sm text-slate-600">{item.note}</p>}
      </li>
    ))}
  </ol>
)

export default StatusTimeline

StatusTimeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
      note: PropTypes.string,
    }),
  ),
}
