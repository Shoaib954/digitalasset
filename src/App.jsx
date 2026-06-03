/* ============================================
   DigiAsset — Main App Component
   React Router v6 with protected routes
   ============================================ */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected pages
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AddAsset from './pages/AddAsset';
import Beneficiaries from './pages/Beneficiaries';
import AddBeneficiary from './pages/AddBeneficiary';
import Documents from './pages/Documents';
import DigitalWill from './pages/DigitalWill';
import InheritancePlan from './pages/InheritancePlan';
import AIAdvisor from './pages/AIAdvisor';
import AIChat from './pages/AIChat';
import Vault from './pages/Vault';
import Timeline from './pages/Timeline';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

// Protected Route — redirects to login if not authenticated
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ height: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Public Route — redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes with DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/new" element={<AddAsset />} />
        <Route path="/assets/:id" element={<AddAsset />} />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/beneficiaries/new" element={<AddBeneficiary />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/will" element={<DigitalWill />} />
        <Route path="/inheritance" element={<InheritancePlan />} />
        <Route path="/ai/advisor" element={<AIAdvisor />} />
        <Route path="/ai/chat" element={<AIChat />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
