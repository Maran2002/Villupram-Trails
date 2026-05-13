import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: parseInt(process.env.API_TIMEOUT || '10000'),
})

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on token expiry
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth-store') // Clear store too
        window.location.href = '/auth/login?expired=true'
      }
    }
    
    const apiError = {
      code: error.response?.status || 'UNKNOWN',
      message: error.response?.data?.message || error.message,
      details: error.response?.data,
    }
    return Promise.reject(apiError)
  }
)

export default apiClient
