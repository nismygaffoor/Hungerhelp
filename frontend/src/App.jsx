import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-10 text-center text-red-500">Access Denied: You do not have permission to view this page.</div>;
  }

  return children;
};

import DonorDashboard from './pages/Donor/DonorDashboard';
import BeneficiaryDashboard from './pages/Benificiary/BeneficiaryDashboard';
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Placeholder Home/Dashboard
const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      {/* Role-Based Dashboards (Each has its own layout) */}
      {user.role === 'Donor' && <DonorDashboard user={user} />}
      {user.role === 'Beneficiary' && <BeneficiaryDashboard />}
      {user.role === 'Volunteer' && <VolunteerDashboard />}
      {user.role === 'Admin' && <AdminDashboard />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
