import { useContext, useMemo } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Pharmacies from './pages/Admin/Pharmacies';
import Settings from './pages/Admin/Settings';
import DatabaseViewer from './pages/Admin/DatabaseViewer';
import Login from './pages/Login';
import DoctorRequest from './pages/DoctorRequest'
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';

const App = () => {

  const { dToken, initializing: dInitializing } = useContext(DoctorContext)
  const { aToken, initializing: aInitializing } = useContext(AdminContext)

  const defaultPath = useMemo(() => {
    if (aToken) return '/admin-dashboard'
    if (dToken) return '/doctor-dashboard'
    return '/'
  }, [aToken, dToken])

  // while either context is verifying a stored token, avoid rendering login/dashboard flashes
  if (dInitializing || aInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-600">Checking session...</div>
      </div>
    )
  }

  return dToken || aToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<Navigate to={defaultPath} replace />} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/pharmacies' element={<Pharmacies />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/database-viewer' element={<DatabaseViewer />} />
          <Route path='*' element={<Navigate to={defaultPath} replace />} />
        </Routes>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-[#F8F9FD]">
      <ToastContainer />
      <Routes>
        <Route path="/request" element={<DoctorRequest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App