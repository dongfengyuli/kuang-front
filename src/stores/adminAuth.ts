import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { adminLogin, type AdminLoginPayload, type AdminUser } from '../services/admin/auth'

const STORAGE_USER_KEY = 'kuang_admin_user'
const STORAGE_TOKEN_KEY = 'kuang_admin_access_token'

function readStoredAdminUser() {
  const rawUser = localStorage.getItem(STORAGE_USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AdminUser
  } catch {
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    return null
  }
}

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const user = ref<AdminUser | null>(readStoredAdminUser())
  const isLoggedIn = computed(() => Boolean(user.value?.access_token))

  function persistUser(nextUser: AdminUser) {
    user.value = nextUser
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser))
    localStorage.setItem(STORAGE_TOKEN_KEY, nextUser.access_token)
  }

  async function login(payload: AdminLoginPayload) {
    const nextUser = await adminLogin(payload)
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
    logout,
  }
})
