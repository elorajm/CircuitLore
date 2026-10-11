import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import LearningJourney from './pages/LearningJourney.jsx'
import HistoricalExperience from './pages/HistoricalExperience.jsx'
import ElectricityLessons from './pages/ElectricityLessons.jsx'
import InteractiveActivities from './pages/InteractiveActivities.jsx'
import CircuitLab from './pages/CircuitLab.jsx'
import AdultDashboard from './pages/AdultDashboard.jsx'
import AdminContentManagement from './pages/AdminContentManagement.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/journey" element={<LearningJourney />} />
          <Route path="/history" element={<HistoricalExperience />} />
          <Route path="/lessons" element={<ElectricityLessons />} />
          <Route path="/activities" element={<InteractiveActivities />} />
          <Route path="/circuit-lab" element={<CircuitLab />} />
          <Route path="/adult-dashboard" element={<AdultDashboard />} />
          <Route path="/admin" element={<AdminContentManagement />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
