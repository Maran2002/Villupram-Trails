import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: parseInt(process.env.API_TIMEOUT || '10000'),
})

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = {
      code: error.response?.status || 'UNKNOWN',
      message: error.response?.data?.message || error.message,
      details: error.response?.data,
    }
    return Promise.reject(apiError)
  }
)

export default apiClient
