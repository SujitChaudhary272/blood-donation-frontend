import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--app-bg)',
        transition: 'background-color 0.3s ease'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--surface-border)',
            borderTop: '4px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && user.role !== requiredRole) {
    console.log(`Access denied. User role: ${user.role}, Required role: ${requiredRole}`);
    
    // Redirect to the correct dashboard based on user's actual role
    if (user.role === 'donor') {
      return <Navigate to="/donor-dashboard" replace />;
    } else if (user.role === 'receiver') {
      return <Navigate to="/receiver-dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has the correct role (or no role required)
  return children;
};

export default ProtectedRoute;
