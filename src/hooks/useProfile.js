import { useState, useEffect, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { useToast } from './useToast'

export function diffProfile(original, edits) {
  return Object.fromEntries(
    Object.entries(edits).filter(([k, v]) => v !== original[k])
  )
}

export function useProfile() {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const { addToast }            = useToast()

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await apiClient.get('/api/users/me/')
      setProfile(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = useCallback(async (edits) => {
    const patch = diffProfile(profile ?? {}, edits)
    if (Object.keys(patch).length === 0) return profile
    try {
      const { data } = await apiClient.patch('/api/users/me/', patch)
      setProfile(data)
      addToast('success', 'Profile updated', { duration: 5000 })
      return data
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to update profile')
      throw err
    }
  }, [profile, addToast])

  return { profile, loading, error, fetchProfile, updateProfile }
}
