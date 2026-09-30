import { http } from '../http'

export interface AdminRecommendedCompanyItem {
  id: number
  name: string
  logo: string
  cover: string
  summary: string
  intro: string
  products: string
  business_type: string
  region: string
  address: string
  website: string
  contact_name: string
  contact_phone: string
  tags: string[]
  source_type: string
  source_site: string
  source_id: string
  view_count: number
  is_recommend: boolean
  sort: number
  status: number
  updated_at?: string
}

export interface AdminRecommendedCompanyListParams {
  page?: number
  page_size?: number
  keyword?: string
  business_type?: string
  status?: number
  is_recommend?: boolean
}

export interface AdminRecommendedCompanyPayload {
  id?: number
  name: string
  logo: string
  cover: string
  summary: string
  intro: string
  products: string
  business_type: string
  region: string
  address: string
  website: string
  contact_name: string
  contact_phone: string
  tags: string[]
  source_type: string
  source_site: string
  source_id: string
  is_recommend: boolean
  sort: number
  status: number
}

export function getAdminRecommendedCompanyList(params: AdminRecommendedCompanyListParams) {
  return http.get<unknown, { total: number; list: AdminRecommendedCompanyItem[] }>(
    '/admin/recommended_company/list/v1',
    { params },
  )
}

export function getAdminRecommendedCompanyDetail(id: number) {
  return http.get<unknown, { detail: AdminRecommendedCompanyItem }>(
    '/admin/recommended_company/detail/v1',
    { params: { id } },
  )
}

export function createAdminRecommendedCompany(payload: AdminRecommendedCompanyPayload) {
  return http.post<unknown, { id: number }>('/admin/recommended_company/create/v1', payload)
}

export function updateAdminRecommendedCompany(payload: AdminRecommendedCompanyPayload) {
  return http.post<unknown, { id: number }>('/admin/recommended_company/update/v1', payload)
}

export function deleteAdminRecommendedCompany(id: number) {
  return http.post<unknown, { id: number }>('/admin/recommended_company/delete/v1', { id })
}

export function updateAdminRecommendedCompanyStatus(id: number, status: number) {
  return http.post<unknown, { id: number }>('/admin/recommended_company/status/update/v1', { id, status })
}

export function updateAdminRecommendedCompanyRecommend(id: number, is_recommend: boolean) {
  return http.post<unknown, { id: number }>('/admin/recommended_company/recommend/update/v1', {
    id,
    is_recommend,
  })
}
