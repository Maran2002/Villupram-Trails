import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: parseInt(process.env.API_TIMEOUT || '10000'),
  withCredentials: true,
})

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isLoginAttempt = /(?:^|\/)auth\/login(?:[?#]|$)/.test(requestUrl)
    if (error.response?.status === 401 && !isLoginAttempt) {
      // Auto logout on token expiry
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-store') // Clear store too
        window.location.href = '/auth/login?expired=true'
      }
    }
    
    const apiError = {
      code: error.response?.status || 'UNKNOWN',
      message: error.response?.data?.message || error.response?.data?.error || error.message,
      details: error.response?.data,
    }
    return Promise.reject(apiError)
  }
)

export default apiClient
