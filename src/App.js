import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import AuthSystem from "./AuthSystem";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import FloorMap from "./FloorMap";
import { useAuth } from "./AuthContext";

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, authError } = useAuth();

  useEffect(() => {
    const checkAuthenticationStatus = async () => {
      setIsAdminLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // Check if user is admin
        try {
          const response = await fetch(`/api/check-admin/${currentUser.uid}`);
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } finally {
          setIsAdminLoading(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsAdminLoading(false);
      }
    };
    
    checkAuthenticationStatus();
  }, [currentUser]);

  const handleLogin = ({ user, isAdmin }) => {
    console.log("Login handler called:", { user, isAdmin });
    setUser(user);
    setIsAdmin(isAdmin);
  };

  const overallLoading = authLoading || isAdminLoading;

  if (overallLoading) {
    console.log("App is loading (auth or admin check)...");
    return <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-white">Loading...</div>
    </div>;
  }

  if (authError) {
    console.error("Auth error in App:", authError);
    return <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-red-500">Authentication Error: {authError.message}</div>
    </div>;
  }

  // Protected Route component
  const ProtectedRoute = ({ children, requireAdmin }) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }
    if (requireAdmin && !isAdmin) {
      return <Navigate to="/userdashboard" replace />;
    }
    return children;
  };

  console.log("Rendering App with routes");
  return (
    <Routes>
      <Route path="/" element={<AuthSystem onLogin={handleLogin} />} />
      {user && !isAdmin && (
         <Route path="/userdashboard" element={<UserDashboard user={user} />} />
      )}
      {user && isAdmin && (
         <Route path="/admindashboard" element={<AdminDashboard user={user} />} />
      )}
      {user && !overallLoading && !isAdmin && <Route path="*" element={<Navigate to="/userdashboard" replace />} />}
      {user && !overallLoading && isAdmin && <Route path="*" element={<Navigate to="/admindashboard" replace />} />}
      {!user && !overallLoading && <Route path="*" element={<Navigate to="/" replace />} />}
      <Route 
        path="/userdashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard user={user} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admindashboard" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard user={user} />
          </ProtectedRoute>
        } 
      />
      <Route path="/floormap" element={<FloorMap />} />
    </Routes>
  );
}

export default App;
