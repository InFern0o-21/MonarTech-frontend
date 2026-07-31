const ACCESS_KEY  = 'monartech_access'
const REFRESH_KEY = 'monartech_refresh'

export const tokenStore = {
  getAccess:   () => localStorage.getItem(ACCESS_KEY),
  getRefresh:  () => localStorage.getItem(REFRESH_KEY),
  setTokens:   (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
