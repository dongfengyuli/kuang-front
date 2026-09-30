<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getRecommendedCompanyList, type RecommendedCompanyItem } from '../services/recommendedCompanies'

const pageSize = 12
const businessTypes = ['全部企业', '矿山开发', '工程技术', '设备制造', '安全技术', '绿色矿山', '智能矿山']

const filters = reactive({
  keyword: '',
  business_type: '',
  region: '',
})
const currentPage = ref(1)
const total = ref(0)
const list = ref<RecommendedCompanyItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function fetchList() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getRecommendedCompanyList({
      page: currentPage.value,
      page_size: pageSize,
      keyword: filters.keyword,
      business_type: filters.business_type,
      region: filters.region,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '推荐企业加载失败'
  } finally {
    loading.value = false
  }
}

function submitSearch() {
  currentPage.value = 1
  fetchList()
}

function setBusinessType(type: string) {
  filters.business_type = type === '全部企业' ? '' : type
  currentPage.value = 1
  fetchList()
}

function changePage(page: number) {
  currentPage.value = page
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <main class="trade-page company-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="company-hero">
      <div class="container news-hero-inner">
        <p class="eyebrow">FEATURED COMPANIES</p>
        <h1>推荐企业</h1>
        <p>展示矿山开发、工程技术、矿山装备、绿色智能矿山和安全生产领域优质企业。</p>
        <form class="baike-hero-search" @submit.prevent="submitSearch">
          <input v-model.trim="filters.keyword" type="search" placeholder="搜索企业名称、主营产品、标签" />
          <button type="submit">搜索企业</button>
        </form>
      </div>
    </section>

    <section class="container company-list-layout">
      <section class="panel baike-filter">
        <div>
          <strong>企业类型</strong>
          <button
            v-for="item in businessTypes"
            :key="item"
            type="button"
            :class="{ active: filters.business_type === (item === '全部企业' ? '' : item) }"
            @click="setBusinessType(item)"
          >
            {{ item }}
          </button>
        </div>
        <form class="trade-search exhibition-search" @submit.prevent="submitSearch">
          <input v-model.trim="filters.region" type="search" placeholder="地区，如 北京 / 辽宁 / 内蒙古" />
          <button type="submit">筛选</button>
        </form>
      </section>

      <section class="company-grid">
        <div v-if="loading" class="trade-empty panel">推荐企业加载中...</div>
        <div v-else-if="errorMessage" class="trade-empty panel">{{ errorMessage }}</div>
        <div v-else-if="list.length === 0" class="trade-empty panel">暂无推荐企业</div>
        <RouterLink v-for="item in list" v-else :key="item.id" :to="`/companies/${item.id}`" class="panel company-card">
          <img :src="item.logo || item.cover" :alt="item.name" loading="lazy" />
          <div>
            <div class="mining-card-tags">
              <span v-if="item.business_type">{{ item.business_type }}</span>
              <span v-if="item.region">{{ item.region }}</span>
            </div>
            <h2>{{ item.name }}</h2>
            <p>{{ item.summary || item.products }}</p>
            <small>{{ item.products }}</small>
          </div>
        </RouterLink>
      </section>

      <div class="pager" v-if="totalPages > 1">
        <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">下一页</button>
      </div>
    </section>
  </main>
</template>
