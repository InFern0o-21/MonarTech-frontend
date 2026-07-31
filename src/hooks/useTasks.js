import { useState, useCallback } from 'react'
import apiClient from '../lib/apiClient'
import { useToast } from './useToast'

export function useTasks() {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const { addToast }          = useToast()

  const fetchTasks = useCallback(async (planId) => {
    setLoading(true); setError(null)
    try {
      const { data } = await apiClient.get('/api/tasks/', { params: { plan: planId } })
      setTasks(data.results ?? data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTask = useCallback(async (payload) => {
    try {
      const { data } = await apiClient.post('/api/tasks/', payload)
      setTasks(prev => [...prev, data])
      addToast('success', 'Task created')
      return data
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to create task')
      throw err
    }
  }, [addToast])

  const updateTask = useCallback(async (id, patch) => {
    try {
      const { data } = await apiClient.patch(`/api/tasks/${id}/`, patch)
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to update task')
      throw err
    }
  }, [addToast])

  const archiveTask = useCallback(async (id) => {
    try {
      const { data } = await apiClient.patch(`/api/tasks/${id}/`, { is_archived: true })
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      addToast('success', 'Task archived')
      return data
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to archive task')
      throw err
    }
  }, [addToast])

  const deleteTask = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/tasks/${id}/`)
      setTasks(prev => prev.filter(t => t.id !== id))
      addToast('success', 'Task deleted')
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to delete task')
      throw err
    }
  }, [addToast])

  const addAssignee = useCallback(async (taskId, userId) => {
    // Duplicate guard
    const task = tasks.find(t => t.id === taskId)
    if (task?.assignees?.some(a => a.user === userId)) {
      addToast('info', 'User is already assigned to this task')
      return
    }
    try {
      const { data } = await apiClient.post('/api/task-assignees/', { task: taskId, user: userId })
      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? { ...t, assignees: [...(t.assignees ?? []), data] }
          : t
      ))
      addToast('success', 'Assignee added')
      return data
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to add assignee')
      throw err
    }
  }, [tasks, addToast])

  const removeAssignee = useCallback(async (assigneeId, taskId) => {
    try {
      await apiClient.delete(`/api/task-assignees/${assigneeId}/`)
      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? { ...t, assignees: (t.assignees ?? []).filter(a => a.id !== assigneeId) }
          : t
      ))
      addToast('success', 'Assignee removed')
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to remove assignee')
      throw err
    }
  }, [addToast])

  return { tasks, loading, error, fetchTasks, createTask, updateTask, archiveTask, deleteTask, addAssignee, removeAssignee }
}
