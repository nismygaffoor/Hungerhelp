import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/Admin/AdminLogin';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import About from './pages/About';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Determine if we're trying to access an ADMIN route
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const isAdminLoginPage = window.location.pathname === '/admin/login';

    if (isAdminRoute && !isAdminLoginPage) {
      return <Navigate to="/admin/login" replace />;
    }

    // Only redirect to public login if NOT already on an admin login page
    if (!isAdminLoginPage) {
      return <Navigate to="/login" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-10 text-center text-red-500">Access Denied: You do not have permission to view this page.</div>;
  }

  return children;
};

// Donor Pages
import DonorDashboard from './pages/Donor/Dashboard';
import PostFood from './pages/Donor/PostFood';
import MyDonations from './pages/Donor/MyDonations';
import DonationDetail from './pages/Donor/DonationDetail';
import DonorProfile from './pages/Donor/Profile';
import DonorRecurring from './pages/Donor/Recurring';
import DonorFeedback from './pages/Donor/Feedback';

// Beneficiary Pages
import BeneficiaryDashboard from './pages/Benificiary/Dashboard';
import ClaimFoods from './pages/Benificiary/ClaimFoods';
import MyClaims from './pages/Benificiary/MyClaims';
import BeneficiaryDonationDetail from './pages/Benificiary/BeneficiaryDonationDetail';
import BeneficiaryProfile from './pages/Benificiary/Profile';
import BeneficiaryRequest from './pages/Benificiary/Request';
import BeneficiaryFeedback from './pages/Benificiary/Feedback';

// Volunteer Pages
import VolunteerDashboard from './pages/Volunteer/Dashboard';
import VolunteerProfile from './pages/Volunteer/Profile';
import VolunteerTasks from './pages/Volunteer/Tasks';
import VolunteerHistory from './pages/Volunteer/History';
import VolunteerFeedback from './pages/Volunteer/Feedback';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProfile from './pages/Admin/Profile';
import AdminUsers from './pages/Admin/Users';
import AdminPosts from './pages/Admin/Posts';
import AdminRequests from './pages/Admin/Requests';
import AdminDeliveries from './pages/Admin/Deliveries';
import AdminStats from './pages/Admin/Stats';
import AdminFeedback from './pages/Admin/Feedback';

// Role-Based Home Redirect
const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'Donor') return <Navigate to="/donor/dashboard" replace />;
  if (user.role === 'Beneficiary') return <Navigate to="/beneficiary/dashboard" replace />;
  if (user.role === 'Volunteer') return <Navigate to="/volunteer/dashboard" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/adminlogin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />

          {/* Core Redirect */}
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          {/* Donor Routes */}
          <Route path="/donor/dashboard" element={<ProtectedRoute allowedRoles={['Donor']}><DonorDashboard /></ProtectedRoute>} />
          <Route path="/donor/profile" element={<ProtectedRoute allowedRoles={['Donor']}><DonorProfile /></ProtectedRoute>} />
          <Route path="/donor/post" element={<ProtectedRoute allowedRoles={['Donor']}><PostFood /></ProtectedRoute>} />
          <Route path="/donor/recurring" element={<ProtectedRoute allowedRoles={['Donor']}><DonorRecurring /></ProtectedRoute>} />
          <Route path="/donor/history" element={<ProtectedRoute allowedRoles={['Donor']}><MyDonations /></ProtectedRoute>} />
          <Route path="/donor/donation/:id" element={<ProtectedRoute allowedRoles={['Donor']}><DonationDetail /></ProtectedRoute>} />
          <Route path="/donor/feedback" element={<ProtectedRoute allowedRoles={['Donor']}><DonorFeedback /></ProtectedRoute>} />

          {/* Beneficiary Routes */}
          <Route path="/beneficiary/dashboard" element={<ProtectedRoute allowedRoles={['Beneficiary']}><BeneficiaryDashboard /></ProtectedRoute>} />
          <Route path="/beneficiary/profile" element={<ProtectedRoute allowedRoles={['Beneficiary']}><BeneficiaryProfile /></ProtectedRoute>} />
          <Route path="/beneficiary/claim" element={<ProtectedRoute allowedRoles={['Beneficiary']}><ClaimFoods /></ProtectedRoute>} />
          <Route path="/beneficiary/history" element={<ProtectedRoute allowedRoles={['Beneficiary']}><MyClaims /></ProtectedRoute>} />
          <Route path="/beneficiary/donation/:id" element={<ProtectedRoute allowedRoles={['Beneficiary']}><BeneficiaryDonationDetail /></ProtectedRoute>} />
          <Route path="/beneficiary/request" element={<ProtectedRoute allowedRoles={['Beneficiary']}><BeneficiaryRequest /></ProtectedRoute>} />
          <Route path="/beneficiary/feedback" element={<ProtectedRoute allowedRoles={['Beneficiary']}><BeneficiaryFeedback /></ProtectedRoute>} />

          {/* Volunteer Routes */}
          <Route path="/volunteer/dashboard" element={<ProtectedRoute allowedRoles={['Volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="/volunteer/profile" element={<ProtectedRoute allowedRoles={['Volunteer']}><VolunteerProfile /></ProtectedRoute>} />
          <Route path="/volunteer/tasks" element={<ProtectedRoute allowedRoles={['Volunteer']}><VolunteerTasks /></ProtectedRoute>} />
          <Route path="/volunteer/history" element={<ProtectedRoute allowedRoles={['Volunteer']}><VolunteerHistory /></ProtectedRoute>} />
          <Route path="/volunteer/feedback" element={<ProtectedRoute allowedRoles={['Volunteer']}><VolunteerFeedback /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['Admin']}><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['Admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/posts" element={<ProtectedRoute allowedRoles={['Admin']}><AdminPosts /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['Admin']}><AdminRequests /></ProtectedRoute>} />
          <Route path="/admin/deliveries" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDeliveries /></ProtectedRoute>} />
          <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={['Admin']}><AdminStats /></ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute allowedRoles={['Admin']}><AdminFeedback /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
