<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { footerTools, navItems, newsSections, tenderItems, tradeCards } from '../data/home'
import { featuredExhibitions as fallbackFeaturedExhibitions, type ExhibitionItem } from '../data/exhibitions'
import { getExhibitionList } from '../services/exhibitions'
import { getMiningNewsList, type MiningNewsItem } from '../services/miningNews'
import { getOreBaikeList, type OreBaikeItem } from '../services/oreBaike'
import { getMaterialOrderList } from '../services/mineralProducts'
import { getRecommendedCompanyList, type RecommendedCompanyItem } from '../services/recommendedCompanies'
import { getTenderNoticeList, type TenderNoticeItem } from '../services/tenders'
import { getMiningRightList } from '../services/trade'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const featuredExhibitions = ref<ExhibitionItem[]>(fallbackFeaturedExhibitions)

type HomeContentItem = {
  id?: number
  title: string
  path: string
  meta?: string
}

type HomeContentSection = {
  title: string
  path: string
  items: HomeContentItem[]
}

type HomeTradeCard = {
  title: string
  desc: string
  count: string
  path: string
}

type HomeCompany = {
  id: number
  name: string
  logo: string
  summary: string
  business_type: string
  region: string
}

const tradeCardPaths = [
  '/channel/mining-rights?listing_type=mining_right_transfer',
  '/channel/mining-rights?listing_type=mining_right_buy',
  '/channel/products?order_type=2',
  '/channel/products?order_type=1',
]

const homeTradeCards = ref<HomeTradeCard[]>(
  tradeCards.map((card, index) => ({
    ...card,
    path: tradeCardPaths[index],
  })),
)

const homeContentSections = ref<HomeContentSection[]>(
  newsSections.map((section) => ({
    title: section.title,
    path: section.path,
    items: section.items.map((item) => ({
      title: item,
      path: section.path,
    })),
  })),
)

const homeTenderItems = ref<HomeContentItem[]>(
  tenderItems.map((item) => ({
    title: item,
    path: '/channel/tenders',
  })),
)

const fallbackCompanies: HomeCompany[] = [
  {
    id: 0,
    name: '紫金矿业集团股份有限公司',
    logo: '/kuang_static_resources/pic/company/zijin.svg',
    summary: '金、铜、锌等金属矿产资源开发与绿色矿山建设。',
    business_type: '矿山开发',
    region: '福建龙岩',
  },
  {
    id: 0,
    name: '中国恩菲工程技术有限公司',
    logo: '/kuang_static_resources/pic/company/enfi.svg',
    summary: '矿山、冶金与环保工程综合技术服务。',
    business_type: '工程技术',
    region: '北京',
  },
  {
    id: 0,
    name: '北方重工集团有限公司',
    logo: '/kuang_static_resources/pic/company/nhi.svg',
    summary: '破碎、磨矿、输送等矿山装备制造。',
    business_type: '设备制造',
    region: '辽宁沈阳',
  },
  {
    id: 0,
    name: '山东黄金矿业股份有限公司',
    logo: '/kuang_static_resources/pic/company/sdgold.svg',
    summary: '黄金资源开发、冶炼加工和矿山运营。',
    business_type: '矿山开发',
    region: '山东济南',
  },
]

const homeCompanies = ref<HomeCompany[]>(fallbackCompanies)

function formatNewsItem(item: MiningNewsItem): HomeContentItem {
  return {
    id: item.id,
    title: item.title,
    path: `/news/${item.id}`,
    meta: item.published_at || item.source_name || item.source_site || '',
  }
}

function formatBaikeItem(item: OreBaikeItem): HomeContentItem {
  return {
    id: item.id,
    title: item.title,
    path: `/baike/${item.id}`,
    meta: item.published_at || item.source_name || '',
  }
}

function formatTenderItem(item: TenderNoticeItem): HomeContentItem {
  return {
    id: item.id,
    title: item.title,
    path: `/tenders/${item.id}`,
  }
}

function formatCompanyItem(item: RecommendedCompanyItem): HomeCompany {
  return {
    id: item.id,
    name: item.name,
    logo: item.logo,
    summary: item.summary || item.products || '矿业优质企业展示',
    business_type: item.business_type || '推荐企业',
    region: item.region,
  }
}

async function fetchFeaturedExhibitions() {
  try {
    const result = await getExhibitionList({
      page: 1,
      page_size: 3,
      is_recommend: 1,
      sort: 'recommend',
    })
    if (result.list.length > 0) {
      featuredExhibitions.value = result.list
    }
  } catch {
    featuredExhibitions.value = fallbackFeaturedExhibitions
  }
}

