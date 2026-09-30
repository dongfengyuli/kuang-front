<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  createMiningRight,
  getMiningRightList,
  type MiningRightCreatePayload,
  type MiningRightItem,
} from '../services/trade'
import { getMineCategoryList, getRegionList, type MineCategoryItem, type RegionItem } from '../services/content'

const route = useRoute()

const listingTypes = [
  { label: '全部', value: '' },
  { label: '矿权转让', value: 'mining_right_transfer' },
  { label: '矿权求购', value: 'mining_right_buy' },
]

const rightTypes = ['全部', '采矿权', '探矿权']

const filters = reactive({
  listing_type: '',
  right_type: '',
  mine_type: '',
  mine_category_id: 0,
  mine_sub_category_id: 0,
  mine_cat_id: 0,
  province_id: 0,
  city_id: 0,
  district_id: 0,
  keyword: '',
})

const form = reactive<MiningRightCreatePayload>({
  listing_type: 'mining_right_transfer',
  title: '',
  summary: '',
  content: '',
  province_id: 0,
  city_id: 0,
  district_id: 0,
  location: '',
  mine_type: '',
  mine_cat_id: 0,
  right_type: '采矿权',
  resource_amount: '',
  price: 0,
  price_type: 1,
  company_name: '',
  contact_name: '',
  contact_phone: '',
})

const list = ref<MiningRightItem[]>([])
const total = ref(0)
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const submitMessage = ref('')
const provinces = ref<RegionItem[]>([])
const filterCities = ref<RegionItem[]>([])
const filterDistricts = ref<RegionItem[]>([])
const formCities = ref<RegionItem[]>([])
const formDistricts = ref<RegionItem[]>([])
const formLocationDetail = ref('')
const mineCategories = ref<MineCategoryItem[]>([])
const filterSubCategories = ref<MineCategoryItem[]>([])
const filterMineKinds = ref<MineCategoryItem[]>([])
const formSubCategories = ref<MineCategoryItem[]>([])
const formMineKinds = ref<MineCategoryItem[]>([])
const formMineCategoryId = ref(0)
const formMineSubCategoryId = ref(0)

function applyRouteFilters() {
  const listingType = String(route.query.listing_type || '')
  if (listingTypes.some((item) => item.value === listingType)) {
    filters.listing_type = listingType
  }
}

function priceText(item: MiningRightItem) {
  if (item.price_type === 2 && item.price > 0) {
    return `${item.price} 万元`
  }

  return '面议'
}

async function fetchList() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getMiningRightList({
      page: 1,
      page_size: 20,
      listing_type: filters.listing_type,
      right_type: filters.right_type,
      mine_cat_id: filters.mine_cat_id || undefined,
      province_id: filters.province_id || undefined,
      city_id: filters.city_id || undefined,
      district_id: filters.district_id || undefined,
      keyword: filters.keyword,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '矿权交易列表加载失败'
  } finally {
    loading.value = false
  }
}

async function loadMineCategories() {
  const result = await getMineCategoryList(0)
  mineCategories.value = result.list || []
}

async function loadFilterSubCategories() {
  filters.mine_sub_category_id = 0
  filters.mine_cat_id = 0
  filterSubCategories.value = []
  filterMineKinds.value = []

  if (filters.mine_category_id) {
    const result = await getMineCategoryList(filters.mine_category_id)
    filterSubCategories.value = result.list || []
  }

  fetchList()
}

async function loadFilterMineKinds() {
  filters.mine_cat_id = 0
  filterMineKinds.value = []

  if (filters.mine_sub_category_id) {
    const result = await getMineCategoryList(filters.mine_sub_category_id)
    filterMineKinds.value = result.list || []
  }

  fetchList()
}

async function loadFormSubCategories() {
  formMineSubCategoryId.value = 0
  form.mine_cat_id = 0
  formSubCategories.value = []
  formMineKinds.value = []

  if (formMineCategoryId.value) {
    const result = await getMineCategoryList(formMineCategoryId.value)
    formSubCategories.value = result.list || []
  }
}

async function loadFormMineKinds() {
  form.mine_cat_id = 0
  formMineKinds.value = []

  if (formMineSubCategoryId.value) {
    const result = await getMineCategoryList(formMineSubCategoryId.value)
    formMineKinds.value = result.list || []
  }
}

async function loadProvinces() {
  const result = await getRegionList(1)
  provinces.value = result.list || []
}

async function loadFilterCities() {
  filters.city_id = 0
  filters.district_id = 0
  filterCities.value = []
  filterDistricts.value = []

  if (filters.province_id) {
    const result = await getRegionList(filters.province_id)
    filterCities.value = result.list || []
  }

  fetchList()
}

