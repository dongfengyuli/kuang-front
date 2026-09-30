import { exhibitions as fallbackExhibitions, type ExhibitionItem } from '../data/exhibitions'
import { http } from './http'

interface ApiExhibitionItem {
  id: number
  uuid: string
  title: string
  date_range: string
  start_date: string
  end_date: string
  city: string
  venue: string
  region: ExhibitionItem['region']
  country?: string
  type: ExhibitionItem['type']
  status: ExhibitionItem['status']
  organizer: string
  cycle: string
  scale: string
  summary: string
  tags: string[]
  cover?: string
  hero_color: string
  heat: number
  is_hot?: number
  is_recommend?: number
  published_at: string
}

interface ApiExhibitionDetail extends ApiExhibitionItem {
  intro: string[]
  exhibitors: ExhibitionItem['exhibitors']
  activities: ExhibitionItem['activities']
  guide: ExhibitionItem['guide']
  reports: Array<ExhibitionItem['reports'][number] & { link?: string }>
  related?: ApiExhibitionItem[]
}

export interface ExhibitionListParams {
  page?: number
  page_size?: number
  time_range?: string
  region?: string
  type?: string
  status?: string
  keyword?: string
  sort?: string
  is_recommend?: number
  is_hot?: number
}

export interface ExhibitionListResponse {
  total: number
  list: ExhibitionItem[]
}

export interface ExhibitionDetailResponse {
  detail: ExhibitionItem
}

export interface ExhibitionRegistrationPayload {
  exhibition_id?: number
  uuid?: string
  intent_type: 'visit' | 'exhibit'
  company_name: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  demand?: string
}

export interface ExhibitionRegistrationResponse {
  id: number
  registration_no: string
}

function findFallbackByUuid(uuid: string) {
  return fallbackExhibitions.find((item) => item.id === uuid)
}

function normalizeImage(item: ApiExhibitionItem) {
  return item.cover || item.hero_color || findFallbackByUuid(item.uuid)?.image || 'linear-gradient(135deg, #164a7a, #1d7fa3 55%, #ff8a1f)'
}

function mapExhibitionItem(item: ApiExhibitionItem): ExhibitionItem {
  const fallback = findFallbackByUuid(item.uuid)

  return {
    id: item.uuid,
    title: item.title,
    dateRange: item.date_range,
    startDate: item.start_date,
    endDate: item.end_date,
    city: item.city,
    venue: item.venue,
    region: item.region,
    country: item.country,
    type: item.type,
    status: item.status,
    organizer: item.organizer,
    cycle: item.cycle,
    scale: item.scale,
    summary: item.summary,
    tags: item.tags || [],
    heat: item.heat,
    publishedAt: item.published_at,
    image: normalizeImage(item),
    intro: fallback?.intro || [],
    exhibitors: fallback?.exhibitors || [],
    activities: fallback?.activities || [],
    guide: fallback?.guide || [],
    reports: fallback?.reports || [],
  }
}

function mapExhibitionDetail(item: ApiExhibitionDetail): ExhibitionItem {
  return {
    ...mapExhibitionItem(item),
    intro: item.intro || [],
    exhibitors: item.exhibitors || [],
    activities: item.activities || [],
    guide: item.guide || [],
    reports: item.reports || [],
  }
}

export async function getExhibitionList(params: ExhibitionListParams) {
  const result = await http.get<unknown, { total: number; list: ApiExhibitionItem[] }>('/content_ecology/exhibition/list/v1', {
    params,
  })

  return {
    total: result.total,
    list: (result.list || []).map(mapExhibitionItem),
  }
}

export async function getExhibitionDetail(uuid: string) {
  const result = await http.get<unknown, { detail: ApiExhibitionDetail }>('/content_ecology/exhibition/detail/v1', {
    params: { uuid },
  })

  return {
    detail: mapExhibitionDetail(result.detail),
  }
}

export function createExhibitionRegistration(payload: ExhibitionRegistrationPayload) {
  return http.post<unknown, ExhibitionRegistrationResponse>('/content_ecology/exhibition/registration/create/v1', payload)
}
