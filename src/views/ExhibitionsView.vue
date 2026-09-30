<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  exhibitionRegions,
  exhibitionSortOptions,
  exhibitionStatusOptions,
  exhibitionTimeFilters,
  exhibitionTypes,
  exhibitions as fallbackExhibitions,
  type ExhibitionStatus,
} from '../data/exhibitions'
import { getExhibitionList } from '../services/exhibitions'

const pageSize = 10

const filters = reactive({
  time: 'all',
  region: 'all',
  type: 'all',
  status: 'all',
  keyword: '',
  sort: 'nearest',
})

const currentPage = ref(1)
const featured = ref(fallbackExhibitions.filter((item) => item.status !== 'ended').sort((a, b) => b.heat - a.heat).slice(0, 3))
const list = ref(fallbackExhibitions)
const total = ref(fallbackExhibitions.length)
const loading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const pagedExhibitions = computed(() => list.value)

function statusText(status: ExhibitionStatus) {
  return {
    upcoming: '预告',
    ongoing: '进行中',
    ended: '已结束',
  }[status]
}

function setFilter(key: 'time' | 'region' | 'type' | 'status', value: string) {
  filters[key] = value
  currentPage.value = 1
  fetchList()
}

function resetFilters() {
  Object.assign(filters, {
    time: 'all',
    region: 'all',
    type: 'all',
    status: 'all',
    keyword: '',
    sort: 'nearest',
  })
  currentPage.value = 1
  fetchList()
}

function submitSearch() {
  currentPage.value = 1
  fetchList()
}

function changePage(page: number) {
  currentPage.value = page
  fetchList()
}

function apiFilterValue(value: string) {
  return value === 'all' ? undefined : value
}

async function fetchFeatured() {
  try {
    const result = await getExhibitionList({
      page: 1,
      page_size: 3,
      is_recommend: 1,
      sort: 'recommend',
    })
    if (result.list.length > 0) {
      featured.value = result.list
    }
  } catch {
    featured.value = fallbackExhibitions.filter((item) => item.status !== 'ended').sort((a, b) => b.heat - a.heat).slice(0, 3)
  }
}

async function fetchList() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getExhibitionList({
      page: currentPage.value,
      page_size: pageSize,
      time_range: apiFilterValue(filters.time),
      region: apiFilterValue(filters.region),
      type: apiFilterValue(filters.type),
      status: apiFilterValue(filters.status),
      keyword: filters.keyword,
      sort: filters.sort,
    })
    list.value = result.list
    total.value = result.total
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '展会列表加载失败，已展示本地示例数据'
    list.value = fallbackExhibitions.slice(0, pageSize)
    total.value = fallbackExhibitions.length
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFeatured()
  fetchList()
})
</script>

