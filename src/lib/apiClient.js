import axios from 'axios'
import { tokenStore } from './tokenStore'

const PUBLIC_PATHS = [
  '/api/auth/login/',
  '/api/auth/registration/',
  '/api/auth/password/reset/',
  '/api/auth/registration/verify-email/',
]

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use((config) => {
  const isPublic = PUBLIC_PATHS.some(p => config.url?.includes(p))
  if (!isPublic) {
    const token = tokenStore.getAccess()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // No token: let request through without header — server returns 401,
    // response interceptor handles refresh or logout
  }
  return config
})

// Response interceptor — silent 401 refresh
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}

apiClient.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config
    const status   = error.response?.status

    // Network error
    if (!error.response) {
      return Promise.reject({ status: 0, message: 'Network unreachable' })
    }

    // 5xx
    if (status >= 500) {
      return Promise.reject({ status, message: 'Server error' })
    }

    // 401 — attempt refresh (skip for login / refresh endpoints)
    const isPublic = PUBLIC_PATHS.some(p => original.url?.includes(p))
    const isRefreshEndpoint = original.url?.includes('/api/auth/token/refresh/')
    if (status === 401 && !original._retry && !isPublic && !isRefreshEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
      }

      original._retry  = true
      isRefreshing     = true
      const refresh    = tokenStore.getRefresh()

      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/api/auth/token/refresh/`,
          { refresh },
        )
        tokenStore.setTokens(data.access, refresh)
        apiClient.defaults.headers.common.Authorization = `Bearer ${data.access}`
        processQueue(null, data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return apiClient(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenStore.clearTokens()
        // Signal AuthContext to redirect
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
