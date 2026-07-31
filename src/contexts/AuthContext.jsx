import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import apiClient from '../lib/apiClient'
import { tokenStore } from '../lib/tokenStore'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, initialising: true })

  // Keep a stable ref so the window event listener always calls the latest logout
  const logoutRef = useRef(null)

  // ---------------------------------------------------------------------------
  // logout — defined first so login can reference it
  // ---------------------------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout/')
    } catch {
      // intentionally ignored
    }
    tokenStore.clearTokens()
    setState(prev => ({ ...prev, user: null }))
  }, [])

  // Keep ref in sync
  useEffect(() => {
    logoutRef.current = logout
  }, [logout])

  // ---------------------------------------------------------------------------
  // Mount: restore session from stored token
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const access = tokenStore.getAccess()
      if (!access) {
        setState({ user: null, initialising: false })
        return
      }

      try {
        const { data } = await apiClient.get('/api/users/me/')
        if (!cancelled) setState({ user: data, initialising: false })
      } catch (err) {
        const status = err?.response?.status ?? err?.status
        if (status === 401) {
          tokenStore.clearTokens()
        }
        if (!cancelled) setState({ user: null, initialising: false })
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [])

  // ---------------------------------------------------------------------------
  // Listen for auth:logout dispatched by apiClient interceptor
  // ---------------------------------------------------------------------------
  useEffect(() => {
    function handleAuthLogout() {
      logoutRef.current?.()
    }
    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [])

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const login = useCallback(async (email, password, signal) => {
    const { data } = await apiClient.post(
      '/api/auth/login/',
      { email, password },
      { signal },
    )
    tokenStore.setTokens(data.access, data.refresh)

    try {
      const { data: user } = await apiClient.get('/api/users/me/', { signal })
      setState(prev => ({ ...prev, user }))
    } catch (err) {
      tokenStore.clearTokens()
      throw err
    }
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await apiClient.post('/api/auth/registration/', payload)
    return data
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await apiClient.get('/api/users/me/')
    setState(prev => ({ ...prev, user: data }))
  }, [])

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------
  const value = {
    user: state.user,
    initialising: state.initialising,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
