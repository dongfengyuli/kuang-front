<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getMiningNewsList, type MiningNewsItem } from '../services/miningNews'

const route = useRoute()
const pageSize = 10

const categoryOptions = [
  { label: '全部资讯', value: '' },
  { label: '国内资讯', value: 'domestic' },
  { label: '国外资讯', value: 'international' },
]

const hotTags = ['政策', '找矿突破', '绿色矿山', '铜矿', '镍矿', '海外矿业', '安全生产', '矿山智能化']

const filters = reactive({
  keyword: '',
  category: '',
  tag: '',
  sort: 'latest',
})

const currentPage = ref(1)
const total = ref(0)
const list = ref<MiningNewsItem[]>([])
const hotList = ref<MiningNewsItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function categoryText(category: string) {
  return category === 'international' ? '国外资讯' : '国内资讯'
}

function applyRouteCategory() {
  const category = String(route.query.category || '')
  if (category === 'domestic' || category === 'international') {
    filters.category = category
  }
}

async function fetchList() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getMiningNewsList({
      page: currentPage.value,
      page_size: pageSize,
      category: filters.category,
      keyword: filters.keyword,
      tag: filters.tag,
      sort: filters.sort,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '矿业资讯加载失败'
  } finally {
    loading.value = false
  }
}

async function fetchHotList() {
  try {
    const result = await getMiningNewsList({ page: 1, page_size: 6, is_hot: 1, sort: 'hot' })
    hotList.value = result.list || []
  } catch {
    hotList.value = []
  }
}

function submitSearch() {
  currentPage.value = 1
  fetchList()
}

function setCategory(category: string) {
  filters.category = category
  currentPage.value = 1
  fetchList()
}

function setTag(tag: string) {
  filters.tag = filters.tag === tag ? '' : tag
  currentPage.value = 1
  fetchList()
}

function resetFilters() {
  filters.keyword = ''
  filters.category = ''
  filters.tag = ''
  filters.sort = 'latest'
  currentPage.value = 1
  fetchList()
}

function changePage(page: number) {
  currentPage.value = page
  fetchList()
}

onMounted(() => {
  applyRouteCategory()
  fetchHotList()
  fetchList()
})

watch(
  () => route.query.category,
  () => {
    applyRouteCategory()
    currentPage.value = 1
    fetchList()
  },
)
</script>

<template>
  <main class="trade-page mining-news-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="news-hero">
      <div class="container news-hero-inner">
        <p class="eyebrow">MINING NEWS</p>
        <h1>矿业资讯</h1>
        <p>聚合国内外矿业政策、项目、市场、技术、安全生产与海外资源动态，支持多站点爬虫采集和后台人工维护。</p>
        <form class="baike-hero-search" @submit.prevent="submitSearch">
          <input v-model.trim="filters.keyword" type="search" placeholder="搜索矿业政策、项目、矿种、企业或地区" />
          <button type="submit">搜索资讯</button>
        </form>
      </div>
    </section>

    <section class="container baike-layout">
      <div class="trade-main">
        <section class="panel baike-filter">
          <div>
            <strong>资讯分类</strong>
            <button
              v-for="item in categoryOptions"
              :key="item.value"
              type="button"
              :class="{ active: filters.category === item.value }"
              @click="setCategory(item.value)"
            >
              {{ item.label }}
            </button>
          </div>
          <div>
            <strong>热点标签</strong>
            <button
              v-for="tag in hotTags"
              :key="tag"
              type="button"
              :class="{ active: filters.tag === tag }"
              @click="setTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
          <form class="trade-search exhibition-search" @submit.prevent="submitSearch">
            <input v-model.trim="filters.keyword" type="search" placeholder="标题 / 摘要 / 正文关键词" />
            <select v-model="filters.sort" @change="submitSearch">
              <option value="latest">最新发布</option>
              <option value="hot">热门优先</option>
            </select>
            <button type="submit">查询</button>
            <button type="button" @click="resetFilters">重置</button>
          </form>
        </section>

        <section class="panel baike-list-panel">
          <div class="section-title compact">
            <span>资讯列表</span>
            <small>共 {{ total }} 条</small>
          </div>
          <div v-if="loading" class="trade-empty">矿业资讯加载中...</div>
          <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
          <div v-else-if="list.length === 0" class="trade-empty">暂无资讯内容</div>

          <article v-for="item in list" v-else :key="item.id" class="baike-card news-card" :class="{ 'news-card-no-cover': !item.cover }">
            <RouterLink v-if="item.cover" :to="`/news/${item.id}`" class="baike-cover">
              <img :src="item.cover" :alt="item.title" />
            </RouterLink>
            <div class="baike-card-body">
              <div class="mining-card-tags">
                <span>{{ categoryText(item.category) }}</span>
                <span v-for="tag in item.tags.slice(0, 3)" :key="`${item.id}-${tag}`">{{ tag }}</span>
              </div>
              <RouterLink :to="`/news/${item.id}`" class="baike-card-title">{{ item.title }}</RouterLink>
              <p>{{ item.summary || '暂无摘要，点击查看资讯正文。' }}</p>
              <div class="mining-card-meta">
                <span>{{ item.source_name || item.source_site || '懂矿帝' }}</span>
                <span>{{ item.published_at || '-' }}</span>
                <span>{{ item.view_count }} 次浏览</span>
              </div>
            </div>
          </article>

          <div v-if="totalPages > 1" class="pagination">
            <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <button type="button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</button>
          </div>
        </section>
      </div>

      <aside class="equipment-sidebar">
        <section class="panel baike-side-card">
          <div class="section-title compact">
            <span>热门资讯</span>
          </div>
          <RouterLink v-for="item in hotList" :key="item.id" :to="`/news/${item.id}`">
            <strong>{{ item.title }}</strong>
            <span>{{ categoryText(item.category) }} · {{ item.published_at || '-' }}</span>
          </RouterLink>
          <div v-if="hotList.length === 0" class="trade-empty">暂无热门资讯</div>
        </section>
      </aside>
    </section>
  </main>
</template>
