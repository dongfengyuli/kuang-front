<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  deleteAdminMiningNews,
  getAdminMiningNewsList,
  updateAdminMiningNewsHot,
  updateAdminMiningNewsRecommend,
  updateAdminMiningNewsStatus,
  type AdminMiningNewsItem,
} from '../../services/admin/miningNews'

const statusOptions = [
  { label: '全部状态', value: -1 },
  { label: '下架', value: 0 },
  { label: '上架', value: 1 },
]

const categoryOptions = [
  { label: '全部分类', value: '' },
  { label: '国内资讯', value: 'domestic' },
  { label: '国外资讯', value: 'international' },
]

const sourceTypeOptions = [
  { label: '全部来源', value: '' },
  { label: '后台添加', value: 'manual' },
  { label: '爬虫采集', value: 'crawler' },
]

const filters = reactive({
  keyword: '',
  category: '',
  status: -1,
  source_type: '',
})

const list = ref<AdminMiningNewsItem[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref('')

function categoryText(category: string) {
  return category === 'international' ? '国外资讯' : '国内资讯'
}

function statusText(status: number) {
  return status === 1 ? '上架' : '下架'
}

function sourceText(sourceType: string) {
  return sourceType === 'manual' ? '后台添加' : '爬虫采集'
}

async function fetchList() {
  try {
    loading.value = true
    message.value = ''
    const result = await getAdminMiningNewsList({
      page: 1,
      page_size: 20,
      keyword: filters.keyword,
      category: filters.category || undefined,
      status: filters.status >= 0 ? filters.status : undefined,
      source_type: filters.source_type || undefined,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    message.value = error instanceof Error ? error.message : '资讯列表加载失败'
  } finally {
    loading.value = false
  }
}

async function toggleStatus(item: AdminMiningNewsItem) {
  await updateAdminMiningNewsStatus(item.id, item.status === 1 ? 0 : 1)
  fetchList()
}

async function toggleRecommend(item: AdminMiningNewsItem) {
  await updateAdminMiningNewsRecommend(item.id, !item.is_recommend)
  fetchList()
}

async function toggleHot(item: AdminMiningNewsItem) {
  await updateAdminMiningNewsHot(item.id, !item.is_hot)
  fetchList()
}

async function removeItem(item: AdminMiningNewsItem) {
  if (!window.confirm(`确认删除「${item.title}」吗？`)) {
    return
  }
  await deleteAdminMiningNews(item.id)
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>矿业资讯管理</h2>
        <p>维护国内资讯、国外资讯，支持多站点爬虫采集和后台人工发布。</p>
      </div>
      <RouterLink to="/admin/mining-news/create">新增资讯</RouterLink>
    </div>

    <form class="admin-filter" @submit.prevent="fetchList">
      <input v-model.trim="filters.keyword" type="search" placeholder="搜索标题、摘要、标签、来源" />
      <select v-model="filters.category" @change="fetchList">
        <option v-for="item in categoryOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <select v-model.number="filters.status" @change="fetchList">
        <option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <select v-model="filters.source_type" @change="fetchList">
        <option v-for="item in sourceTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <button type="submit">查询</button>
    </form>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>资讯</th>
            <th>分类</th>
            <th>来源</th>
            <th>状态</th>
            <th>推荐/热门</th>
            <th>浏览</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8">加载中...</td>
          </tr>
          <tr v-else-if="message">
            <td colspan="8">{{ message }}</td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="8">暂无矿业资讯</td>
          </tr>
          <tr v-for="item in list" v-else :key="item.id">
            <td>
              <strong>{{ item.title }}</strong>
              <small>{{ item.summary || '暂无摘要' }}</small>
            </td>
            <td>{{ categoryText(item.category) }}</td>
            <td>
              <strong>{{ sourceText(item.source_type) }}</strong>
              <small>{{ item.source_site }} / {{ item.source_name || '-' }}</small>
            </td>
            <td>
              <span class="admin-badge" :class="{ active: item.status === 1 }">{{ statusText(item.status) }}</span>
            </td>
            <td>{{ item.is_recommend ? '推荐' : '未推荐' }} / {{ item.is_hot ? '热门' : '普通' }}</td>
            <td>{{ item.view_count }}</td>
            <td>{{ item.published_at || '-' }}</td>
            <td>
              <div class="admin-row-actions">
                <RouterLink :to="`/admin/mining-news/${item.id}/edit`">编辑</RouterLink>
                <RouterLink :to="`/news/${item.id}`" target="_blank">预览</RouterLink>
                <button type="button" @click="toggleStatus(item)">{{ item.status === 1 ? '下架' : '上架' }}</button>
                <button type="button" @click="toggleRecommend(item)">{{ item.is_recommend ? '取消推荐' : '推荐' }}</button>
                <button type="button" @click="toggleHot(item)">{{ item.is_hot ? '取消热门' : '设为热门' }}</button>
                <button type="button" @click="removeItem(item)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="admin-total">共 {{ total }} 条</p>
  </section>
</template>
