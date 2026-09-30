import { http } from '../http'

export interface AdminTenderNoticeItem {
  id: number
  notice_type: string
  project_type: string
  region: string
  title: string
  summary: string
  content: string
  tags: string[]
  publisher: string
  agency: string
  contact_name: string
  contact_phone: string
  budget: string
  deadline_at: string
  open_at: string
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

export interface AdminTenderNoticeListParams {
  page?: number
  page_size?: number
  keyword?: string
  notice_type?: string
  project_type?: string
  region?: string
  status?: number
  source_type?: string
  source_site?: string
  is_recommend?: boolean
  is_hot?: boolean
}

export interface AdminTenderNoticeSavePayload {
  id?: number
  notice_type: string
  project_type: string
  region: string
  title: string
  summary: string
  content: string
  tags: string[]
  publisher: string
  agency: string
  contact_name: string
  contact_phone: string
  budget: string
  deadline_at: string
  open_at: string
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

export function getAdminTenderNoticeList(params: AdminTenderNoticeListParams) {
  return http.get<unknown, { total: number; list: AdminTenderNoticeItem[] }>('/admin/tender_notice/list/v1', {
    params,
  })
}

export function getAdminTenderNoticeDetail(id: number) {
  return http.get<unknown, { detail: AdminTenderNoticeItem }>('/admin/tender_notice/detail/v1', { params: { id } })
}

export function createAdminTenderNotice(payload: AdminTenderNoticeSavePayload) {
  return http.post<unknown, { id: number }>('/admin/tender_notice/create/v1', payload)
}

export function updateAdminTenderNotice(payload: AdminTenderNoticeSavePayload) {
  return http.post<unknown, { id: number }>('/admin/tender_notice/update/v1', payload)
}

export function deleteAdminTenderNotice(id: number) {
  return http.post<unknown, { id: number }>('/admin/tender_notice/delete/v1', { id })
}

export function updateAdminTenderNoticeStatus(id: number, status: number) {
  return http.post<unknown, { id: number }>('/admin/tender_notice/status/update/v1', { id, status })
}

export function updateAdminTenderNoticeRecommend(id: number, isRecommend: boolean) {
  return http.post<unknown, { id: number }>('/admin/tender_notice/recommend/update/v1', {
    id,
    is_recommend: isRecommend,
  })
}

export function updateAdminTenderNoticeHot(id: number, isHot: boolean) {
  return http.post<unknown, { id: number }>('/admin/tender_notice/hot/update/v1', {
    id,
    is_hot: isHot,
  })
}
