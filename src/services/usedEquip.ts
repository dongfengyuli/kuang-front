import { http } from './http'

export type UsedEquipListingType = 'transfer' | 'buy' | 'recycle' | 'latest' | 'all' | ''

export interface UsedEquipCategory {
  id: number
  pid: number
  name: string
  code: string
  level: number
}

export interface UsedEquipListingItem {
  id: number
  listing_no: string
  listing_type: string
  listing_type_text: string
  category_id: number
  category_name: string
  title: string
  summary: string
  cover: string
  brand: string
  model: string
  condition_level: string
  manufacture_year: string
  quantity: number
  unit: string
  price: number
  price_type: number
  price_text: string
  location: string
  province: string
  city: string
  company_name: string
  tags: string[]
  view_count: number
  inquiry_count: number
  is_top: number
  is_recommend: number
  is_hot: number
  published_at: string
}

export interface UsedEquipListingDetail extends UsedEquipListingItem {
  content: string
  images: string[]
  contact_name: string
  contact_phone: string
  district: string
  related: UsedEquipListingItem[]
}

export interface UsedEquipListParams {
  page?: number
  page_size?: number
  listing_type?: UsedEquipListingType
  category_id?: number
  keyword?: string
  province?: string
  city?: string
  sort?: string
  is_recommend?: number
  is_hot?: number
}

export interface UsedEquipCreatePayload {
  listing_type: string
  category_id?: number
  title: string
  summary?: string
  content?: string
  cover?: string
  brand?: string
  model?: string
  condition_level?: string
  manufacture_year?: string
  quantity?: number
  unit?: string
  price?: number
  price_type?: number
  province?: string
  city?: string
  location?: string
  company_name?: string
  contact_name: string
  contact_phone: string
  tags?: string
}

export interface UsedEquipInquiryPayload {
  listing_id: number
  inquiry_type?: string
  content?: string
  contact_name: string
  contact_phone: string
  company_name?: string
}

export function getUsedEquipCategoryList() {
  return http.get<unknown, { list: UsedEquipCategory[] }>('/content_ecology/used_equip/category/list/v1')
}

export function getUsedEquipListingList(params: UsedEquipListParams) {
  return http.get<unknown, { total: number; list: UsedEquipListingItem[] }>(
    '/content_ecology/used_equip/listing/list/v1',
    { params },
  )
}

export function getUsedEquipListingDetail(id: number) {
  return http.get<unknown, { detail: UsedEquipListingDetail }>('/content_ecology/used_equip/listing/detail/v1', {
    params: { id },
  })
}

export function createUsedEquipListing(payload: UsedEquipCreatePayload) {
  return http.post<unknown, { id: number; listing_no: string }>(
    '/content_ecology/used_equip/listing/create/v1',
    payload,
  )
}

export function createUsedEquipInquiry(payload: UsedEquipInquiryPayload) {
  return http.post<unknown, { id: number }>('/content_ecology/used_equip/inquiry/create/v1', payload)
}
