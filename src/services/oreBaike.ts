import { staticUrl } from '../utils/staticUrl'
import { http } from './http'

function normalizeBaikeItem<T extends { cover?: string; content?: string }>(item: T): T {
  return {
    ...item,
    cover: staticUrl(item.cover),
    ...(item.content !== undefined ? { content: staticUrl(item.content) } : {}),
  }
}

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

export async function getOreBaikeList(params: OreBaikeListParams) {
  const result = await http.get<unknown, { total: number; list: OreBaikeItem[] }>(
    '/content_ecology/ore_baike/list/v1',
    { params },
  )
  return {
    ...result,
    list: (result.list || []).map((item) => normalizeBaikeItem(item)),
  }
}

export async function getOreBaikeDetail(id: number) {
  const result = await http.get<unknown, { detail: OreBaikeDetail }>('/content_ecology/ore_baike/detail/v1', {
    params: { id },
  })
  return {
    ...result,
    detail: normalizeBaikeItem({
      ...result.detail,
      related: (result.detail.related || []).map((item) => normalizeBaikeItem(item)),
    }),
  }
}
