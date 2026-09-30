import { http } from '../http'

export interface AdminKuang123Category {
  id: number
  name: string
  code: string
  description: string
  icon: string
  sort: number
  status: number
}

export interface AdminKuang123Site {
  id: number
  category_id: number
  category: string
  name: string
  url: string
  icon: string
  description: string
  tags: string[]
  source_type: string
  source_site: string
  source_id: string
  is_recommend: boolean
  sort: number
  status: number
  updated_at: string
}

export interface AdminKuang123SiteListParams {
  page?: number
  page_size?: number
  keyword?: string
  category_id?: number
  status?: number
  source_type?: string
  is_recommend?: boolean
}

export interface AdminKuang123CategoryPayload {
  id?: number
  name: string
  code: string
  description: string
  icon: string
  sort: number
  status: number
}

export interface AdminKuang123SitePayload {
  id?: number
  category_id: number
  name: string
  url: string
  icon: string
  description: string
  tags: string[]
  source_type: string
  source_site: string
  source_id: string
  is_recommend: boolean
  sort: number
  status: number
}

export function getAdminKuang123Categories() {
  return http.get<unknown, { list: AdminKuang123Category[] }>('/admin/kuang123/category/list/v1')
}

export function saveAdminKuang123Category(payload: AdminKuang123CategoryPayload) {
  return http.post<unknown, { id: number }>('/admin/kuang123/category/save/v1', payload)
}

export function getAdminKuang123Sites(params: AdminKuang123SiteListParams) {
  return http.get<unknown, { total: number; list: AdminKuang123Site[] }>('/admin/kuang123/site/list/v1', {
    params,
  })
}

export function getAdminKuang123SiteDetail(id: number) {
  return http.get<unknown, { detail: AdminKuang123Site }>('/admin/kuang123/site/detail/v1', { params: { id } })
}

export function createAdminKuang123Site(payload: AdminKuang123SitePayload) {
  return http.post<unknown, { id: number }>('/admin/kuang123/site/create/v1', payload)
}

export function updateAdminKuang123Site(payload: AdminKuang123SitePayload) {
  return http.post<unknown, { id: number }>('/admin/kuang123/site/update/v1', payload)
}

export function deleteAdminKuang123Site(id: number) {
  return http.post<unknown, { id: number }>('/admin/kuang123/site/delete/v1', { id })
}

export function updateAdminKuang123SiteStatus(id: number, status: number) {
  return http.post<unknown, { id: number }>('/admin/kuang123/site/status/update/v1', { id, status })
}

export function updateAdminKuang123SiteRecommend(id: number, isRecommend: boolean) {
  return http.post<unknown, { id: number }>('/admin/kuang123/site/recommend/update/v1', {
    id,
    is_recommend: isRecommend,
  })
}
