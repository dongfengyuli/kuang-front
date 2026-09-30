import { http } from './http'

export interface OreBaikeItem {
  id: number
  title: string
  summary: string
  cover: string
  tags: string[]
  source_url: string
  source_name: string
  view_count: number
  is_recommend: number
  published_at: string
}

export interface OreBaikeDetail extends OreBaikeItem {
  content: string
  related: OreBaikeItem[]
}

export interface OreBaikeListParams {
  page?: number
  page_size?: number
  keyword?: string
  tag?: string
  is_recommend?: number
  sort?: string
}

export function getOreBaikeList(params: OreBaikeListParams) {
  return http.get<unknown, { total: number; list: OreBaikeItem[] }>('/content_ecology/ore_baike/list/v1', {
    params,
  })
}

export function getOreBaikeDetail(id: number) {
  return http.get<unknown, { detail: OreBaikeDetail }>('/content_ecology/ore_baike/detail/v1', {
    params: { id },
  })
}
