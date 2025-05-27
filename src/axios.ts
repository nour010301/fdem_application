import axios from 'axios'
import router from './router'

const instance = axios.create({
  // baseURL: 'http://10.10.150.75:8000/api/',
   //
   //  Your backend API base URL
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Flag to prevent multiple refresh requests at once
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

// Attach access token to each request if available
instance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Handle expired tokens and refresh automatically
instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If 401 Unauthorized AND it's not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        // No refresh token - logout user
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        router.push('/login')
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return axios(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      isRefreshing = true

      try {
        // const response = await axios.post('http://10.10.150.75:8000/api/token/refresh/', {
        //   refresh: refreshToken,
        // })
          const response = await axios.post(`${import.meta.env.VITE_API_URL}token/refresh/`, {
            refresh: refreshToken,
          })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        instance.defaults.headers.common['Authorization'] = `Bearer ${access}`
        processQueue(null, access)

        return instance(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        router.push('/login')
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default instance
