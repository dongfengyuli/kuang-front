<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { getRegionList, type RegionItem } from '../../services/content'
import {
  createAdminEquipment,
  getAdminEquipmentCategoryList,
  getAdminEquipmentDetail,
  updateAdminEquipment,
  type AdminEquipmentCategory,
  type AdminEquipmentSavePayload,
} from '../../services/admin/equipment'

const route = useRoute()
const router = useRouter()
const equipmentId = computed(() => Number(route.params.id || 0))
const isEdit = computed(() => equipmentId.value > 0)

const form = reactive<AdminEquipmentSavePayload>({
  title: '',
  model: '',
  summary: '',
  content: '',
  category_id: 0,
  province_id: 0,
  city_id: 0,
  district_id: 0,
  location: '',
  company_name: '',
  member_level: '普通会员',
  tags: [],
  cover: '',
  images: [],
  parameters: {},
  status: 1,
  is_recommended: false,
})

const categories = ref<AdminEquipmentCategory[]>([])
const provinces = ref<RegionItem[]>([])
const cities = ref<RegionItem[]>([])
const districts = ref<RegionItem[]>([])
const tagsText = ref('')
const imagesText = ref('')
const parametersText = ref('')
const message = ref('')
const saving = ref(false)

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseParameters(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((result, line) => {
      const [name, ...rest] = line.split(/[:：]/)

      if (name && rest.length) {
        result[name.trim()] = rest.join(':').trim()
      }

      return result
    }, {})
}

async function loadCategories() {
  const result = await getAdminEquipmentCategoryList(0)
  categories.value = result.list || []
}

async function loadProvinces() {
  const result = await getRegionList(1)
  provinces.value = result.list || []
}

async function loadCities() {
  form.city_id = 0
  form.district_id = 0
  cities.value = []
  districts.value = []

  if (form.province_id) {
    const result = await getRegionList(form.province_id)
    cities.value = result.list || []
  }
}

async function loadDistricts() {
  form.district_id = 0
  districts.value = []

  if (form.city_id) {
    const result = await getRegionList(form.city_id)
    districts.value = result.list || []
  }
}

async function loadDetail() {
  if (!isEdit.value) {
    return
  }

  const result = await getAdminEquipmentDetail(equipmentId.value)
  const detail = result.detail
  Object.assign(form, {
    id: detail.id,
    title: detail.title || '',
    model: detail.model || '',
    summary: detail.summary || '',
    content: detail.content || '',
    category_id: detail.category_id || 0,
    province_id: detail.province_id || 0,
    city_id: detail.city_id || 0,
    district_id: detail.district_id || 0,
    location: detail.location || '',
    company_name: detail.company_name || '',
    member_level: detail.member_level || '普通会员',
    tags: detail.tags || [],
    cover: detail.cover || '',
    images: detail.images || [],
    parameters: detail.parameters || {},
    status: detail.status ?? 1,
    is_recommended: Boolean(detail.is_recommended),
  })
  tagsText.value = form.tags.join('\n')
  imagesText.value = form.images.join('\n')
  parametersText.value = Object.entries(form.parameters)
    .map(([name, value]) => `${name}：${value}`)
    .join('\n')

  if (form.province_id) {
    const cityResult = await getRegionList(form.province_id)
    cities.value = cityResult.list || []
  }

  if (form.city_id) {
    const districtResult = await getRegionList(form.city_id)
    districts.value = districtResult.list || []
  }
}

async function save() {
  message.value = ''

  if (!form.title || !form.category_id || !form.company_name) {
    message.value = '请填写设备名称、品类和供应商'
    return
  }

  const payload: AdminEquipmentSavePayload = {
    ...form,
    id: isEdit.value ? equipmentId.value : undefined,
    tags: splitLines(tagsText.value),
    images: splitLines(imagesText.value),
    parameters: parseParameters(parametersText.value),
  }

  try {
    saving.value = true
    if (isEdit.value) {
      await updateAdminEquipment(payload)
      message.value = '设备已更新'
    } else {
      await createAdminEquipment(payload)
      message.value = '设备已发布'
      router.push('/admin/equipment')
    }
  } catch (error) {
    message.value = error instanceof Error ? error.message : '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadProvinces()])
  loadDetail()
})
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>{{ isEdit ? '编辑矿山设备' : '发布矿山设备' }}</h2>
        <p>维护前台产品选型页展示所需的标题、型号、参数、供应商和状态。</p>
      </div>
    </div>

    <form class="admin-form" @submit.prevent="save">
      <label>
        <span>设备名称</span>
        <input v-model.trim="form.title" type="text" placeholder="如 多缸液压圆锥破碎机" />
      </label>
      <label>
        <span>型号</span>
        <input v-model.trim="form.model" type="text" placeholder="如 H系列 / ZK60-89" />
      </label>
      <label>
        <span>设备品类</span>
        <select v-model.number="form.category_id">
          <option :value="0">请选择品类</option>
          <option v-for="item in categories" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </label>
      <label>
        <span>供应商</span>
        <input v-model.trim="form.company_name" type="text" placeholder="供应商企业名称" />
      </label>
      <label>
        <span>会员等级</span>
        <input v-model.trim="form.member_level" type="text" placeholder="普通会员 / 认证企业 / 品牌企业" />
      </label>
      <label>
        <span>封面图</span>
        <input v-model.trim="form.cover" type="url" placeholder="图片 URL" />
      </label>
      <label class="admin-form-wide">
        <span>地区</span>
        <span class="admin-inline-selects">
          <select v-model.number="form.province_id" @change="loadCities">
            <option :value="0">请选择省份</option>
            <option v-for="item in provinces" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <select v-model.number="form.city_id" :disabled="!form.province_id" @change="loadDistricts">
            <option :value="0">请选择城市</option>
            <option v-for="item in cities" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <select v-model.number="form.district_id" :disabled="!form.city_id">
            <option :value="0">请选择区县</option>
            <option v-for="item in districts" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </span>
      </label>
      <label class="admin-form-wide">
        <span>详细地址</span>
        <input v-model.trim="form.location" type="text" placeholder="如 辽宁沈阳 / 浙江湖州" />
      </label>
      <label class="admin-form-wide">
        <span>摘要</span>
        <textarea v-model.trim="form.summary" placeholder="列表页展示的简短介绍"></textarea>
      </label>
      <label class="admin-form-wide">
        <span>详情</span>
        <textarea v-model.trim="form.content" placeholder="设备详情、适用场景、交付服务等"></textarea>
      </label>
      <label>
        <span>标签</span>
        <textarea v-model.trim="tagsText" placeholder="一行一个，如：认证企业"></textarea>
      </label>
      <label>
        <span>图片列表</span>
        <textarea v-model.trim="imagesText" placeholder="一行一个图片 URL"></textarea>
      </label>
      <label class="admin-form-wide">
        <span>核心参数</span>
        <textarea v-model.trim="parametersText" placeholder="一行一个，格式：处理能力：500t/h"></textarea>
      </label>
      <label>
        <span>状态</span>
        <select v-model.number="form.status">
          <option :value="1">上架</option>
          <option :value="0">下架</option>
        </select>
      </label>
      <label class="admin-checkbox">
        <input v-model="form.is_recommended" type="checkbox" />
        <span>推荐到前台</span>
      </label>

      <div class="admin-form-actions">
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        <RouterLink to="/admin/equipment">返回列表</RouterLink>
        <p v-if="message">{{ message }}</p>
      </div>
    </form>
  </section>
</template>
