import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import ChangePassword from './components/auth/ChangePassword';
import CompleteProfile from './components/auth/CompleteProfile';
import AdminDashboard from './components/pages/AdminPage/AdminDashboard';
import CommissionerDashboard from './components/pages/CommissionerDashboard';
import CommitteeDashboard from './components/pages/CommitteeDashboard';
import CommitteeSecretaryDashboard from './components/pages/secretary/CommitteeSecretaryDashboard';
import { useAuth } from './context/AuthContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/complete-profile" 
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute check:", {
    isAuthenticated,
    user,
    currentPath: location.pathname,
    firstLogin: user?.firstLogin,
    profileComplete: user?.profileComplete
  });
  
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (user?.firstLogin && !location.pathname.includes('/change-password')) {
    console.log("First login, redirecting to change-password");
    return <Navigate to="/change-password" replace />;
  }

  if (
    !user?.profileComplete && 
    !user?.firstLogin &&
    !location.pathname.includes('/complete-profile')
  ) {
    console.log("Profile not complete, redirecting to complete-profile");
    return <Navigate to="/complete-profile" replace />;
  }

  if (
    !user?.firstLogin && 
    user?.profileComplete &&
    !location.pathname.includes('/dashboard')
  ) {
    console.log("All complete, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Rendering children component");
  return children;
};

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  // Enhanced debug logging
  console.log("RoleBasedDashboard - Full user object:", user);
  console.log("Routing user with role:", user.role, "memberType:", user.memberType);
  console.log("All user properties:", Object.keys(user));
  
  // First, check if the user is an ADMIN
  if (user.role === 'ADMIN') {
    console.log("Routing to AdminDashboard");
    return <AdminDashboard />;
  }
  
  // Then, check if the user is a SECRETARY (regardless of role)
  if (user.memberType === 'SECRETARY') {
    console.log("Routing to CommitteeSecretaryDashboard");
    return <CommitteeSecretaryDashboard />;
  }
  
  // Next, handle other specific roles
  if (user.role === 'COMMISSIONER_GENERAL') {
    console.log("Routing to CommissionerDashboard");
    return <CommissionerDashboard />;
  }
  
  // Handle Committee Member - they need position check
  if (user.role === 'COMMITTEE_MEMBER') {
    console.log("User is COMMITTEE_MEMBER with positionInERA:", user.positionInERA);
    // Check if the user has position data (from backend)
    if (user.positionInERA) {
      return <CommitteeDashboard />;
    }
  }
  
  console.log("No matching routing rules found");
  return <div>Unknown user role or insufficient user data</div>;
};

export default App;