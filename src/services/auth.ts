import { http } from './http'

export interface AuthUser {
  id: number
  user_name: string
  email: string
  mobile: string
  access_token: string
  access_expire: number
  refresh_after: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface MobileLoginPayload {
  mobile: string
  code: string
}

export interface RegisterPayload {
  user_name: string
  email: string
  password: string
  mobile?: string
}

export interface MobileRegisterPayload {
  user_name: string
  mobile: string
  password: string
  code: string
}

export interface MobileCodeResponse {
  mobile: string
  code: string
  expire_seconds: number
}

export function login(payload: LoginPayload) {
  return http.post<unknown, AuthUser>('/user/user/login', {
    login_type: 1,
    email: payload.email,
    password: payload.password,
  })
}

export function loginByMobile(payload: MobileLoginPayload) {
  return http.post<unknown, AuthUser>('/user/user/login', {
    login_type: 2,
    mobile: payload.mobile,
    code: payload.code,
  })
}

export function register(payload: RegisterPayload) {
  return http.post<unknown, AuthUser>('/user/user/register', {
    regist_type: 1,
    user_name: payload.user_name,
    email: payload.email,
    password: payload.password,
    mobile: payload.mobile || '',
  })
}

export function registerByMobile(payload: MobileRegisterPayload) {
  return http.post<unknown, AuthUser>('/user/user/register', {
    regist_type: 2,
    user_name: payload.user_name,
    mobile: payload.mobile,
    password: payload.password,
    code: payload.code,
  })
}

export function sendMobileCode(mobile: string, scene: 'login' | 'register') {
  return http.post<unknown, MobileCodeResponse>('/user/user/mobile/code', {
    mobile,
    scene,
  })
}
