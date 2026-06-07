import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import AIAssistant from './components/AIAssistant'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Flights from './pages/Flights'
import Booking from './pages/Booking'
import PassengerDashboard from './pages/PassengerDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/flights" element={<Flights />} />
              <Route 
                path="/booking/:flightId" 
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <PassengerDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <AIAssistant />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
