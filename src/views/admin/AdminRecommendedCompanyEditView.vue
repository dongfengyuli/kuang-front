<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  createAdminRecommendedCompany,
  getAdminRecommendedCompanyDetail,
  updateAdminRecommendedCompany,
  type AdminRecommendedCompanyPayload,
} from '../../services/admin/recommendedCompanies'

const route = useRoute()
const router = useRouter()
const companyId = computed(() => Number(route.params.id || 0))
const isEdit = computed(() => companyId.value > 0)
const tagsText = ref('')
const message = ref('')
const saving = ref(false)

const form = reactive<AdminRecommendedCompanyPayload>({
  name: '',
  logo: '',
  cover: '',
  summary: '',
  intro: '',
  products: '',
  business_type: '',
  region: '',
  address: '',
  website: '',
  contact_name: '',
  contact_phone: '',
  tags: [],
  source_type: 'manual',
  source_site: 'admin',
  source_id: '',
  is_recommend: true,
  sort: 0,
  status: 1,
})

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

async function loadDetail() {
  if (!isEdit.value) {
    return
  }
  const result = await getAdminRecommendedCompanyDetail(companyId.value)
  const detail = result.detail
  Object.assign(form, {
    id: detail.id,
    name: detail.name || '',
    logo: detail.logo || '',
    cover: detail.cover || '',
    summary: detail.summary || '',
    intro: detail.intro || '',
    products: detail.products || '',
    business_type: detail.business_type || '',
    region: detail.region || '',
    address: detail.address || '',
    website: detail.website || '',
    contact_name: detail.contact_name || '',
    contact_phone: detail.contact_phone || '',
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
  if (!form.name || !form.logo) {
    message.value = '请填写企业名称和图片/Logo'
    return
  }
  const payload: AdminRecommendedCompanyPayload = {
    ...form,
    id: isEdit.value ? companyId.value : undefined,
    tags: splitLines(tagsText.value),
  }
  try {
    saving.value = true
    if (isEdit.value) {
      await updateAdminRecommendedCompany(payload)
      message.value = '企业已更新'
    } else {
      await createAdminRecommendedCompany(payload)
      router.push('/admin/recommended-companies')
    }
  } catch (error) {
    message.value = error instanceof Error ? error.message : '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

onMounted(loadDetail)
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>{{ isEdit ? '编辑推荐企业' : '新增推荐企业' }}</h2>
        <p>企业图片会展示在首页推荐企业区域，建议使用企业 Logo 或门头/厂区图。</p>
      </div>
    </div>

    <form class="admin-form" @submit.prevent="save">
      <label>
        <span>企业名称</span>
        <input v-model.trim="form.name" type="text" placeholder="企业名称" />
      </label>
      <label>
        <span>企业 Logo / 列表图</span>
        <input v-model.trim="form.logo" type="text" placeholder="/kuang_static_resources/pic/company/demo.png" />
      </label>
      <label>
        <span>详情封面图</span>
        <input v-model.trim="form.cover" type="text" placeholder="可与 Logo 相同" />
      </label>
      <label>
        <span>企业类型</span>
        <input v-model.trim="form.business_type" type="text" placeholder="矿山开发 / 设备制造 / 工程技术" />
      </label>
      <label>
        <span>地区</span>
        <input v-model.trim="form.region" type="text" placeholder="如 江苏苏州" />
      </label>
      <label>
        <span>主营产品/服务</span>
        <input v-model.trim="form.products" type="text" placeholder="破碎机、球磨机、绿色矿山建设" />
      </label>
      <label class="admin-form-wide">
        <span>企业摘要</span>
        <textarea v-model.trim="form.summary" placeholder="用于首页卡片展示，建议 50 字以内"></textarea>
      </label>
      <label class="admin-form-wide">
        <span>企业详情</span>
        <textarea v-model.trim="form.intro" placeholder="企业介绍、优势、服务能力等"></textarea>
      </label>
      <label>
        <span>官网</span>
        <input v-model.trim="form.website" type="text" placeholder="https://www.example.com/" />
      </label>
      <label>
        <span>详细地址</span>
        <input v-model.trim="form.address" type="text" placeholder="企业地址" />
      </label>
      <label>
        <span>联系人</span>
        <input v-model.trim="form.contact_name" type="text" placeholder="联系人" />
      </label>
      <label>
        <span>联系电话</span>
        <input v-model.trim="form.contact_phone" type="text" placeholder="联系电话" />
      </label>
      <label>
        <span>标签</span>
        <textarea v-model.trim="tagsText" placeholder="一行一个，如：专精特新"></textarea>
      </label>
      <label>
        <span>来源类型</span>
        <select v-model="form.source_type">
          <option value="manual">后台添加</option>
          <option value="crawler">爬虫采集</option>
          <option value="import">批量导入</option>
        </select>
      </label>
      <label>
        <span>来源站点</span>
        <input v-model.trim="form.source_site" type="text" placeholder="admin / mine168" />
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
        <span>推荐到首页</span>
      </label>

      <div class="admin-form-actions">
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存企业' }}</button>
        <RouterLink to="/admin/recommended-companies">返回列表</RouterLink>
        <p v-if="message">{{ message }}</p>
      </div>
    </form>
  </section>
</template>
