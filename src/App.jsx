import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import Interns from './pages/Interns';
import Tasks from './pages/Tasks';
import DomainsGroups from './pages/DomainsGroups';
import Directories from './pages/Directories';
import Approvals from './pages/Approvals';
import AdminReviews from './pages/AdminReviews';
import StudentReviews from './pages/StudentReviews';
import AdminMaterials from './pages/AdminMaterials';
import StudentMaterials from './pages/StudentMaterials';
import Trainers from './pages/Trainers';
import TrainerAuth from './pages/TrainerAuth';
import GroupMessages from './pages/GroupMessages';
import Attendance from './pages/Attendance';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', color: '#1e293b' }}>
    <ShieldAlert size={100} color="#ef4444" style={{ marginBottom: '2rem' }} />
    <h1 style={{ fontSize: '3rem', margin: 0 }}>ACCESS DENIED</h1>
    <p style={{ color: '#64748b', marginTop: '1rem' }}>You do not have permission to view this page.</p>
    <button className="btn btn-primary" onClick={() => window.location.href = '/'} style={{ marginTop: '2rem' }}>Go Back</button>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ background: '#f0f4f8', height: '100vh', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/trainer-login" element={<TrainerAuth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Routes>
                  <Route index element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="interns" element={<Interns />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="domains" element={<DomainsGroups />} />
                  <Route path="directories" element={<Directories />} />
                  <Route path="approvals" element={<Approvals />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="materials" element={<AdminMaterials />} />
                  <Route path="trainers" element={<Trainers />} />
                  <Route path="messages" element={<GroupMessages />} />
                  <Route path="attendance" element={<Attendance />} />
                </Routes>
              </ProtectedRoute>
            } />

            <Route path="/trainer/*" element={
              <ProtectedRoute allowedRoles={['TRAINER']}>
                <Routes>
                  <Route path="dashboard" element={<TrainerDashboard />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="materials" element={<AdminMaterials />} />
                  <Route path="domains" element={<DomainsGroups />} />
                  <Route path="messages" element={<GroupMessages />} />
                  <Route path="attendance" element={<Attendance />} />
                </Routes>
              </ProtectedRoute>
            } />

            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="reviews" element={<StudentReviews />} />
                  <Route path="materials" element={<StudentMaterials />} />
                  <Route path="messages" element={<GroupMessages />} />
                </Routes>
              </ProtectedRoute>
            } />

            <Route path="/" element={<RootRedirect />} />
          </Routes>
          <ToastContainer theme="light" position="bottom-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'TRAINER') return <Navigate to="/trainer/dashboard" />;
  return <Navigate to="/student/dashboard" />;
};

export default App;