async function loadFilterDistricts() {
  filters.district_id = 0
  filterDistricts.value = []

  if (filters.city_id) {
    const result = await getRegionList(filters.city_id)
    filterDistricts.value = result.list || []
  }

  fetchList()
}

async function loadFormCities() {
  form.city_id = 0
  form.district_id = 0
  formCities.value = []
  formDistricts.value = []

  if (form.province_id) {
    const result = await getRegionList(form.province_id)
    formCities.value = result.list || []
  }
}

async function loadFormDistricts() {
  form.district_id = 0
  formDistricts.value = []

  if (form.city_id) {
    const result = await getRegionList(form.city_id)
    formDistricts.value = result.list || []
  }
}

function findRegionName(list: RegionItem[], id: number) {
  return list.find((item) => item.id === id)?.name || ''
}

function buildFormLocation() {
  return [
    findRegionName(provinces.value, form.province_id),
    findRegionName(formCities.value, form.city_id),
    findRegionName(formDistricts.value, form.district_id),
    formLocationDetail.value,
  ]
    .filter(Boolean)
    .join(' ')
}

async function handleSubmit() {
  submitMessage.value = ''

  if (!form.title || !form.content || !form.contact_name || !form.contact_phone) {
    submitMessage.value = '请填写标题、详情、联系人和联系电话'
    return
  }

  try {
    submitting.value = true
    await createMiningRight({
      ...form,
      location: buildFormLocation(),
    })
    submitMessage.value = '发布成功，已加入矿权交易列表'
    Object.assign(form, {
      listing_type: 'mining_right_transfer',
      title: '',
      summary: '',
      content: '',
      province_id: 0,
      city_id: 0,
      district_id: 0,
      location: '',
      mine_type: '',
      mine_cat_id: 0,
      right_type: '采矿权',
      resource_amount: '',
      price: 0,
      price_type: 1,
      company_name: '',
      contact_name: '',
      contact_phone: '',
    })
    formLocationDetail.value = ''
    formCities.value = []
    formDistricts.value = []
    formMineCategoryId.value = 0
    formMineSubCategoryId.value = 0
    formSubCategories.value = []
    formMineKinds.value = []
    fetchList()
  } catch (error) {
    submitMessage.value = error instanceof Error ? error.message : '发布失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  applyRouteFilters()
  await Promise.all([loadProvinces(), loadMineCategories()])
  fetchList()
})

watch(
  () => route.query.listing_type,
  () => {
    applyRouteFilters()
    fetchList()
  },
)
</script>

