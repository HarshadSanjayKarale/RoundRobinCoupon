import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './components/Home';
import ClaimHistory from './components/ClaimHistory';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ManageCoupon from './components/ManageCoupon';
import UserClaims from './components/UserClaims';
import Navbar from './components/Navbar';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount and when localStorage changes
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      setIsAuthenticated(token !== null);
    };

    checkAuth();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<ClaimHistory />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-coupon" 
              element={
                <ProtectedRoute>
                  <ManageCoupon />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-coupon/:id" 
              element={
                <ProtectedRoute>
                  <ManageCoupon />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/claims" 
              element={
                <ProtectedRoute>
                  <UserClaims />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}