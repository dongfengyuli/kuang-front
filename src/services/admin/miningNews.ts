import { http } from '../http'

export interface AdminMiningNewsItem {
  id: number
  category: string
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
  is_hot: boolean
  sort: number
  status: number
  published_at: string
  updated_at: string
}

export interface AdminMiningNewsListParams {
  page?: number
  page_size?: number
  keyword?: string
  category?: string
  status?: number
  source_type?: string
  source_site?: string
  is_recommend?: boolean
  is_hot?: boolean
}

export interface AdminMiningNewsSavePayload {
  id?: number
  category: string
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
  is_hot: boolean
  sort: number
  status: number
  published_at: string
}

export function getAdminMiningNewsList(params: AdminMiningNewsListParams) {
  return http.get<unknown, { total: number; list: AdminMiningNewsItem[] }>('/admin/mining_news/list/v1', { params })
}

export function getAdminMiningNewsDetail(id: number) {
  return http.get<unknown, { detail: AdminMiningNewsItem }>('/admin/mining_news/detail/v1', { params: { id } })
}

export function createAdminMiningNews(payload: AdminMiningNewsSavePayload) {
  return http.post<unknown, { id: number }>('/admin/mining_news/create/v1', payload)
}

export function updateAdminMiningNews(payload: AdminMiningNewsSavePayload) {
  return http.post<unknown, { id: number }>('/admin/mining_news/update/v1', payload)
}

export function deleteAdminMiningNews(id: number) {
  return http.post<unknown, { id: number }>('/admin/mining_news/delete/v1', { id })
}

export function updateAdminMiningNewsStatus(id: number, status: number) {
  return http.post<unknown, { id: number }>('/admin/mining_news/status/update/v1', { id, status })
}

export function updateAdminMiningNewsRecommend(id: number, isRecommend: boolean) {
  return http.post<unknown, { id: number }>('/admin/mining_news/recommend/update/v1', {
    id,
    is_recommend: isRecommend,
  })
}

export function updateAdminMiningNewsHot(id: number, isHot: boolean) {
  return http.post<unknown, { id: number }>('/admin/mining_news/hot/update/v1', {
    id,
    is_hot: isHot,
  })
}
