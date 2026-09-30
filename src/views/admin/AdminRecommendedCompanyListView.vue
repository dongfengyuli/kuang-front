<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  deleteAdminRecommendedCompany,
  getAdminRecommendedCompanyList,
  updateAdminRecommendedCompanyRecommend,
  updateAdminRecommendedCompanyStatus,
  type AdminRecommendedCompanyItem,
} from '../../services/admin/recommendedCompanies'

const filters = reactive({
  keyword: '',
  business_type: '',
})
const list = ref<AdminRecommendedCompanyItem[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref('')

async function fetchList() {
  try {
    loading.value = true
    message.value = ''
    const result = await getAdminRecommendedCompanyList({
      page: 1,
      page_size: 30,
      keyword: filters.keyword,
      business_type: filters.business_type,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    message.value = error instanceof Error ? error.message : '推荐企业加载失败'
  } finally {
    loading.value = false
  }
}

async function toggleStatus(item: AdminRecommendedCompanyItem) {
  await updateAdminRecommendedCompanyStatus(item.id, item.status === 1 ? 0 : 1)
  fetchList()
}

async function toggleRecommend(item: AdminRecommendedCompanyItem) {
  await updateAdminRecommendedCompanyRecommend(item.id, !item.is_recommend)
  fetchList()
}

async function removeItem(item: AdminRecommendedCompanyItem) {
  if (!window.confirm(`确定删除“${item.name}”吗？`)) {
    return
  }
  await deleteAdminRecommendedCompany(item.id)
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>推荐企业</h2>
        <p>维护首页和推荐企业列表页展示的名企信息，支持后台录入和后续爬虫来源。</p>
      </div>
      <RouterLink to="/admin/recommended-companies/create">新增企业</RouterLink>
    </div>

    <form class="admin-filter" @submit.prevent="fetchList">
      <input v-model.trim="filters.keyword" type="search" placeholder="搜索企业名称、主营产品、标签" />
      <input v-model.trim="filters.business_type" type="search" placeholder="企业类型" />
      <button type="submit">查询</button>
    </form>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>企业</th>
            <th>类型/地区</th>
            <th>排序</th>
            <th>推荐</th>
            <th>状态</th>
            <th>更新时间</th>
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
            <td colspan="7">暂无推荐企业</td>
          </tr>
          <tr v-for="item in list" v-else :key="item.id">
            <td>
              <strong>{{ item.name }}</strong>
              <small>{{ item.products || item.summary }}</small>
            </td>
            <td>{{ item.business_type || '-' }} / {{ item.region || '-' }}</td>
            <td>{{ item.sort }}</td>
            <td>{{ item.is_recommend ? '是' : '否' }}</td>
            <td>{{ item.status === 1 ? '上架' : '下架' }}</td>
            <td>{{ item.updated_at || '-' }}</td>
            <td>
              <div class="admin-row-actions">
                <RouterLink :to="`/admin/recommended-companies/${item.id}/edit`">编辑</RouterLink>
                <button type="button" @click="toggleRecommend(item)">
                  {{ item.is_recommend ? '取消推荐' : '推荐' }}
                </button>
                <button type="button" @click="toggleStatus(item)">{{ item.status === 1 ? '下架' : '上架' }}</button>
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
