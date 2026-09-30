<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  deleteAdminTenderNotice,
  getAdminTenderNoticeList,
  updateAdminTenderNoticeHot,
  updateAdminTenderNoticeRecommend,
  updateAdminTenderNoticeStatus,
  type AdminTenderNoticeItem,
} from '../../services/admin/tenders'

const statusOptions = [
  { label: '全部状态', value: -1 },
  { label: '下架', value: 0 },
  { label: '上架', value: 1 },
]

const noticeTypeOptions = ['', '招标公告', '采购公告', '中标公示', '变更公告']
const projectTypeOptions = ['', '采矿工程', '设备采购', '勘查服务', '生态修复', '智慧矿山', '工程服务']

const filters = reactive({
  keyword: '',
  notice_type: '',
  project_type: '',
  region: '',
  status: -1,
  source_type: '',
})

const list = ref<AdminTenderNoticeItem[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref('')

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
    const result = await getAdminTenderNoticeList({
      page: 1,
      page_size: 20,
      keyword: filters.keyword,
      notice_type: filters.notice_type || undefined,
      project_type: filters.project_type || undefined,
      region: filters.region || undefined,
      status: filters.status >= 0 ? filters.status : undefined,
      source_type: filters.source_type || undefined,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    message.value = error instanceof Error ? error.message : '公告列表加载失败'
  } finally {
    loading.value = false
  }
}

async function toggleStatus(item: AdminTenderNoticeItem) {
  await updateAdminTenderNoticeStatus(item.id, item.status === 1 ? 0 : 1)
  fetchList()
}

async function toggleRecommend(item: AdminTenderNoticeItem) {
  await updateAdminTenderNoticeRecommend(item.id, !item.is_recommend)
  fetchList()
}

async function toggleHot(item: AdminTenderNoticeItem) {
  await updateAdminTenderNoticeHot(item.id, !item.is_hot)
  fetchList()
}

async function removeItem(item: AdminTenderNoticeItem) {
  if (!window.confirm(`确认删除「${item.title}」吗？`)) {
    return
  }
  await deleteAdminTenderNotice(item.id)
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>招标公告管理</h2>
        <p>维护招标公告、采购公告、中标公示和变更公告，支持后续多站点爬虫采集。</p>
      </div>
      <RouterLink to="/admin/tenders/create">新增公告</RouterLink>
    </div>

    <form class="admin-filter" @submit.prevent="fetchList">
      <input v-model.trim="filters.keyword" type="search" placeholder="搜索标题、招标人、代理机构、标签" />
      <input v-model.trim="filters.region" type="search" placeholder="地区" />
      <select v-model="filters.notice_type" @change="fetchList">
        <option v-for="item in noticeTypeOptions" :key="item" :value="item">{{ item || '全部公告' }}</option>
      </select>
      <select v-model="filters.project_type" @change="fetchList">
        <option v-for="item in projectTypeOptions" :key="item" :value="item">{{ item || '全部项目' }}</option>
      </select>
      <select v-model.number="filters.status" @change="fetchList">
        <option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <select v-model="filters.source_type" @change="fetchList">
        <option value="">全部来源</option>
        <option value="manual">后台添加</option>
        <option value="crawler">爬虫采集</option>
      </select>
      <button type="submit">查询</button>
    </form>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>公告</th>
            <th>类型</th>
            <th>招标人/地区</th>
            <th>状态</th>
            <th>推荐/热门</th>
            <th>截止时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7">加载中...</td>
          </tr>
          <tr v-else-if="message">
            <td colspan="7">{{ message }}</td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="7">暂无招标公告</td>
          </tr>
          <tr v-for="item in list" v-else :key="item.id">
            <td>
              <strong>{{ item.title }}</strong>
              <small>{{ item.summary || '暂无摘要' }}</small>
            </td>
            <td>
              <strong>{{ item.notice_type }}</strong>
              <small>{{ item.project_type }}</small>
            </td>
            <td>
              <strong>{{ item.publisher || '-' }}</strong>
              <small>{{ item.region || '-' }}</small>
            </td>
            <td>
              <span class="admin-badge" :class="{ active: item.status === 1 }">{{ statusText(item.status) }}</span>
            </td>
            <td>{{ item.is_recommend ? '推荐' : '未推荐' }} / {{ item.is_hot ? '热门' : '普通' }}</td>
            <td>{{ item.deadline_at || '-' }}</td>
            <td>
              <div class="admin-row-actions">
                <RouterLink :to="`/admin/tenders/${item.id}/edit`">编辑</RouterLink>
                <RouterLink :to="`/tenders/${item.id}`" target="_blank">预览</RouterLink>
                <button type="button" @click="toggleStatus(item)">{{ item.status === 1 ? '下架' : '上架' }}</button>
                <button type="button" @click="toggleRecommend(item)">{{ item.is_recommend ? '取消推荐' : '推荐' }}</button>
                <button type="button" @click="toggleHot(item)">{{ item.is_hot ? '取消热门' : '设为热门' }}</button>
                <button type="button" @click="removeItem(item)">删除</button>
              </div>
              <small>{{ sourceText(item.source_type) }} · {{ item.source_site }}</small>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="admin-total">共 {{ total }} 条</p>
  </section>
</template>
