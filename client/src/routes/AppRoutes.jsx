import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import FlightSearchPage from '../pages/FlightSearchPage';
import FlightDetailsPage from '../pages/FlightDetailsPage';
import BookingPage from '../pages/BookingPage';
import UserDashboardPage from '../pages/UserDashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/flights" element={<FlightSearchPage />} />
      <Route path="/flights/:id" element={<FlightDetailsPage />} />
      <Route
        path="/booking/:flightId"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
