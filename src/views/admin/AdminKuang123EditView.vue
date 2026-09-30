<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  createAdminKuang123Site,
  getAdminKuang123Categories,
  getAdminKuang123SiteDetail,
  updateAdminKuang123Site,
  type AdminKuang123Category,
  type AdminKuang123SitePayload,
} from '../../services/admin/kuang123'

const route = useRoute()
const router = useRouter()
const siteId = computed(() => Number(route.params.id || 0))
const isEdit = computed(() => siteId.value > 0)

const categories = ref<AdminKuang123Category[]>([])
const tagsText = ref('')
const message = ref('')
const saving = ref(false)

const form = reactive<AdminKuang123SitePayload>({
  category_id: 0,
  name: '',
  url: '',
  icon: '',
  description: '',
  tags: [],
  source_type: 'manual',
  source_site: 'admin',
  source_id: '',
  is_recommend: false,
  sort: 0,
  status: 1,
})

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

async function loadCategories() {
  const result = await getAdminKuang123Categories()
  categories.value = result.list || []
  if (!form.category_id && categories.value.length > 0) {
    form.category_id = categories.value[0].id
  }
}

async function loadDetail() {
  if (!isEdit.value) {
    return
  }
  const result = await getAdminKuang123SiteDetail(siteId.value)
  const detail = result.detail
  Object.assign(form, {
    id: detail.id,
    category_id: detail.category_id,
    name: detail.name || '',
    url: detail.url || '',
    icon: detail.icon || '',
    description: detail.description || '',
    tags: detail.tags || [],
    source_type: detail.source_type || 'manual',
    source_site: detail.source_site || 'admin',
    source_id: detail.source_id || '',
    is_recommend: Boolean(detail.is_recommend),
    sort: detail.sort || 0,
    status: detail.status ?? 1,
  })
  tagsText.value = form.tags.join('\n')
}

async function save() {
  message.value = ''
  if (!form.category_id || !form.name || !form.url) {
    message.value = '请填写分类、网站名称和网址'
    return
  }
  const payload: AdminKuang123SitePayload = {
    ...form,
    id: isEdit.value ? siteId.value : undefined,
    tags: splitLines(tagsText.value),
  }
  try {
    saving.value = true
    if (isEdit.value) {
      await updateAdminKuang123Site(payload)
      message.value = '网站已更新'
    } else {
      await createAdminKuang123Site(payload)
      router.push('/admin/kuang123')
    }
  } catch (error) {
    message.value = error instanceof Error ? error.message : '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await loadDetail()
})
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>{{ isEdit ? '编辑网站导航' : '新增网站导航' }}</h2>
        <p>维护矿123分类网站，保存后前台矿业网址大全会实时展示。</p>
      </div>
    </div>

    <form class="admin-form" @submit.prevent="save">
      <label>
        <span>所属分类</span>
        <select v-model.number="form.category_id">
          <option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </label>
      <label>
        <span>网站名称</span>
        <input v-model.trim="form.name" type="text" placeholder="如 全球矿产资源网" />
      </label>
      <label class="admin-form-wide">
        <span>网址</span>
        <input v-model.trim="form.url" type="text" placeholder="https://www.example.com/" />
      </label>
      <label>
        <span>图标 URL</span>
        <input v-model.trim="form.icon" type="text" placeholder="可为空，前台使用首字占位" />
      </label>
      <label>
        <span>标签</span>
        <textarea v-model.trim="tagsText" placeholder="一行一个，如：矿权交易"></textarea>
      </label>
      <label class="admin-form-wide">
        <span>说明</span>
        <textarea v-model.trim="form.description" placeholder="网站用途和特点"></textarea>
      </label>
      <label>
        <span>来源类型</span>
        <select v-model="form.source_type">
          <option value="manual">后台添加</option>
          <option value="crawler">爬虫采集</option>
        </select>
      </label>
      <label>
        <span>来源站点</span>
        <input v-model.trim="form.source_site" type="text" placeholder="admin / worldmr123" />
      </label>
      <label>
        <span>来源 ID</span>
        <input v-model.trim="form.source_id" type="text" placeholder="后台新增可留空" />
      </label>
      <label>
        <span>排序</span>
        <input v-model.number="form.sort" type="number" placeholder="数字越大越靠前" />
      </label>
      <label>
        <span>状态</span>
        <select v-model.number="form.status">
          <option :value="1">上架</option>
          <option :value="0">下架</option>
        </select>
      </label>
      <label class="admin-checkbox">
        <input v-model="form.is_recommend" type="checkbox" />
        <span>推荐到顶部直达</span>
      </label>

      <div class="admin-form-actions">
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        <RouterLink to="/admin/kuang123">返回列表</RouterLink>
        <p v-if="message">{{ message }}</p>
      </div>
    </form>
  </section>
</template>
