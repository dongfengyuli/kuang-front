import { http } from './http'

export interface Kuang123Category {
  id: number
  name: string
  code: string
  description: string
  icon: string
}

export interface Kuang123Site {
  id: number
  category_id: number
  category: string
  category_code: string
  name: string
  url: string
  icon: string
  description: string
  tags: string[]
  is_recommend: number
}

export interface Kuang123Group {
  category: Kuang123Category
  sites: Kuang123Site[]
}

export interface Kuang123ListResponse {
  categories: Kuang123Category[]
  groups: Kuang123Group[]
}

export interface Kuang123ListParams {
  keyword?: string
  category_code?: string
  is_recommend?: number
  limit?: number
}

export function getKuang123List(params: Kuang123ListParams = {}) {
  return http.get<unknown, Kuang123ListResponse>('/content_ecology/kuang123/list/v1', { params })
}
