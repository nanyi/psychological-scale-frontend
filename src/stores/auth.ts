import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, type LoginResponse } from '@/api/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('admin_token') || '')
  const userInfo = ref<LoginResponse['user'] | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('admin_token', newToken)
  }

  const setUserInfo = (info: LoginResponse['user']) => {
    userInfo.value = info
  }

  const login = async (username: string, password: string) => {
    try {
      const data = await loginApi({ username, password })
      setToken(data.token)
      setUserInfo(data.user)
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('admin_token')
    router.push('/login')
  }

  const initFromStorage = () => {
    const storedToken = localStorage.getItem('admin_token')
    if (storedToken) {
      token.value = storedToken
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    login,
    logout,
    initFromStorage
  }
})
