import { useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { useToast } from './useToast'

export function usePlans(params = {}) {
  const [plans, setPlans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const { addToast }          = useToast()

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/api/plans/', { params })
      setPlans(data.results ?? data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  const createPlan = useCallback(async (payload) => {
    try {
      const { data } = await apiClient.post('/api/plans/', payload)
      setPlans(prev => [...prev, data])
      addToast('success', 'Plan created')
      return data
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to create plan')
      throw err
    }
  }, [addToast])

  const archivePlan = useCallback(async (id) => {
    try {
      const { data } = await apiClient.patch(`/api/plans/${id}/`, { is_archived: true })
      setPlans(prev => prev.map(p => p.id === id ? data : p))
      addToast('success', 'Plan archived')
      return data
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to archive plan')
      throw err
    }
  }, [addToast])

  const deletePlan = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/plans/${id}/`)
      setPlans(prev => prev.filter(p => p.id !== id))
      addToast('success', 'Plan deleted')
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to delete plan')
      throw err
    }
  }, [addToast])

  const sharePlan = useCallback(async (payload) => {
    try {
      const { data } = await apiClient.post('/api/user-plans/', payload)
      addToast('success', 'Plan shared')
      return data
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to share plan')
      throw err
    }
  }, [addToast])

  return { plans, loading, error, refetch: fetchPlans, createPlan, archivePlan, deletePlan, sharePlan }
}
