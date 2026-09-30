import { http } from './http'

export interface MiningNewsItem {
  id: number
  category: string
  title: string
  summary: string
  cover: string
  tags: string[]
  source_site: string
  source_url: string
  source_name: string
  view_count: number
  is_recommend: number
  is_hot: number
  published_at: string
}

export interface MiningNewsDetail extends MiningNewsItem {
  content: string
  related: MiningNewsItem[]
}

export interface MiningNewsListParams {
  page?: number
  page_size?: number
  category?: string
  keyword?: string
  tag?: string
  source_site?: string
  is_recommend?: number
  is_hot?: number
  sort?: string
}

export function getMiningNewsList(params: MiningNewsListParams) {
  return http.get<unknown, { total: number; list: MiningNewsItem[] }>('/content_ecology/mining_news/list/v1', {
    params,
  })
}

export function getMiningNewsDetail(id: number) {
  return http.get<unknown, { detail: MiningNewsDetail }>('/content_ecology/mining_news/detail/v1', {
    params: { id },
  })
}
