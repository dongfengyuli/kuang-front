<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  deleteAdminEquipment,
  getAdminEquipmentCategoryList,
  getAdminEquipmentList,
  updateAdminEquipmentRecommend,
  updateAdminEquipmentStatus,
  type AdminEquipmentCategory,
  type AdminEquipmentItem,
} from '../../services/admin/equipment'

const statusOptions = [
  { label: '全部状态', value: -1 },
  { label: '下架', value: 0 },
  { label: '上架', value: 1 },
]

const filters = reactive({
  keyword: '',
  category_id: 0,
  status: -1,
})

const list = ref<AdminEquipmentItem[]>([])
const categories = ref<AdminEquipmentCategory[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref('')

function statusText(status: number) {
  return status === 1 ? '上架' : '下架'
}

async function fetchList() {
  try {
    loading.value = true
    message.value = ''
    const result = await getAdminEquipmentList({
      page: 1,
      page_size: 20,
      keyword: filters.keyword,
      category_id: filters.category_id || undefined,
      status: filters.status >= 0 ? filters.status : undefined,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    message.value = error instanceof Error ? error.message : '设备列表加载失败'
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  const result = await getAdminEquipmentCategoryList(0)
  categories.value = result.list || []
}

async function toggleStatus(item: AdminEquipmentItem) {
  await updateAdminEquipmentStatus(item.id, item.status === 1 ? 0 : 1)
  fetchList()
}

async function toggleRecommend(item: AdminEquipmentItem) {
  await updateAdminEquipmentRecommend(item.id, !item.is_recommended)
  fetchList()
}

async function removeItem(item: AdminEquipmentItem) {
  if (!window.confirm(`确认删除「${item.title}」吗？`)) {
    return
  }

  await deleteAdminEquipment(item.id)
  fetchList()
}

onMounted(async () => {
  await loadCategories()
  fetchList()
})
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>矿山设备管理</h2>
        <p>维护前台矿山设备频道展示的产品、型号、供应商和上下架状态。</p>
      </div>
      <RouterLink to="/admin/equipment/create">新增设备</RouterLink>
    </div>

    <form class="admin-filter" @submit.prevent="fetchList">
      <input v-model.trim="filters.keyword" type="search" placeholder="搜索设备名称、型号、供应商" />
      <select v-model.number="filters.category_id" @change="fetchList">
        <option :value="0">全部品类</option>
        <option v-for="item in categories" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
      <select v-model.number="filters.status" @change="fetchList">
        <option v-for="item in statusOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
      <button type="submit">查询</button>
    </form>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>设备</th>
            <th>型号</th>
            <th>品类</th>
            <th>供应商</th>
            <th>状态</th>
            <th>推荐</th>
            <th>更新时间</th>
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
            <td colspan="8">暂无设备数据</td>
          </tr>
          <tr v-for="item in list" v-else :key="item.id">
            <td>
              <strong>{{ item.title }}</strong>
              <small>{{ item.summary || '暂无简介' }}</small>
            </td>
            <td>{{ item.model || '-' }}</td>
            <td>{{ item.category_name || item.category_id }}</td>
            <td>{{ item.company_name || '-' }}</td>
            <td>
              <span class="admin-badge" :class="{ active: item.status === 1 }">{{ statusText(item.status) }}</span>
            </td>
            <td>{{ item.is_recommended ? '是' : '否' }}</td>
            <td>{{ item.updated_at || '-' }}</td>
            <td>
              <div class="admin-row-actions">
                <RouterLink :to="`/admin/equipment/${item.id}/edit`">编辑</RouterLink>
                <button type="button" @click="toggleStatus(item)">
                  {{ item.status === 1 ? '下架' : '上架' }}
                </button>
                <button type="button" @click="toggleRecommend(item)">
                  {{ item.is_recommended ? '取消推荐' : '推荐' }}
                </button>
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
