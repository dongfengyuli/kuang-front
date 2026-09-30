<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  createAdminEquipmentCompany,
  getAdminEquipmentCompanyList,
  updateAdminEquipmentCompany,
  updateAdminEquipmentCompanyRecommend,
  type AdminEquipmentCompanyItem,
  type AdminEquipmentCompanyPayload,
} from '../../services/admin/company'

const filters = reactive({
  keyword: '',
})

const form = reactive<AdminEquipmentCompanyPayload>({
  name: '',
  main_products: '',
  location: '',
  tags: [],
  sort: 0,
  is_recommended: true,
  status: 1,
})

const list = ref<AdminEquipmentCompanyItem[]>([])
const total = ref(0)
const loading = ref(false)
const message = ref('')
const tagsText = ref('')

function resetForm() {
  Object.assign(form, {
    id: undefined,
    name: '',
    main_products: '',
    location: '',
    tags: [],
    sort: 0,
    is_recommended: true,
    status: 1,
  })
  tagsText.value = ''
}

function editItem(item: AdminEquipmentCompanyItem) {
  Object.assign(form, { ...item })
  tagsText.value = item.tags?.join('\n') || ''
}

async function fetchList() {
  try {
    loading.value = true
    message.value = ''
    const result = await getAdminEquipmentCompanyList({
      page: 1,
      page_size: 20,
      keyword: filters.keyword,
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

async function save() {
  message.value = ''

  if (!form.name || !form.main_products) {
    message.value = '请填写企业名称和主营产品'
    return
  }

  const payload = {
    ...form,
    tags: tagsText.value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean),
  }

  if (payload.id) {
    await updateAdminEquipmentCompany(payload)
  } else {
    await createAdminEquipmentCompany(payload)
  }

  resetForm()
  fetchList()
}

async function toggleRecommend(item: AdminEquipmentCompanyItem) {
  await updateAdminEquipmentCompanyRecommend(item.id, !item.is_recommended)
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <section class="admin-grid">
    <section class="admin-panel">
      <div class="admin-section-title">
        <div>
          <h2>推荐企业</h2>
          <p>维护前台矿山设备频道右侧推荐企业列表。</p>
        </div>
      </div>

      <form class="admin-filter" @submit.prevent="fetchList">
        <input v-model.trim="filters.keyword" type="search" placeholder="搜索企业名称、主营产品" />
        <button type="submit">查询</button>
      </form>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>企业</th>
              <th>地区</th>
              <th>排序</th>
              <th>推荐</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6">加载中...</td>
            </tr>
            <tr v-else-if="message">
              <td colspan="6">{{ message }}</td>
            </tr>
            <tr v-else-if="list.length === 0">
              <td colspan="6">暂无企业数据</td>
            </tr>
            <tr v-for="item in list" v-else :key="item.id">
              <td>
                <strong>{{ item.name }}</strong>
                <small>{{ item.main_products }}</small>
              </td>
              <td>{{ item.location || '-' }}</td>
              <td>{{ item.sort }}</td>
              <td>{{ item.is_recommended ? '是' : '否' }}</td>
              <td>{{ item.status === 1 ? '启用' : '停用' }}</td>
              <td>
                <div class="admin-row-actions">
                  <button type="button" @click="editItem(item)">编辑</button>
                  <button type="button" @click="toggleRecommend(item)">
                    {{ item.is_recommended ? '取消推荐' : '推荐' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="admin-total">共 {{ total }} 条</p>
    </section>

    <aside class="admin-panel">
      <div class="admin-section-title compact">
        <div>
          <h2>{{ form.id ? '编辑企业' : '新增企业' }}</h2>
          <p>企业会展示在前台推荐企业区域。</p>
        </div>
      </div>
      <form class="admin-form single" @submit.prevent="save">
        <label>
          <span>企业名称</span>
          <input v-model.trim="form.name" type="text" placeholder="企业名称" />
        </label>
        <label>
          <span>主营产品</span>
          <textarea v-model.trim="form.main_products" placeholder="如 破碎机、振动筛、球磨机"></textarea>
        </label>
        <label>
          <span>地区</span>
          <input v-model.trim="form.location" type="text" placeholder="如 辽宁沈阳" />
        </label>
        <label>
          <span>标签</span>
          <textarea v-model.trim="tagsText" placeholder="一行一个，如：认证企业"></textarea>
        </label>
        <label>
          <span>排序</span>
          <input v-model.number="form.sort" type="number" />
        </label>
        <label class="admin-checkbox">
          <input v-model="form.is_recommended" type="checkbox" />
          <span>设为推荐</span>
        </label>
        <div class="admin-form-actions">
          <button type="submit">保存企业</button>
          <button type="button" @click="resetForm">清空</button>
        </div>
      </form>
    </aside>
  </section>
</template>
