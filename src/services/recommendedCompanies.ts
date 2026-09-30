import { http } from './http'

export interface RecommendedCompanyItem {
  id: number
  name: string
  logo: string
  cover: string
  summary: string
  products: string
  business_type: string
  region: string
  website: string
  tags: string[]
  view_count: number
  is_recommend: number
}

export interface RecommendedCompanyDetail extends RecommendedCompanyItem {
  intro: string
  address: string
  contact_name: string
  contact_phone: string
}

export interface RecommendedCompanyListParams {
  page?: number
  page_size?: number
  keyword?: string
  business_type?: string
  region?: string
  tag?: string
  is_recommend?: number
}

export function getRecommendedCompanyList(params: RecommendedCompanyListParams) {
  return http.get<unknown, { total: number; list: RecommendedCompanyItem[] }>(
    '/content_ecology/recommended_company/list/v1',
    { params },
  )
}

export function getRecommendedCompanyDetail(id: number) {
  return http.get<unknown, { detail: RecommendedCompanyDetail }>(
    '/content_ecology/recommended_company/detail/v1',
    { params: { id } },
  )
}
