import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import LearningJourney from './pages/LearningJourney.jsx'
import LessonPage from './pages/LessonPage.jsx'
import HistoricalExperience from './pages/HistoricalExperience.jsx'
import ElectricityLessons from './pages/ElectricityLessons.jsx'
import InteractiveActivities from './pages/InteractiveActivities.jsx'
import CircuitLab from './pages/CircuitLab.jsx'
import AdultDashboard from './pages/AdultDashboard.jsx'
import AdminContentManagement from './pages/AdminContentManagement.jsx'
import NotFound from './pages/NotFound.jsx'

// Dev-only: Vite replaces import.meta.env.DEV with false in production builds, so this import is dropped.
const DevProgressTestPage = import.meta.env.DEV
  ? lazy(() => import('./dev/ProgressTestPage.jsx'))
  : null

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
          <Route
            path="/journey/:lessonId"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />
          <Route path="/history" element={<HistoricalExperience />} />
          <Route path="/lessons" element={<ElectricityLessons />} />
          <Route path="/activities" element={<InteractiveActivities />} />
          <Route path="/circuit-lab" element={<CircuitLab />} />
          <Route path="/adult-dashboard" element={<AdultDashboard />} />
          <Route path="/admin" element={<AdminContentManagement />} />
          {DevProgressTestPage && (
            <Route
              path="/dev/progress-test"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<p className="loading-message">Loading&hellip;</p>}>
                    <DevProgressTestPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          )}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
