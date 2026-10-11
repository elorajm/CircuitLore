import { createContext } from 'react'

// Plain context object lives here (not in AuthContext.jsx) so that file can
// stay component-only for React Fast Refresh.
export const AuthContext = createContext(undefined)
