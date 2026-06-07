import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AIAssistant from './components/AIAssistant';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Flights from './pages/Flights';
import Booking from './pages/Booking';
import PassengerDashboard from './pages/PassengerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/flights" element={<Flights />} />

              {/* Protected Routes */}
              <Route 
                path="/booking/:id" 
                element={
                  <ProtectedRoute allowedRoles={['Passenger', 'Staff', 'Administrator']}>
                    <Booking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/passenger" 
                element={
                  <ProtectedRoute allowedRoles={['Passenger']}>
                    <PassengerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute allowedRoles={['Administrator']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/staff" 
                element={
                  <ProtectedRoute allowedRoles={['Staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <AIAssistant />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