<template>
  <main class="trade-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="trade-hero">
      <div class="container trade-hero-inner">
        <p class="eyebrow">MINING RIGHTS</p>
        <h1>矿权交易</h1>
        <p>聚合采矿权、探矿权转让与求购信息，突出地区、矿种、权证状态和联系方式，帮助项目方与资金方快速撮合。</p>
      </div>
    </section>

    <section class="container trade-layout">
      <div class="trade-main">
        <section class="trade-filter panel">
          <div>
            <strong>交易类型</strong>
            <button
              v-for="item in listingTypes"
              :key="item.value"
              type="button"
              :class="{ active: filters.listing_type === item.value }"
              @click="filters.listing_type = item.value; fetchList()"
            >
              {{ item.label }}
            </button>
          </div>
          <div>
            <strong>矿权类型</strong>
            <button
              v-for="item in rightTypes"
              :key="item"
              type="button"
              :class="{ active: filters.right_type === (item === '全部' ? '' : item) }"
              @click="filters.right_type = item === '全部' ? '' : item; fetchList()"
            >
              {{ item }}
            </button>
          </div>
          <div>
            <strong>矿种</strong>
            <span class="region-selects">
              <select v-model.number="filters.mine_category_id" @change="loadFilterSubCategories">
                <option :value="0">全部大类</option>
                <option v-for="item in mineCategories" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select
                v-model.number="filters.mine_sub_category_id"
                :disabled="!filters.mine_category_id"
                @change="loadFilterMineKinds"
              >
                <option :value="0">全部亚类</option>
                <option v-for="item in filterSubCategories" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select v-model.number="filters.mine_cat_id" :disabled="!filters.mine_sub_category_id" @change="fetchList">
                <option :value="0">全部矿种</option>
                <option v-for="item in filterMineKinds" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </span>
          </div>
          <div>
            <strong>矿区位置</strong>
            <span class="region-selects">
              <select v-model.number="filters.province_id" @change="loadFilterCities">
                <option :value="0">全国</option>
                <option v-for="item in provinces" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select v-model.number="filters.city_id" :disabled="!filters.province_id" @change="loadFilterDistricts">
                <option :value="0">全部城市</option>
                <option v-for="item in filterCities" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select v-model.number="filters.district_id" :disabled="!filters.city_id" @change="fetchList">
                <option :value="0">全部区县</option>
                <option v-for="item in filterDistricts" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </span>
          </div>
          <form class="trade-search" @submit.prevent="fetchList">
            <input v-model.trim="filters.keyword" type="search" placeholder="搜索矿种、地区、项目关键词" />
            <button type="submit">搜索</button>
          </form>
        </section>

        <section class="trade-list panel">
          <div class="section-title compact">
            <span>矿权信息</span>
            <small>共 {{ total }} 条</small>
          </div>

          <div v-if="loading" class="trade-empty">矿权信息加载中...</div>
          <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
          <div v-else-if="list.length === 0" class="trade-empty">暂无矿权交易信息</div>

          <article v-for="item in list" v-else :key="item.id" class="mining-card">
            <div>
              <div class="mining-card-tags">
                <span>{{ item.listing_type === 'mining_right_buy' ? '求购' : '转让' }}</span>
                <span>{{ item.right_type || '矿权' }}</span>
                <span>{{ item.mine_cat_name || item.mine_type || '矿种待定' }}</span>
              </div>
              <RouterLink :to="`/trade/mining-rights/${item.id}`" class="mining-card-title">
                {{ item.title }}
              </RouterLink>
              <p>{{ item.summary || item.content }}</p>
              <div class="mining-card-meta">
                <span>矿区位置：{{ item.location || '待补充' }}</span>
                <span>资源储量：{{ item.resource_amount || '详询' }}</span>
                <span>发布时间：{{ item.published_at || '-' }}</span>
              </div>
            </div>
            <aside>
              <strong>{{ priceText(item) }}</strong>
              <RouterLink :to="`/trade/mining-rights/${item.id}`">查看详情</RouterLink>
            </aside>
          </article>
        </section>
      </div>

      <aside class="publish-panel panel">
        <div class="section-title compact">
          <span>发布矿权信息</span>
        </div>
        <form class="publish-form" @submit.prevent="handleSubmit">
          <select v-model="form.listing_type">
            <option value="mining_right_transfer">矿权转让</option>
            <option value="mining_right_buy">矿权求购</option>
          </select>
          <input v-model.trim="form.title" type="text" placeholder="项目标题" />
          <div class="publish-region-selects">
            <select v-model.number="form.province_id" @change="loadFormCities">
              <option :value="0">请选择省份</option>
              <option v-for="item in provinces" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
            <select v-model.number="form.city_id" :disabled="!form.province_id" @change="loadFormDistricts">
              <option :value="0">请选择城市</option>
              <option v-for="item in formCities" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
            <select v-model.number="form.district_id" :disabled="!form.city_id">
              <option :value="0">请选择区县</option>
              <option v-for="item in formDistricts" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <input v-model.trim="formLocationDetail" type="text" placeholder="详细矿区位置，如某矿区/乡镇" />
          <div class="publish-region-selects">
            <select v-model.number="formMineCategoryId" @change="loadFormSubCategories">
              <option :value="0">请选择矿产大类</option>
              <option v-for="item in mineCategories" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
            <select v-model.number="formMineSubCategoryId" :disabled="!formMineCategoryId" @change="loadFormMineKinds">
              <option :value="0">请选择矿产亚类</option>
              <option v-for="item in formSubCategories" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
            <select v-model.number="form.mine_cat_id" :disabled="!formMineSubCategoryId">
              <option :value="0">请选择具体矿种</option>
              <option v-for="item in formMineKinds" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <select v-model="form.right_type">
            <option>采矿权</option>
            <option>探矿权</option>
          </select>
          <input v-model.trim="form.resource_amount" type="text" placeholder="资源储量" />
          <textarea v-model.trim="form.content" placeholder="项目详情、权证情况、合作要求"></textarea>
          <input v-model.trim="form.company_name" type="text" placeholder="企业名称" />
          <input v-model.trim="form.contact_name" type="text" placeholder="联系人" />
          <input v-model.trim="form.contact_phone" type="tel" placeholder="联系电话" />
          <button type="submit" :disabled="submitting">
            {{ submitting ? '提交中...' : '立即发布' }}
          </button>
          <p v-if="submitMessage">{{ submitMessage }}</p>
        </form>
      </aside>
    </section>
  </main>
</template>
