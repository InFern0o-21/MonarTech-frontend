import { useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/apiClient'

/**
 * Terminal statuses (e.g. "Done") always sort last,
 * then by `order` asc, then by `id` asc.
 */
const sortStatuses = (list) =>
  [...list].sort((a, b) => {
    if (a.is_terminal !== b.is_terminal) return a.is_terminal ? 1 : -1
    return a.order - b.order || a.id - b.id
  })

/**
 * Fetch and manage task statuses for a specific plan.
 *
 * @param {string|number} planId  - The plan to load statuses for.
 */
export function useTaskStatuses(planId) {
  const [statuses, setStatuses] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchStatuses = useCallback(async () => {
    if (!planId) return
    setLoading(true); setError(null)
    try {
      const { data } = await apiClient.get('/api/task-statuses/', { params: { plan: planId } })
      setStatuses(sortStatuses(data.results ?? data))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => { fetchStatuses() }, [fetchStatuses])

  const createStatus = useCallback(async (payload) => {
    const { data } = await apiClient.post('/api/task-statuses/', { ...payload, plan: planId })
    setStatuses(prev => sortStatuses([...prev, data]))
    return data
  }, [planId])

  const updateStatus = useCallback(async (id, patch) => {
    const { data } = await apiClient.patch(`/api/task-statuses/${id}/`, patch)
    setStatuses(prev => sortStatuses(prev.map(s => s.id === id ? data : s)))
    return data
  }, [])

  const deleteStatus = useCallback(async (id) => {
    await apiClient.delete(`/api/task-statuses/${id}/`)
    setStatuses(prev => prev.filter(s => s.id !== id))
  }, [])

  return { statuses, loading, error, refetch: fetchStatuses, createStatus, updateStatus, deleteStatus }
}
