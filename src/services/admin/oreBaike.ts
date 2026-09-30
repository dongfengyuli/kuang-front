import { http } from '../http'

export interface AdminOreBaikeItem {
  id: number
  title: string
  summary: string
  cover: string
  content: string
  tags: string[]
  author: string
  source_type: string
  source_site: string
  source_id: string
  source_url: string
  source_name: string
  view_count: number
  is_recommend: boolean
  sort: number
  status: number
  published_at: string
  updated_at: string
}

export interface AdminOreBaikeListParams {
  page?: number
  page_size?: number
  keyword?: string
  status?: number
  source_type?: string
  source_site?: string
  is_recommend?: boolean
}

export interface AdminOreBaikeSavePayload {
  id?: number
  title: string
  summary: string
  cover: string
  content: string
  tags: string[]
  author: string
  source_type: string
  source_site: string
  source_id: string
  source_url: string
  source_name: string
  is_recommend: boolean
  sort: number
  status: number
  published_at: string
}

export function getAdminOreBaikeList(params: AdminOreBaikeListParams) {
  return http.get<unknown, { total: number; list: AdminOreBaikeItem[] }>('/admin/ore_baike/list/v1', { params })
}

export function getAdminOreBaikeDetail(id: number) {
  return http.get<unknown, { detail: AdminOreBaikeItem }>('/admin/ore_baike/detail/v1', { params: { id } })
}

export function createAdminOreBaike(payload: AdminOreBaikeSavePayload) {
  return http.post<unknown, { id: number }>('/admin/ore_baike/create/v1', payload)
}

export function updateAdminOreBaike(payload: AdminOreBaikeSavePayload) {
  return http.post<unknown, { id: number }>('/admin/ore_baike/update/v1', payload)
}

export function deleteAdminOreBaike(id: number) {
  return http.post<unknown, { id: number }>('/admin/ore_baike/delete/v1', { id })
}

export function updateAdminOreBaikeStatus(id: number, status: number) {
  return http.post<unknown, { id: number }>('/admin/ore_baike/status/update/v1', { id, status })
}

export function updateAdminOreBaikeRecommend(id: number, isRecommend: boolean) {
  return http.post<unknown, { id: number }>('/admin/ore_baike/recommend/update/v1', {
    id,
    is_recommend: isRecommend,
  })
}
