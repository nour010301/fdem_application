import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

// --- Token Utilities ---
function getAccessToken(): string | null {
  return localStorage.getItem('access')
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refresh')
}

function setAccessToken(token: string): void {
  localStorage.setItem('access', token)
}

function clearTokens(): void {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  window.location.href = '/login' // Optional: redirect to login
}

// --- Create Axios Instance ---
const instance: AxiosInstance = axios.create({
  baseURL: 'http://10.10.150.75:8000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Request Interceptor ---
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- Response Interceptor ---
instance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refresh = getRefreshToken()
      if (!refresh) {
        clearTokens()
        return Promise.reject(error)
      }

      try {
        const refreshResponse = await axios.post('http://10.10.150.75:8000/accounts/api/refresh/', {
          refresh: refresh,
        })

        const newAccess = refreshResponse.data.access
        setAccessToken(newAccess)

        originalRequest.headers.Authorization = `Bearer ${newAccess}`

        return instance(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        clearTokens()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default instance
