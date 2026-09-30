import { http } from './http'

export interface MiningRightItem {
  id: number
  listing_no: string
  listing_type: string
  title: string
  summary: string
  content: string
  province_id: number
  city_id: number
  district_id: number
  location: string
  mine_type: string
  mine_cat_id: number
  mine_cat_name: string
  right_type: string
  resource_amount: string
  price: number
  price_type: number
  company_name: string
  contact_name: string
  contact_phone: string
  cover: string
  images: string
  published_at: string
}

export interface MiningRightListParams {
  page?: number
  page_size?: number
  listing_type?: string
  right_type?: string
  mine_type?: string
  mine_cat_id?: number
  province_id?: number
  city_id?: number
  district_id?: number
  keyword?: string
}

export interface MiningRightListResponse {
  total: number
  list: MiningRightItem[]
}

export interface MiningRightCreatePayload {
  listing_type: string
  title: string
  summary: string
  content: string
  province_id: number
  city_id: number
  district_id: number
  location: string
  mine_type: string
  mine_cat_id: number
  right_type: string
  resource_amount: string
  price: number
  price_type: number
  company_name: string
  contact_name: string
  contact_phone: string
}

export function getMiningRightList(params: MiningRightListParams) {
  return http.get<unknown, MiningRightListResponse>('/content_ecology/trade/mining_right/list/v1', {
    params,
  })
}

export function getMiningRightDetail(id: number) {
  return http.get<unknown, { detail: MiningRightItem }>('/content_ecology/trade/mining_right/detail/v1', {
    params: { id },
  })
}

export function createMiningRight(payload: MiningRightCreatePayload) {
  return http.post<unknown, { id: number; listing_no: string }>(
    '/content_ecology/trade/mining_right/create/v1',
    payload,
  )
}
