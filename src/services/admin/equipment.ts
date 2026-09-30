import { http } from '../http'

export interface AdminEquipmentCategory {
  id: number
  pid: number
  name: string
  level?: number
  sort?: number
  status?: number
}

export interface AdminEquipmentItem {
  id: number
  title: string
  model: string
  summary: string
  content: string
  category_id: number
  category_name?: string
  province_id: number
  city_id: number
  district_id: number
  location: string
  company_id?: number
  company_name: string
  member_level?: string
  tags: string[]
  cover: string
  images: string[]
  parameters: Record<string, string>
  status: number
  is_recommended: boolean
  published_at?: string
  updated_at?: string
}

export interface AdminEquipmentListParams {
  page?: number
  page_size?: number
  category_id?: number
  status?: number
  is_recommended?: boolean
  keyword?: string
}

export interface AdminEquipmentListResponse {
  total: number
  list: AdminEquipmentItem[]
}

export interface AdminEquipmentSavePayload {
  id?: number
  title: string
  model: string
  summary: string
  content: string
  category_id: number
  province_id: number
  city_id: number
  district_id: number
  location: string
  company_name: string
  member_level: string
  tags: string[]
  cover: string
  images: string[]
  parameters: Record<string, string>
  status: number
  is_recommended: boolean
}

export function getAdminEquipmentList(params: AdminEquipmentListParams) {
  return http.get<unknown, AdminEquipmentListResponse>('/admin/equipment/list/v1', { params })
}

export function getAdminEquipmentDetail(id: number) {
  return http.get<unknown, { detail: AdminEquipmentItem }>('/admin/equipment/detail/v1', { params: { id } })
}

export function createAdminEquipment(payload: AdminEquipmentSavePayload) {
  return http.post<unknown, { id: number }>('/admin/equipment/create/v1', payload)
}

export function updateAdminEquipment(payload: AdminEquipmentSavePayload) {
  return http.post<unknown, { id: number }>('/admin/equipment/update/v1', payload)
}

export function deleteAdminEquipment(id: number) {
  return http.post<unknown, { id: number }>('/admin/equipment/delete/v1', { id })
}

export function updateAdminEquipmentStatus(id: number, status: number) {
  return http.post<unknown, { id: number }>('/admin/equipment/status/update/v1', { id, status })
}

export function updateAdminEquipmentRecommend(id: number, is_recommended: boolean) {
  return http.post<unknown, { id: number }>('/admin/equipment/recommend/update/v1', {
    id,
    is_recommended,
  })
}

export function getAdminEquipmentCategoryList(pid = 0) {
  return http.get<unknown, { list: AdminEquipmentCategory[] }>('/admin/equipment/category/list/v1', {
    params: { pid },
  })
}
