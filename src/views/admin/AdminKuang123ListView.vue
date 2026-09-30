<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  deleteAdminKuang123Site,
  getAdminKuang123Categories,
  getAdminKuang123Sites,
  saveAdminKuang123Category,
  updateAdminKuang123SiteRecommend,
  updateAdminKuang123SiteStatus,
  type AdminKuang123Category,
  type AdminKuang123Site,
} from '../../services/admin/kuang123'

const filters = reactive({
  keyword: '',
  category_id: 0,
  status: -1,
  source_type: '',
})

const categoryForm = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  icon: '',
  sort: 0,
  status: 1,
})

const categories = ref<AdminKuang123Category[]>([])
const list = ref<AdminKuang123Site[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref('')

function statusText(status: number) {
  return status === 1 ? '上架' : '下架'
}

function sourceText(sourceType: string) {
  return sourceType === 'manual' ? '后台添加' : '爬虫采集'
}

async function fetchCategories() {
  const result = await getAdminKuang123Categories()
  categories.value = result.list || []
}

async function fetchList() {
  try {
    loading.value = true
    message.value = ''
    const result = await getAdminKuang123Sites({
      page: 1,
      page_size: 30,
      keyword: filters.keyword,
      category_id: filters.category_id || undefined,
      status: filters.status >= 0 ? filters.status : undefined,
      source_type: filters.source_type || undefined,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    message.value = error instanceof Error ? error.message : '矿123 网站加载失败'
  } finally {
    loading.value = false
  }
}

function editCategory(item: AdminKuang123Category) {
  Object.assign(categoryForm, item)
}

function resetCategoryForm() {
  Object.assign(categoryForm, { id: 0, name: '', code: '', description: '', icon: '', sort: 0, status: 1 })
}

async function saveCategory() {
  if (!categoryForm.name || !categoryForm.code) {
    message.value = '请填写分类名称和编码'
    return
  }
  await saveAdminKuang123Category({ ...categoryForm, id: categoryForm.id || undefined })
  resetCategoryForm()
  await fetchCategories()
}

async function toggleStatus(item: AdminKuang123Site) {
  await updateAdminKuang123SiteStatus(item.id, item.status === 1 ? 0 : 1)
  fetchList()
}

async function toggleRecommend(item: AdminKuang123Site) {
  await updateAdminKuang123SiteRecommend(item.id, !item.is_recommend)
  fetchList()
}

async function removeItem(item: AdminKuang123Site) {
  if (!window.confirm(`确认删除「${item.name}」吗？`)) {
    return
  }
  await deleteAdminKuang123Site(item.id)
  fetchList()
}

onMounted(async () => {
  await fetchCategories()
  await fetchList()
})
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>矿123 网站导航</h2>
        <p>维护矿业网址大全的分类和网站链接，支持后台新增与爬虫采集。</p>
      </div>
      <RouterLink to="/admin/kuang123/create">新增网站</RouterLink>
    </div>

    <section class="admin-panel admin-inline-panel">
      <h3>分类维护</h3>
      <form class="admin-filter" @submit.prevent="saveCategory">
        <input v-model.trim="categoryForm.name" type="text" placeholder="分类名称，如 矿权交易" />
        <input v-model.trim="categoryForm.code" type="text" placeholder="分类编码，如 mining_right" />
        <input v-model.trim="categoryForm.description" type="text" placeholder="分类说明" />
        <input v-model.trim="categoryForm.icon" type="text" placeholder="短图标，如 矿权" />
        <input v-model.number="categoryForm.sort" type="number" placeholder="排序" />
        <select v-model.number="categoryForm.status">
          <option :value="1">上架</option>
          <option :value="0">下架</option>
        </select>
        <button type="submit">{{ categoryForm.id ? '保存分类' : '新增分类' }}</button>
        <button type="button" @click="resetCategoryForm">清空</button>
      </form>
      <div class="admin-chip-row">
        <button v-for="item in categories" :key="item.id" type="button" @click="editCategory(item)">
          {{ item.name }}
        </button>
      </div>
    </section>

    <form class="admin-filter" @submit.prevent="fetchList">
      <input v-model.trim="filters.keyword" type="search" placeholder="搜索网站名称、网址、描述、标签" />
      <select v-model.number="filters.category_id" @change="fetchList">
        <option :value="0">全部分类</option>
        <option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
      <select v-model.number="filters.status" @change="fetchList">
        <option :value="-1">全部状态</option>
        <option :value="1">上架</option>
        <option :value="0">下架</option>
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
            <th>网站</th>
            <th>分类</th>
            <th>来源</th>
            <th>状态</th>
            <th>推荐</th>
            <th>排序</th>
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
            <td colspan="7">暂无网站数据</td>
          </tr>
          <tr v-for="item in list" v-else :key="item.id">
            <td>
              <strong>{{ item.name }}</strong>
              <small>{{ item.url }}</small>
              <small>{{ item.description || '暂无说明' }}</small>
            </td>
            <td>{{ item.category || '-' }}</td>
            <td>
              <strong>{{ sourceText(item.source_type) }}</strong>
              <small>{{ item.source_site }} / {{ item.source_id }}</small>
            </td>
            <td>
              <span class="admin-badge" :class="{ active: item.status === 1 }">{{ statusText(item.status) }}</span>
            </td>
            <td>{{ item.is_recommend ? '推荐' : '未推荐' }}</td>
            <td>{{ item.sort }}</td>
            <td>
              <div class="admin-row-actions">
                <RouterLink :to="`/admin/kuang123/${item.id}/edit`">编辑</RouterLink>
                <a :href="item.url" target="_blank" rel="noopener noreferrer">访问</a>
                <button type="button" @click="toggleStatus(item)">{{ item.status === 1 ? '下架' : '上架' }}</button>
                <button type="button" @click="toggleRecommend(item)">{{ item.is_recommend ? '取消推荐' : '推荐' }}</button>
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
