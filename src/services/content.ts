import { http } from './http'

export interface HomeResponse {
  banners: unknown[]
  tradeSections: unknown[]
  newsSections: unknown[]
}

export interface RecommendSite {
  name: string
  icon: string
  href: string
}

export interface RecommendGroup {
  title: string
  list: RecommendSite[]
}

export interface RecommendHotListResponse {
  hot_site: RecommendGroup
  mining_colleges: RecommendGroup
  zone_recommend: RecommendGroup
}

export interface RegionItem {
  id: number
  name: string
  pid: number
}

export interface RegionListResponse {
  list: RegionItem[]
}

export interface MineCategoryItem {
  id: number
  pid: number
  name: string
  level: number
}

export interface MineCategoryListResponse {
  list: MineCategoryItem[]
}

export function getHomeInfo() {
  return http.get<unknown, HomeResponse>('/content_ecology/content/home/info/v1')
}

export function getRecommendHotList() {
  return http.get<unknown, RecommendHotListResponse>('/content_ecology/recommend/hot_list/v1', {
    params: {
      page: 1,
      page_size: 200,
    },
  })
}

export function getRegionList(pid = 1) {
  return http.get<unknown, RegionListResponse>('/content_ecology/region/list/v1', {
    params: { pid },
  })
}

export function getMineCategoryList(pid = 0) {
  return http.get<unknown, MineCategoryListResponse>('/content_ecology/mine_category/list/v1', {
    params: { pid },
  })
}
