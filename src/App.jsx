import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages (EXACT file names + explicit extensions)
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Donorsignup from './pages/Donorsignup.jsx';
import Receiversignup from './pages/Receiversignup.jsx';
import Donordashboard from './pages/Donordashboard.jsx';
import Receiverdashboard from './pages/Receiverdashboard.jsx';
import Search from './pages/Search.jsx';
import DonorRegistration from './pages/DonorRegistration.jsx';
import Receiverregistration from './pages/Receiverregistration.jsx';
import RequestBlood from './pages/RequestBlood.jsx';
import AboutUs from './pages/Aboutus.jsx';
import Viewalldonors from './pages/Viewalldonors.jsx';
import Viewbloodrequests from './pages/Viewbloodrequests.jsx';

function AppContent() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <div key={location.pathname} className="page-transition">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor-signup" element={<Donorsignup />} />
          <Route path="/receiver-signup" element={<Receiversignup />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Protected Routes - Donor Dashboard (Only donors can access) */}
          <Route
            path="/donor-dashboard"
            element={
              <ProtectedRoute requiredRole="donor">
                <Donordashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Receiver Dashboard (Only receivers can access) */}
          <Route
            path="/receiver-dashboard"
            element={
              <ProtectedRoute requiredRole="receiver">
                <Receiverdashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Donor Registration (Only donors can access) */}
          <Route
            path="/donor-registration"
            element={
              <ProtectedRoute requiredRole="donor">
                <DonorRegistration />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Receiver Registration (Only receivers can access) */}
          <Route
            path="/receiver-registration"
            element={
              <ProtectedRoute requiredRole="receiver">
                <Receiverregistration />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Request Blood (Only receivers can access) */}
          <Route
            path="/request-blood"
            element={
              <ProtectedRoute requiredRole="receiver">
                <RequestBlood />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - View All Donors (Both donor and receiver can access) */}
          <Route
            path="/view-all-donors"
            element={
              <ProtectedRoute requiredRole="receiver">
                <Viewalldonors />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - View Blood Requests (Both donor and receiver can access) */}
          <Route
            path="/view-blood-requests"
            element={
              <ProtectedRoute>
                <Viewbloodrequests />
              </ProtectedRoute>
            }
          />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
