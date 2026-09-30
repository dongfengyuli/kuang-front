<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  getAdminEquipmentInquiryList,
  updateAdminEquipmentInquiryStatus,
  type AdminEquipmentInquiryItem,
} from '../../services/admin/inquiry'

const statusOptions = [
  { label: '全部状态', value: -1 },
  { label: '待处理', value: 0 },
  { label: '已联系', value: 1 },
  { label: '已关闭', value: 2 },
]

const filters = reactive({
  keyword: '',
  status: -1,
})

const list = ref<AdminEquipmentInquiryItem[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref('')

function statusText(status: number) {
  return statusOptions.find((item) => item.value === status)?.label || '待处理'
}

async function fetchList() {
  try {
    loading.value = true
    message.value = ''
    const result = await getAdminEquipmentInquiryList({
      page: 1,
      page_size: 20,
      keyword: filters.keyword,
      status: filters.status >= 0 ? filters.status : undefined,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    message.value = error instanceof Error ? error.message : '询盘列表加载失败'
  } finally {
    loading.value = false
  }
}

async function updateStatus(item: AdminEquipmentInquiryItem, status: number) {
  await updateAdminEquipmentInquiryStatus(item.id, status)
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>询盘管理</h2>
        <p>处理前台矿山设备频道提交的一键询盘和批量询盘。</p>
      </div>
    </div>

    <form class="admin-filter" @submit.prevent="fetchList">
      <input v-model.trim="filters.keyword" type="search" placeholder="搜索询盘标题、联系人、电话" />
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
            <th>询盘</th>
            <th>关联产品</th>
            <th>采购数量</th>
            <th>联系人</th>
            <th>状态</th>
            <th>提交时间</th>
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
            <td colspan="7">暂无询盘</td>
          </tr>
          <tr v-for="item in list" v-else :key="item.id">
            <td>
              <strong>{{ item.title }}</strong>
              <small>{{ item.content }}</small>
            </td>
            <td>{{ item.product_titles?.join('、') || '-' }}</td>
            <td>{{ item.quantity || '-' }}</td>
            <td>
              <strong>{{ item.contact_name }}</strong>
              <small>{{ item.contact_phone }} / {{ item.company_name || '-' }}</small>
            </td>
            <td>
              <span class="admin-badge" :class="{ active: item.status === 1 }">{{ statusText(item.status) }}</span>
            </td>
            <td>{{ item.created_at || '-' }}</td>
            <td>
              <div class="admin-row-actions">
                <button type="button" @click="updateStatus(item, 1)">标记已联系</button>
                <button type="button" @click="updateStatus(item, 2)">关闭</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="admin-total">共 {{ total }} 条</p>
  </section>
</template>
