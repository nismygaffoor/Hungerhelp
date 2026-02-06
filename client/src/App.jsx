import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

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

import DonorDashboard from './pages/DonorDashboard';
import BeneficiaryDashboard from './pages/BeneficiaryDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard'; // Import New Component

// Placeholder Home/Dashboard
const Home = () => {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-green-600 flex items-center gap-2">
          🍔 HungerHelp
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="font-bold text-sm">{user.name}</p>
            <p className="text-xs text-gray-500 uppercase">{user.role}</p>
          </div>
          <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium text-sm border border-red-200 px-3 py-1 rounded">Logout</button>
        </div>
      </nav>
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Here is your {user.role} dashboard.</p>
        </div>

        {/* Conditional Dashboard Rendering */}
        {user.role === 'Donor' && <DonorDashboard user={user} />}
        {user.role === 'Beneficiary' && <BeneficiaryDashboard />}
        {user.role === 'Volunteer' && <VolunteerDashboard />}
        {user.role === 'Admin' && <AdminDashboard />}

      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
