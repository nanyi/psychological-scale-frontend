import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ERROR_MESSAGE_MAP } from './errorMap'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const baseURL = '/api'

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000
})

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    error.message = '请求发送失败'
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code === 0 || res.code === 200) {
      return res.data
    }
    let message = res.message || '请求失败'
    ElMessage.error(message)
    if (res.code === 401) {
      localStorage.removeItem('admin_token')
      try {
        const authStore = useAuthStore()
        authStore.token = ''
        authStore.userInfo = null
      } catch (e) {
        console.warn('Auth store not available:', e)
      }
      router.replace('/login')
    }
    return Promise.reject(new Error(message))
  },
  (error) => {
    console.error('Response error:', error)
    let message = '网络错误，请检查网络连接'

    if (error.response) {
      const {status, data} = error.response
      // 如果响应数据中有 message，优先使用
      if (data && data.message) {
        message = data.message
      } else {
        message = status ? ERROR_MESSAGE_MAP[status] || `请求失败 (${status})，请稍后重试` : message
      }

      switch (status) {
        case 401:
          localStorage.removeItem('admin_token')
          try {
            const authStore = useAuthStore()
            authStore.token = ''
            authStore.userInfo = null
          } catch (e) {
            console.warn('Auth store not available:', e)
          }
          router.replace('/login').catch(err => {
            console.error('Router navigation error:', err)
          })
          break
      }
    }

    error.message = message
    ElMessage.error(message)
    return Promise.reject(new Error(message))
  }
)

export default service

export const request = service
