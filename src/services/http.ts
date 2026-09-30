import axios from 'axios'

interface ApiEnvelope<T = unknown> {
  code: number
  message: string
  data: T
}

const serviceBaseURLs = {
  admin: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/admin',
  content_ecology: import.meta.env.VITE_CONTENT_ECOLOGY_API_BASE_URL || '/api/content_ecology',
  user: import.meta.env.VITE_USER_API_BASE_URL || '/api/user',
} as const

type ServiceName = keyof typeof serviceBaseURLs

function isServiceName(value: string): value is ServiceName {
  return value in serviceBaseURLs
}

function resolveServiceRequest(url?: string) {
  if (!url || /^https?:\/\//i.test(url)) {
    return null
  }

  const normalizedUrl = url.startsWith('/') ? url.slice(1) : url
  const [serviceName, ...pathParts] = normalizedUrl.split('/')

  if (!isServiceName(serviceName)) {
    return null
  }

  return {
    serviceName,
    baseURL: serviceBaseURLs[serviceName],
    url: `/${pathParts.join('/')}`,
  }
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'data' in value
  )
}

export const http = axios.create({
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const serviceRequest = resolveServiceRequest(config.url)

  if (serviceRequest) {
    config.baseURL = serviceRequest.baseURL
    config.url = serviceRequest.url
  }

  const accessToken =
    serviceRequest?.serviceName === 'admin'
      ? localStorage.getItem('kuang_admin_access_token')
      : localStorage.getItem('kuang_access_token')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    const responseData = response.data

    if (isApiEnvelope(responseData)) {
      if (responseData.code === 0) {
        return responseData.data
      }

      return Promise.reject(new Error(responseData.message || '请求失败'))
    }

    return responseData
  },
  (error) => {
    const responseData = error.response?.data

    if (isApiEnvelope(responseData)) {
      return Promise.reject(new Error(responseData.message || '请求失败'))
    }

    return Promise.reject(error)
  },
)
