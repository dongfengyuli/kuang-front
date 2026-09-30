<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getTenderNoticeList, type TenderNoticeItem } from '../services/tenders'

const pageSize = 10

const noticeTypes = ['全部公告', '招标公告', '采购公告', '中标公示', '变更公告']
const projectTypes = ['全部项目', '采矿工程', '设备采购', '勘查服务', '生态修复', '智慧矿山', '工程服务']
const hotTags = ['采矿工程', '设备采购', '生态修复', '智慧矿山', '勘查服务', '井巷施工', '监理服务']

const filters = reactive({
  keyword: '',
  notice_type: '',
  project_type: '',
  region: '',
  tag: '',
  sort: 'latest',
})

const currentPage = ref(1)
const total = ref(0)
const list = ref<TenderNoticeItem[]>([])
const hotList = ref<TenderNoticeItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function typeClass(type: string) {
  if (type.includes('中标')) return 'success'
  if (type.includes('变更')) return 'warning'
  if (type.includes('采购')) return 'buy'
  return 'sell'
}

async function fetchList() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getTenderNoticeList({
      page: currentPage.value,
      page_size: pageSize,
      notice_type: filters.notice_type,
      project_type: filters.project_type,
      region: filters.region,
      keyword: filters.keyword,
      tag: filters.tag,
      sort: filters.sort,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '招标公告加载失败'
  } finally {
    loading.value = false
  }
}

async function fetchHotList() {
  try {
    const result = await getTenderNoticeList({ page: 1, page_size: 6, is_hot: 1, sort: 'hot' })
    hotList.value = result.list || []
  } catch {
    hotList.value = []
  }
}

function submitSearch() {
  currentPage.value = 1
  fetchList()
}

function setNoticeType(type: string) {
  filters.notice_type = type === '全部公告' ? '' : type
  currentPage.value = 1
  fetchList()
}

function setProjectType(type: string) {
  filters.project_type = type === '全部项目' ? '' : type
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
  filters.notice_type = ''
  filters.project_type = ''
  filters.region = ''
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
  fetchHotList()
  fetchList()
})
</script>

<template>
  <main class="trade-page tender-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="tender-hero">
      <div class="container news-hero-inner">
        <p class="eyebrow">TENDER NOTICE</p>
        <h1>招标公告</h1>
        <p>聚合矿业工程、设备采购、勘查服务、生态修复和智慧矿山项目招投标信息，支持多来源采集和后台维护。</p>
        <form class="baike-hero-search" @submit.prevent="submitSearch">
          <input v-model.trim="filters.keyword" type="search" placeholder="搜索项目名称、招标人、代理机构、矿种或地区" />
          <button type="submit">搜索公告</button>
        </form>
      </div>
    </section>

    <section class="container baike-layout">
      <div class="trade-main">
        <section class="panel baike-filter">
          <div>
            <strong>公告类型</strong>
            <button
              v-for="item in noticeTypes"
              :key="item"
              type="button"
              :class="{ active: filters.notice_type === (item === '全部公告' ? '' : item) }"
              @click="setNoticeType(item)"
            >
              {{ item }}
            </button>
          </div>
          <div>
            <strong>项目类型</strong>
            <button
              v-for="item in projectTypes"
              :key="item"
              type="button"
              :class="{ active: filters.project_type === (item === '全部项目' ? '' : item) }"
              @click="setProjectType(item)"
            >
              {{ item }}
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
            <input v-model.trim="filters.region" type="search" placeholder="地区，如 内蒙古 / 新疆 / 山西" />
            <input v-model.trim="filters.keyword" type="search" placeholder="标题 / 正文关键词" />
            <select v-model="filters.sort" @change="submitSearch">
              <option value="latest">最新发布</option>
              <option value="deadline">截止时间</option>
              <option value="hot">热门优先</option>
            </select>
            <button type="submit">查询</button>
            <button type="button" @click="resetFilters">重置</button>
          </form>
        </section>

        <section class="panel baike-list-panel">
          <div class="section-title compact">
            <span>公告列表</span>
            <small>共 {{ total }} 条</small>
          </div>
          <div v-if="loading" class="trade-empty">招标公告加载中...</div>
          <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
          <div v-else-if="list.length === 0" class="trade-empty">暂无招标公告</div>

          <article v-for="item in list" v-else :key="item.id" class="tender-card">
            <div>
              <div class="mining-card-tags">
                <span :class="typeClass(item.notice_type)">{{ item.notice_type }}</span>
                <span>{{ item.project_type || '矿业项目' }}</span>
                <span v-if="item.region">{{ item.region }}</span>
                <span v-for="tag in item.tags.slice(0, 2)" :key="`${item.id}-${tag}`">{{ tag }}</span>
              </div>
              <RouterLink :to="`/tenders/${item.id}`" class="baike-card-title">{{ item.title }}</RouterLink>
              <p>{{ item.summary || '暂无摘要，点击查看公告正文。' }}</p>
              <div class="mining-card-meta">
                <span>招标人：{{ item.publisher || '详见公告' }}</span>
                <span>截止：{{ item.deadline_at || '详见公告' }}</span>
                <span>{{ item.view_count }} 次浏览</span>
              </div>
            </div>
            <aside>
              <strong>{{ item.budget || '金额详见公告' }}</strong>
              <RouterLink :to="`/tenders/${item.id}`">查看详情</RouterLink>
            </aside>
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
            <span>热门公告</span>
          </div>
          <RouterLink v-for="item in hotList" :key="item.id" :to="`/tenders/${item.id}`">
            <strong>{{ item.title }}</strong>
            <span>{{ item.notice_type }} · {{ item.published_at || '-' }}</span>
          </RouterLink>
          <div v-if="hotList.length === 0" class="trade-empty">暂无热门公告</div>
        </section>
      </aside>
    </section>
  </main>
</template>
