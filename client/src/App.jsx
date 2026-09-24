import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import Home from './pages/Home'
import LoginLanding from './pages/LoginLanding'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import Employee from './pages/Employee'
import Attendance from './pages/Attendance'
import Leave from './pages/Leave'
import Payslips from './pages/Payslips'
import Settings from './pages/Settings'
import PrintPayslip from './pages/PrintPayslip'

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        {/* public landing page — no auth required */}
        <Route path='/' element={<Home />} />

        <Route path='/login' element={<LoginLanding />} />

        <Route path='/login/admin' element={<LoginForm role="admin" title="Admin Portal" subtitle="Sign in to the administrator panel" />} />
        <Route path='/login/employee' element={<LoginForm role="employee" title="Team Portal" subtitle="Access your team portal" />} />


        <Route element={<Layout />} >
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/employees' element={<Employee />} />
          <Route path='/attendance' element={<Attendance />} />
          <Route path='/leave' element={<Leave />} />
          <Route path='/payslips' element={<Payslips />} />
          <Route path='/settings' element={<Settings />} />
        </Route>
           <Route path='/print/payslips/:id' element={<PrintPayslip />} />

             <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>

    </>
  )
}

export default App