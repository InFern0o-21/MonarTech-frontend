import { useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { useToast } from './useToast'

export function useWorkgroups() {
  const [workgroups, setWorkgroups] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const { addToast } = useToast()

  const fetchWorkgroups = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await apiClient.get('/api/workgroups/')
      setWorkgroups(data.results ?? data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWorkgroups() }, [fetchWorkgroups])

  const createWorkgroup = useCallback(async (payload) => {
    try {
      const { data } = await apiClient.post('/api/workgroups/', payload)
      setWorkgroups(prev => [...prev, data])
      addToast('success', 'Workgroup created')
      return data
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 403) {
        addToast('error', 'You do not have permission to perform this action.')
      } else {
        const msg = err?.response?.data?.detail ?? 'Something went wrong. Please try again.'
        addToast('error', msg)
      }
      throw err
    }
  }, [addToast])

  const updateWorkgroup = useCallback(async (id, patch) => {
    try {
      const { data } = await apiClient.patch(`/api/workgroups/${id}/`, patch)
      setWorkgroups(prev => prev.map(w => w.id === id ? data : w))
      addToast('success', 'Workgroup updated')
      return data
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 403) {
        addToast('error', 'You do not have permission to perform this action.')
      } else {
        addToast('error', 'Something went wrong. Please try again.')
      }
      throw err
    }
  }, [addToast])

  const deleteWorkgroup = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/workgroups/${id}/`)
      setWorkgroups(prev => prev.filter(w => w.id !== id))
      addToast('success', 'Workgroup deleted')
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 403) {
        addToast('error', 'You do not have permission to perform this action.')
      } else {
        addToast('error', 'Something went wrong. Please try again.')
      }
      throw err
    }
  }, [addToast])

  return { workgroups, loading, error, refetch: fetchWorkgroups, createWorkgroup, updateWorkgroup, deleteWorkgroup }
}
