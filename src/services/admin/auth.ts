import { http } from '../http'

export interface AdminLoginPayload {
  user_name: string
  password: string
}

export interface AdminUser {
  id: number
  user_name: string
  email: string
  mobile: string
  access_token: string
  access_expire: number
  refresh_after: number
}

export function adminLogin(payload: AdminLoginPayload) {
  return http.post<unknown, AdminUser>('/admin/user/login', payload)
}
