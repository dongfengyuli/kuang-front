import { http } from './http'

export interface MaterialOption {
  id: number
  name: string
}

export interface MaterialOrderItem {
  id: number
  order_number: string
  order_type: number
  uid: number
  industry_id: number
  industry_name: string
  mine_ore_id: number
  mine_ore_name: string
  purchase_num: number
  purchase_price_type: number
  purchase_price: number
  price_text: string
  delivery_place: string
  province_id: number
  city_id: number
  indicator_requirement: string
  img: string
  img_attr: string
  contact_information: string
  create_time: string
}

export interface MaterialOrderListParams {
  page?: number
  page_size?: number
  order_type?: number
  industry_id?: number
  mine_ore_id?: number
  province_id?: number
  city_id?: number
  keyword?: string
}

export interface MaterialOrderListResponse {
  total: number
  list: MaterialOrderItem[]
}

export interface MaterialOrderCreatePayload {
  order_type: number
  uid?: number
  industry_id: number
  mine_ore_id: number
  purchase_num: number
  purchase_price_type: number
  purchase_price: number
  delivery_place: string
  province_id: number
  city_id: number
  indicator_requirement: string
  img: string
  img_attr: string
  contact_information: string
}

export function getMaterialOreList() {
  return http.get<unknown, { list: MaterialOption[] }>('/content_ecology/mine_ore/list/v1')
}

export function getMaterialIndustryList() {
  return http.get<unknown, { list: MaterialOption[] }>('/content_ecology/mine_material/belong_industry_list/v1')
}

export function getMaterialOrderList(params: MaterialOrderListParams) {
  return http.get<unknown, MaterialOrderListResponse>('/content_ecology/mine_material_order/list/v1', {
    params,
  })
}

export function getMaterialOrderDetail(id: number) {
  return http.get<unknown, { detail: MaterialOrderItem }>('/content_ecology/mine_material_order/detail/v1', {
    params: { id },
  })
}

export function createMaterialOrder(payload: MaterialOrderCreatePayload) {
  return http.post<unknown, { order_number: string }>('/content_ecology/mine_material_order/create/v1', payload)
}
