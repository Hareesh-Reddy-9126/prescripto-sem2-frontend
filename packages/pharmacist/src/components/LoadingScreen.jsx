import PropTypes from 'prop-types'

const LoadingScreen = ({ label = 'Loading...' }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fa] text-slate-500">
    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
    <p className="text-sm font-medium">{label}</p>
  </div>
)

export default LoadingScreen

LoadingScreen.propTypes = {
  label: PropTypes.string,
}
