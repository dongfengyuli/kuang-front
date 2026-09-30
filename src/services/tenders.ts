import { http } from './http'

export interface TenderNoticeItem {
  id: number
  notice_type: string
  project_type: string
  region: string
  title: string
  summary: string
  tags: string[]
  publisher: string
  agency: string
  contact_name: string
  contact_phone: string
  budget: string
  deadline_at: string
  open_at: string
  source_site: string
  source_url: string
  source_name: string
  view_count: number
  is_recommend: number
  is_hot: number
  published_at: string
}

export interface TenderNoticeDetail extends TenderNoticeItem {
  content: string
  related: TenderNoticeItem[]
}

export interface TenderNoticeListParams {
  page?: number
  page_size?: number
  notice_type?: string
  project_type?: string
  region?: string
  keyword?: string
  tag?: string
  source_site?: string
  is_recommend?: number
  is_hot?: number
  sort?: string
}

export function getTenderNoticeList(params: TenderNoticeListParams) {
  return http.get<unknown, { total: number; list: TenderNoticeItem[] }>('/content_ecology/tender_notice/list/v1', {
    params,
  })
}

export function getTenderNoticeDetail(id: number) {
  return http.get<unknown, { detail: TenderNoticeDetail }>('/content_ecology/tender_notice/detail/v1', {
    params: { id },
  })
}
