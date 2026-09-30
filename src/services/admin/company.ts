import { http } from '../http'

export interface AdminEquipmentCompanyItem {
  id: number
  name: string
  main_products: string
  location: string
  tags: string[]
  sort: number
  is_recommended: boolean
  status: number
  updated_at?: string
}

export interface AdminEquipmentCompanyListParams {
  page?: number
  page_size?: number
  keyword?: string
  is_recommended?: boolean
  status?: number
}

export interface AdminEquipmentCompanyPayload {
  id?: number
  name: string
  main_products: string
  location: string
  tags: string[]
  sort: number
  is_recommended: boolean
  status: number
}

export function getAdminEquipmentCompanyList(params: AdminEquipmentCompanyListParams) {
  return http.get<unknown, { total: number; list: AdminEquipmentCompanyItem[] }>(
    '/admin/equipment/company/list/v1',
    { params },
  )
}

export function createAdminEquipmentCompany(payload: AdminEquipmentCompanyPayload) {
  return http.post<unknown, { id: number }>('/admin/equipment/company/create/v1', payload)
}

export function updateAdminEquipmentCompany(payload: AdminEquipmentCompanyPayload) {
  return http.post<unknown, { id: number }>('/admin/equipment/company/update/v1', payload)
}

export function updateAdminEquipmentCompanyRecommend(id: number, is_recommended: boolean) {
  return http.post<unknown, { id: number }>('/admin/equipment/company/recommend/update/v1', {
    id,
    is_recommended,
  })
}
