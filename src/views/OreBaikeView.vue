<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getOreBaikeList, type OreBaikeItem } from '../services/oreBaike'

const pageSize = 10
const hotTags = ['矿山规划', '矿机优选', '勘建采选', '安全生产', '绿色矿山', '矿物分类', '陶瓷原料', '玻璃原料']

const filters = reactive({
  keyword: '',
  tag: '',
  sort: 'latest',
})

const currentPage = ref(1)
const total = ref(0)
const list = ref<OreBaikeItem[]>([])
const recommended = ref<OreBaikeItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function fetchList() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getOreBaikeList({
      page: currentPage.value,
      page_size: pageSize,
      keyword: filters.keyword,
      tag: filters.tag,
      sort: filters.sort,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '矿业百科加载失败'
  } finally {
    loading.value = false
  }
}

async function fetchRecommended() {
  try {
    const result = await getOreBaikeList({
      page: 1,
      page_size: 6,
      is_recommend: 1,
      sort: 'popular',
    })
    recommended.value = result.list || []
  } catch {
    recommended.value = []
  }
}

function submitSearch() {
  currentPage.value = 1
  fetchList()
}

function setTag(tag: string) {
  filters.tag = filters.tag === tag ? '' : tag
  currentPage.value = 1
  fetchList()
}

function resetFilters() {
  Object.assign(filters, {
    keyword: '',
    tag: '',
    sort: 'latest',
  })
  currentPage.value = 1
  fetchList()
}

function changePage(page: number) {
  currentPage.value = page
  fetchList()
}

onMounted(() => {
  fetchRecommended()
  fetchList()
})
</script>

<template>
  <main class="trade-page baike-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="baike-hero">
      <div class="container baike-hero-inner">
        <p class="eyebrow">MINING ENCYCLOPEDIA</p>
        <h1>矿业百科</h1>
        <p>聚合矿山规划、矿机优选、勘建采选、安全生产、矿物原料和地质基础知识，方便矿业从业者快速查阅和沉淀经验。</p>
        <form class="baike-hero-search" @submit.prevent="submitSearch">
          <input v-model.trim="filters.keyword" type="search" placeholder="搜索矿种、用途、鉴别方法、化学成分" />
          <button type="submit">搜索百科</button>
        </form>
      </div>
    </section>

    <section class="container baike-layout">
      <div class="trade-main">
        <section class="panel baike-filter">
          <div class="products-current-search">
            <strong>当前搜索</strong>
            <span>{{ filters.keyword || filters.tag || '全部矿业百科' }}</span>
            <button type="button" @click="resetFilters">重置</button>
          </div>
          <div>
            <strong>热门分类</strong>
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
            <input v-model.trim="filters.keyword" type="search" placeholder="百科标题 / 摘要 / 正文关键词" />
            <select v-model="filters.sort" @change="submitSearch">
              <option value="latest">最新发布</option>
              <option value="popular">浏览最多</option>
            </select>
            <button type="submit">搜索</button>
          </form>
        </section>

        <section class="panel baike-list-panel">
          <div class="section-title compact">
            <span>百科条目</span>
            <small>共 {{ total }} 条</small>
          </div>
          <div v-if="loading" class="trade-empty">矿业百科加载中...</div>
          <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
          <div v-else-if="list.length === 0" class="trade-empty">暂无百科内容</div>

          <article v-for="item in list" v-else :key="item.id" class="baike-card">
            <RouterLink :to="`/baike/${item.id}`" class="baike-cover">
              <img v-if="item.cover" :src="item.cover" :alt="item.title" />
              <span v-else>{{ item.title.slice(0, 1) }}</span>
            </RouterLink>
            <div class="baike-card-body">
              <div class="mining-card-tags">
                <span v-for="tag in item.tags.slice(0, 3)" :key="`${item.id}-${tag}`">{{ tag }}</span>
              </div>
              <RouterLink :to="`/baike/${item.id}`" class="baike-card-title">{{ item.title }}</RouterLink>
              <p>{{ item.summary || '暂无摘要，点击查看百科正文。' }}</p>
              <div class="mining-card-meta">
                <span>{{ item.source_name || '矿业百科' }}</span>
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
            <span>推荐百科</span>
          </div>
          <RouterLink v-for="item in recommended" :key="item.id" :to="`/baike/${item.id}`">
            <strong>{{ item.title }}</strong>
            <span>{{ item.published_at || '-' }} · {{ item.view_count }} 次浏览</span>
          </RouterLink>
          <div v-if="recommended.length === 0" class="trade-empty">暂无推荐百科</div>
        </section>
      </aside>
    </section>
  </main>
</template>
