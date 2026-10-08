import { staticUrl } from '../utils/staticUrl'
import { http } from './http'

function normalizeNewsItem<T extends { cover?: string; content?: string }>(item: T): T {
  return {
    ...item,
    cover: staticUrl(item.cover),
    ...(item.content !== undefined ? { content: staticUrl(item.content) } : {}),
  }
}

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

export async function getMiningNewsList(params: MiningNewsListParams) {
  const result = await http.get<unknown, { total: number; list: MiningNewsItem[] }>(
    '/content_ecology/mining_news/list/v1',
    { params },
  )
  return {
    ...result,
    list: (result.list || []).map((item) => normalizeNewsItem(item)),
  }
}

export async function getMiningNewsDetail(id: number) {
  const result = await http.get<unknown, { detail: MiningNewsDetail }>('/content_ecology/mining_news/detail/v1', {
    params: { id },
  })
  return {
    ...result,
    detail: normalizeNewsItem({
      ...result.detail,
      related: (result.detail.related || []).map((item) => normalizeNewsItem(item)),
    }),
  }
}