async function fetchHomeContentSections() {
  const [domestic, international, baike] = await Promise.allSettled([
    getMiningNewsList({ page: 1, page_size: 3, category: 'domestic', sort: 'latest' }),
    getMiningNewsList({ page: 1, page_size: 3, category: 'international', sort: 'latest' }),
    getOreBaikeList({ page: 1, page_size: 3, sort: 'latest' }),
  ])

  homeContentSections.value = newsSections.map((section) => {
    if (section.title === '国内资讯' && domestic.status === 'fulfilled' && domestic.value.list.length > 0) {
      return {
        title: section.title,
        path: section.path,
        items: domestic.value.list.map(formatNewsItem),
      }
    }
    if (section.title === '国外资讯' && international.status === 'fulfilled' && international.value.list.length > 0) {
      return {
        title: section.title,
        path: section.path,
        items: international.value.list.map(formatNewsItem),
      }
    }
    if (section.title === '矿业百科' && baike.status === 'fulfilled' && baike.value.list.length > 0) {
      return {
        title: section.title,
        path: section.path,
        items: baike.value.list.map(formatBaikeItem),
      }
    }
    return {
      title: section.title,
      path: section.path,
      items: section.items.map((item) => ({
        title: item,
        path: section.path,
      })),
    }
  })
}

async function fetchHomeTradeCards() {
  const [rightTransfer, rightBuy, productSell, productBuy] = await Promise.allSettled([
    getMiningRightList({ page: 1, page_size: 1, listing_type: 'mining_right_transfer' }),
    getMiningRightList({ page: 1, page_size: 1, listing_type: 'mining_right_buy' }),
    getMaterialOrderList({ page: 1, page_size: 1, order_type: 2 }),
    getMaterialOrderList({ page: 1, page_size: 1, order_type: 1 }),
  ])

  const totals = [
    rightTransfer.status === 'fulfilled' ? rightTransfer.value.total : undefined,
    rightBuy.status === 'fulfilled' ? rightBuy.value.total : undefined,
    productSell.status === 'fulfilled' ? productSell.value.total : undefined,
    productBuy.status === 'fulfilled' ? productBuy.value.total : undefined,
  ]
  homeTradeCards.value = tradeCards.map((card, index) => ({
    ...card,
    path: tradeCardPaths[index],
    count: totals[index] === undefined ? card.count : `${totals[index]} 条`,
  }))
}

async function fetchHomeTenderItems() {
  try {
    const result = await getTenderNoticeList({ page: 1, page_size: 4, sort: 'latest' })
    if (result.list.length > 0) {
      homeTenderItems.value = result.list.map(formatTenderItem)
    }
  } catch {
    homeTenderItems.value = tenderItems.map((item) => ({
      title: item,
      path: '/channel/tenders',
    }))
  }
}

async function fetchHomeCompanies() {
  try {
    const result = await getRecommendedCompanyList({ page: 1, page_size: 8, is_recommend: 1 })
    if (result.list.length > 0) {
      homeCompanies.value = result.list.map(formatCompanyItem)
    }
  } catch {
    homeCompanies.value = fallbackCompanies
  }
}

