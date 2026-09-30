import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  login as loginRequest,
  loginByMobile as loginByMobileRequest,
  register as registerRequest,
  registerByMobile as registerByMobileRequest,
  type AuthUser,
  type LoginPayload,
  type MobileLoginPayload,
  type MobileRegisterPayload,
  type RegisterPayload,
} from '../services/auth'

const STORAGE_USER_KEY = 'kuang_auth_user'
const STORAGE_TOKEN_KEY = 'kuang_access_token'

function readStoredUser() {
  const rawUser = localStorage.getItem(STORAGE_USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(readStoredUser())
  const isLoggedIn = computed(() => Boolean(user.value?.access_token))

  function persistUser(nextUser: AuthUser) {
    user.value = nextUser
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser))
    localStorage.setItem(STORAGE_TOKEN_KEY, nextUser.access_token)
  }

  async function login(payload: LoginPayload) {
    const nextUser = await loginRequest(payload)
    persistUser(nextUser)
    return nextUser
  }

  async function loginByMobile(payload: MobileLoginPayload) {
    const nextUser = await loginByMobileRequest(payload)
    persistUser(nextUser)
    return nextUser
  }

  async function register(payload: RegisterPayload) {
    const nextUser = await registerRequest(payload)
    persistUser(nextUser)
    return nextUser
  }

  async function registerByMobile(payload: MobileRegisterPayload) {
    const nextUser = await registerByMobileRequest(payload)
    persistUser(nextUser)
    return nextUser
  }

  function logout() {
    user.value = null
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
  }

  return {
    user,
    isLoggedIn,
    login,
    loginByMobile,
    register,
    registerByMobile,
    logout,
  }
})
