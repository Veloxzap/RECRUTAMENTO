import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/useAuthStore'
import { PrivateRoute } from './components/layout/PrivateRoute'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Candidates from './pages/Candidates'
import WorkLocations from './pages/WorkLocations'
import TestLocations from './pages/TestLocations'
import Vacancies from './pages/Vacancies'

function App() {
  const { setUser } = useAuthStore()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/candidatos" element={<Candidates />} />
          <Route path="/vagas" element={<Vacancies />} />
          <Route path="/locais-atuacao" element={<WorkLocations />} />
          <Route path="/locais-teste" element={<TestLocations />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