<template>
  <main class="trade-page exhibition-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="trade-hero exhibition-hero">
      <div class="container trade-hero-inner">
        <p class="eyebrow">MINING EXHIBITIONS</p>
        <h1>展会信息</h1>
        <p>面向矿主、设备商、工程公司和服务商，聚合矿业展会、展商名录、同期活动和预登记入口。</p>
        <div class="exhibition-hero-actions">
          <a href="#exhibition-list">查展会</a>
          <a href="#featured-exhibitions">热门展会</a>
          <a href="tel:18748063792">发布展会</a>
        </div>
      </div>
    </section>

    <section id="featured-exhibitions" class="container exhibition-featured">
      <div class="section-title">
        <span>展会专区</span>
        <a href="#exhibition-list">更多展会</a>
      </div>
      <div class="exhibition-featured-grid">
        <article v-for="item in featured" :key="item.id" class="exhibition-feature-card panel">
          <div class="exhibition-card-image" :style="{ background: item.image }">
            <span>{{ item.type }}</span>
          </div>
          <div>
            <div class="mining-card-tags">
              <span v-for="tag in item.tags.slice(0, 3)" :key="`${item.id}-${tag}`">{{ tag }}</span>
            </div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.dateRange }} · {{ item.city }}</p>
            <RouterLink :to="`/exhibitions/${item.id}`">查看详情</RouterLink>
          </div>
        </article>
      </div>
    </section>

    <section id="exhibition-list" class="container trade-layout exhibition-layout">
      <div class="trade-main">
        <section class="trade-filter panel exhibition-filter">
          <div class="products-current-search">
            <strong>当前搜索</strong>
            <span>{{ filters.keyword || '全部矿业展会' }}</span>
            <button type="button" @click="resetFilters">重置</button>
          </div>

          <div>
            <strong>时间</strong>
            <button
              v-for="item in exhibitionTimeFilters"
              :key="item.value"
              type="button"
              :class="{ active: filters.time === item.value }"
              @click="setFilter('time', item.value)"
            >
              {{ item.label }}
            </button>
          </div>

          <div>
            <strong>地区</strong>
            <button
              type="button"
              :class="{ active: filters.region === 'all' }"
              @click="setFilter('region', 'all')"
            >
              全部
            </button>
            <button
              v-for="item in exhibitionRegions"
              :key="item"
              type="button"
              :class="{ active: filters.region === item }"
              @click="setFilter('region', item)"
            >
              {{ item }}
            </button>
          </div>

          <div>
            <strong>类型</strong>
            <button type="button" :class="{ active: filters.type === 'all' }" @click="setFilter('type', 'all')">
              全部
            </button>
            <button
              v-for="item in exhibitionTypes"
              :key="item"
              type="button"
              :class="{ active: filters.type === item }"
              @click="setFilter('type', item)"
            >
              {{ item }}
            </button>
          </div>

          <div>
            <strong>状态</strong>
            <button
              v-for="item in exhibitionStatusOptions"
              :key="item.value"
              type="button"
              :class="{ active: filters.status === item.value }"
              @click="setFilter('status', item.value)"
            >
              {{ item.label }}
            </button>
          </div>

          <form class="trade-search exhibition-search" @submit.prevent="submitSearch">
            <input v-model.trim="filters.keyword" type="search" placeholder="展会名称 / 城市 / 关键词" />
            <select v-model="filters.sort" @change="submitSearch">
              <option v-for="item in exhibitionSortOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <button type="submit">搜索</button>
          </form>
        </section>

        <section class="trade-list panel">
          <div class="section-title compact">
            <span>展会列表</span>
            <small>共 {{ total }} 条</small>
          </div>

          <div v-if="loading" class="trade-empty">展会列表加载中...</div>
          <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
          <div v-else-if="pagedExhibitions.length === 0" class="trade-empty">暂无符合条件的展会</div>

          <article v-for="item in pagedExhibitions" v-else :key="item.id" class="exhibition-list-card">
            <RouterLink :to="`/exhibitions/${item.id}`" class="exhibition-list-image" :style="{ background: item.image }">
              <span>{{ statusText(item.status) }}</span>
            </RouterLink>
            <div class="exhibition-list-body">
              <div class="mining-card-tags">
                <span>{{ item.region === '海外' ? item.country || '海外' : item.region }}</span>
                <span>{{ item.type }}</span>
                <span>{{ statusText(item.status) }}</span>
              </div>
              <RouterLink :to="`/exhibitions/${item.id}`" class="exhibition-list-title">
                {{ item.title }}
              </RouterLink>
              <dl class="exhibition-list-facts">
                <div>
                  <dt>时间</dt>
                  <dd>{{ item.dateRange }}</dd>
                </div>
                <div>
                  <dt>地点</dt>
                  <dd>{{ item.city }} · {{ item.venue }}</dd>
                </div>
              </dl>
              <p>{{ item.summary }}</p>
              <div class="exhibition-list-actions">
                <RouterLink :to="`/exhibitions/${item.id}`">详情</RouterLink>
                <a href="tel:18748063792">我要参展</a>
                <a href="tel:18748063792">预登记</a>
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
        <section class="panel exhibition-aside-card">
          <div class="section-title compact">
            <span>参展服务</span>
          </div>
          <p>展位预订、展商名录、论坛报名、商务对接、海外展行程咨询。</p>
          <a href="tel:18748063792">联系展会顾问</a>
        </section>

        <section class="panel exhibition-aside-card">
          <div class="section-title compact">
            <span>热门标签</span>
          </div>
          <div class="exhibition-hot-tags">
            <button type="button" @click="setFilter('type', '矿机设备')">矿山设备</button>
            <button type="button" @click="setFilter('type', '智慧矿山')">智慧矿山</button>
            <button type="button" @click="setFilter('region', '海外')">海外展</button>
            <button type="button" @click="setFilter('type', '有色')">有色金属</button>
          </div>
        </section>
      </aside>
    </section>
  </main>
</template>