onMounted(() => {
  fetchFeaturedExhibitions()
  fetchHomeContentSections()
  fetchHomeTradeCards()
  fetchHomeTenderItems()
  fetchHomeCompanies()
})
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <div class="container topbar-inner">
        <span>收藏本站</span>
        <div class="topbar-actions">
          <span>服务热线：18748063792</span>
          <template v-if="authStore.isLoggedIn">
            <span>欢迎，{{ authStore.user?.user_name || authStore.user?.email }}</span>
            <button type="button" @click="authStore.logout">退出</button>
          </template>
          <template v-else>
            <RouterLink to="/login">登录</RouterLink>
            <RouterLink to="/register">免费注册</RouterLink>
          </template>
        </div>
      </div>
    </header>

    <nav class="site-nav">
      <div class="container nav-inner">
        <RouterLink to="/" class="brand">
          <span class="brand-mark">
            <span class="brand-badge-star"></span>
            <span class="brand-badge-mountains"></span>
            <span class="brand-badge-tools"></span>
          </span>
          <span>
            <strong>懂矿帝</strong>
            <small>矿业信息与交易服务</small>
          </span>
        </RouterLink>
        <div class="nav-links">
          <RouterLink v-for="item in navItems" :key="item.label" :to="item.path">
            {{ item.label }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <main>
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">矿权交易 · 矿产品交易 · 地质勘查</p>
            <h1>面向矿业全链路的信息发布与撮合服务平台</h1>
            <p class="hero-desc">
              聚合矿权转让求购、矿产品供需、矿山设备、招标公告、展会资讯和企业展示，打造更清晰的行业门户。
            </p>
            <div class="hero-actions">
              <RouterLink to="/channel/mining-rights" class="primary-btn">查看矿权信息</RouterLink>
              <RouterLink to="/channel/products" class="secondary-btn">发布供需需求</RouterLink>
            </div>
          </div>

          <aside class="notice-card">
            <div class="section-title compact">
              <span>最新公告</span>
              <RouterLink to="/channel/tenders">更多</RouterLink>
            </div>
            <ul>
              <li v-for="item in homeTenderItems" :key="`${item.path}-${item.title}`">
                <RouterLink :to="item.path">{{ item.title }}</RouterLink>
                <small v-if="item.meta">{{ item.meta }}</small>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section class="container trade-section">
        <div class="section-title">
          <span>交易服务</span>
          <RouterLink to="/channel/mining-rights">更多交易信息</RouterLink>
        </div>
        <div class="trade-grid">
          <RouterLink v-for="card in homeTradeCards" :key="card.title" :to="card.path" class="trade-card">
            <strong>{{ card.title }}</strong>
            <p>{{ card.desc }}</p>
            <span>{{ card.count }}</span>
          </RouterLink>
        </div>
      </section>

      <section class="container content-grid">
        <article v-for="section in homeContentSections" :key="section.title" class="panel">
          <div class="section-title compact">
            <span>{{ section.title }}</span>
            <RouterLink :to="section.path">more</RouterLink>
          </div>
          <ul class="link-list">
            <li v-for="item in section.items" :key="`${section.title}-${item.path}-${item.title}`">
              <RouterLink :to="item.path">{{ item.title }}</RouterLink>
              <small v-if="item.meta">{{ item.meta }}</small>
            </li>
          </ul>
        </article>
      </section>

      <section class="container home-exhibition-section">
        <div class="section-title">
          <span>展会专区</span>
          <RouterLink to="/channel/exhibitions">更多展会</RouterLink>
        </div>
        <div class="home-exhibition-grid">
          <article v-for="item in featuredExhibitions" :key="item.id" class="home-exhibition-card panel">
            <RouterLink :to="`/exhibitions/${item.id}`" class="home-exhibition-image" :style="{ background: item.image }">
              <span>{{ item.type }}</span>
            </RouterLink>
            <div>
              <div class="mining-card-tags">
                <span v-for="tag in item.tags.slice(0, 2)" :key="`${item.id}-${tag}`">{{ tag }}</span>
              </div>
              <RouterLink :to="`/exhibitions/${item.id}`" class="home-exhibition-title">
                {{ item.title }}
              </RouterLink>
              <p>{{ item.dateRange }} · {{ item.city }}</p>
              <RouterLink :to="`/exhibitions/${item.id}`" class="home-exhibition-more">查看详情</RouterLink>
            </div>
          </article>
        </div>
      </section>

      <section class="container home-company-section">
        <div class="section-title">
          <span>推荐企业</span>
          <RouterLink to="/channel/companies">更多名企</RouterLink>
        </div>
        <article class="panel home-company-panel">
          <RouterLink
            v-for="company in homeCompanies"
            :key="`${company.id}-${company.name}`"
            :to="company.id > 0 ? `/companies/${company.id}` : '/channel/companies'"
            class="home-company-card"
          >
            <img :src="company.logo" :alt="company.name" loading="lazy" />
            <strong>{{ company.name }}</strong>
            <p>{{ company.summary }}</p>
            <span>{{ company.business_type }}<template v-if="company.region"> · {{ company.region }}</template></span>
          </RouterLink>
        </article>
      </section>
    </main>

    <section class="container footer-tools" aria-label="实用工具">
      <div class="footer-tools-title">实用工具</div>
      <div class="footer-tools-grid">
        <a
          v-for="tool in footerTools"
          :key="tool.label"
          :href="tool.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ tool.label }}
        </a>
      </div>
    </section>

    <footer class="footer">
      <div class="container footer-inner">
        <span>联系我们</span>
        <span>网站地图</span>
        <span>地址：内蒙古自治区赤峰市松山区王府大街东段</span>
        <span>Copyright © 2026 懂矿帝</span>
      </div>
    </footer>
  </div>
</template>
