import { http } from '../http'

export interface AdminEquipmentInquiryItem {
  id: number
  inquiry_no: string
  title: string
  content: string
  quantity: string
  product_titles?: string[]
  company_name: string
  contact_name: string
  contact_phone: string
  status: number
  created_at: string
}

export interface AdminEquipmentInquiryListParams {
  page?: number
  page_size?: number
  status?: number
  keyword?: string
}

export function getAdminEquipmentInquiryList(params: AdminEquipmentInquiryListParams) {
  return http.get<unknown, { total: number; list: AdminEquipmentInquiryItem[] }>(
    '/admin/equipment/inquiry/list/v1',
    { params },
  )
}

export function updateAdminEquipmentInquiryStatus(id: number, status: number, remark = '') {
  return http.post<unknown, { id: number }>('/admin/equipment/inquiry/status/update/v1', {
    id,
    status,
    remark,
  })
}
