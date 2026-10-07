/**
 * PlansContext — single source of truth for the user's plan list.
 *
 * Design decisions:
 * - Fetched ONCE on user login (not on every navigation).
 * - Mutations (create, delete) update local state immediately from the
 *   API response — no refetch needed.
 * - `refreshPlans()` is available for the rare case where a full sync
 *   is needed (e.g. user was added to a plan by someone else).
 * - The `plan:created` custom event is still dispatched for backwards
 *   compatibility but no longer triggers a refetch — just updates state.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { useAuth } from '../hooks/useAuth'

const PlansContext = createContext(null)

export function PlansProvider({ children }) {
  const { user } = useAuth()

  const [plans,        setPlans]        = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError,   setPlansError]   = useState(false)

  const fetchPlans = useCallback(async () => {
    if (!user) return
    setPlansLoading(true)
    setPlansError(false)
    try {
      const { data } = await apiClient.get('/api/plans/')
      setPlans(data.results ?? data)
    } catch {
      setPlansError(true)
    } finally {
      setPlansLoading(false)
    }
  }, [user?.id])

  // Fetch once when the user logs in
  useEffect(() => {
    if (user) fetchPlans()
    else { setPlans([]); setPlansLoading(false) }
  }, [user?.id])

  /** Called after a successful POST /api/plans/ — push new plan into state */
  const addPlan = useCallback((newPlan) => {
    setPlans(prev => {
      // Avoid duplicates (e.g. if called twice)
      if (prev.some(p => p.id === newPlan.id)) return prev
      return [...prev, newPlan]
    })
  }, [])

  /** Called after a successful DELETE /api/plans/:id/ */
  const removePlan = useCallback((planId) => {
    setPlans(prev => prev.filter(p => p.id !== planId))
  }, [])

  /** Update a plan in state (e.g. after rename) */
  const updatePlan = useCallback((updated) => {
    setPlans(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
  }, [])

  /** Force full refetch — use sparingly */
  const refreshPlans = useCallback(() => fetchPlans(), [fetchPlans])

  return (
    <PlansContext.Provider value={{
      plans,
      plansLoading,
      plansError,
      addPlan,
      removePlan,
      updatePlan,
      refreshPlans,
    }}>
      {children}
    </PlansContext.Provider>
  )
}

export function usePlans() {
  const ctx = useContext(PlansContext)
  if (!ctx) throw new Error('usePlans must be used inside PlansProvider')
  return ctx
}
