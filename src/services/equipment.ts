import { http } from './http'

export interface EquipmentCategoryItem {
  id: number
  pid: number
  name: string
  level?: number
}

export interface EquipmentProductItem {
  id: number
  product_uuid?: string
  title: string
  model: string
  summary: string
  category_id: number
  category_name: string
  province_id?: number
  city_id?: number
  district_id?: number
  location: string
  company_id?: number
  company_name: string
  member_level?: string
  tags?: string[]
  cover?: string
  parameters?: Record<string, string>
  published_at?: string
}

export interface EquipmentProductListParams {
  page?: number
  page_size?: number
  category_id?: number
  province_id?: number
  city_id?: number
  district_id?: number
  keyword?: string
}

export interface EquipmentProductListResponse {
  total: number
  list: EquipmentProductItem[]
}

export interface EquipmentCompanyItem {
  id: number
  name: string
  main_products: string
  location?: string
  tags?: string[]
}

export interface EquipmentInquiryPayload {
  product_ids?: number[]
  company_id?: number
  title: string
  content: string
  quantity: string
  contact_name: string
  contact_phone: string
  company_name: string
}

export function getEquipmentCategoryList(pid = 0) {
  return http.get<unknown, { list: EquipmentCategoryItem[] }>('/content_ecology/equipment/category/list/v1', {
    params: { pid },
  })
}

export function getEquipmentProductList(params: EquipmentProductListParams) {
  return http.get<unknown, EquipmentProductListResponse>('/content_ecology/equipment/product/list/v1', {
    params,
  })
}

export function getEquipmentProductDetail(id: number) {
  return http.get<unknown, { detail: EquipmentProductItem }>('/content_ecology/equipment/product/detail/v1', {
    params: { id },
  })
}

export function createEquipmentInquiry(payload: EquipmentInquiryPayload) {
  return http.post<unknown, { id: number }>('/content_ecology/equipment/inquiry/create/v1', payload)
}

export function getRecommendedEquipmentCompanies() {
  return http.get<unknown, { list: EquipmentCompanyItem[] }>('/content_ecology/equipment/company/recommend/v1')
}
