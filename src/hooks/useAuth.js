import { useContext } from 'react'
import { AuthContext } from '../context/authContextObject.js'

/** Access the current auth session, user, and auth actions from any component. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
