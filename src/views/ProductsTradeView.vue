<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getRegionList, type RegionItem } from '../services/content'
import {
  createMaterialOrder,
  getMaterialIndustryList,
  getMaterialOrderList,
  getMaterialOreList,
  type MaterialOption,
  type MaterialOrderCreatePayload,
  type MaterialOrderItem,
} from '../services/mineralProducts'

const route = useRoute()

const orderTypes = [
  { label: '全部', value: 0 },
  { label: '矿产品出售', value: 2 },
  { label: '矿产品求购', value: 1 },
]

const priceTypes = [
  { label: '面议', value: 1 },
  { label: '电议', value: 2 },
  { label: '明码标价', value: 3 },
]

const filters = reactive({
  order_type: 0,
  industry_id: 0,
  mine_ore_id: 0,
  province_id: 0,
  city_id: 0,
  keyword: '',
})

const form = reactive<MaterialOrderCreatePayload>({
  order_type: 2,
  industry_id: 0,
  mine_ore_id: 0,
  purchase_num: 0,
  purchase_price_type: 1,
  purchase_price: 0,
  delivery_place: '',
  province_id: 0,
  city_id: 0,
  indicator_requirement: '',
  img: '',
  img_attr: '',
  contact_information: '',
})

const list = ref<MaterialOrderItem[]>([])
const total = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const submitting = ref(false)
const submitMessage = ref('')
const industries = ref<MaterialOption[]>([])
const ores = ref<MaterialOption[]>([])
const provinces = ref<RegionItem[]>([])
const filterCities = ref<RegionItem[]>([])
const formCities = ref<RegionItem[]>([])

const activeTypeText = computed(() => orderTypes.find((item) => item.value === filters.order_type)?.label || '全部')

function applyRouteFilters() {
  const orderType = Number(route.query.order_type || 0)
  if (orderTypes.some((item) => item.value === orderType)) {
    filters.order_type = orderType
  }
}

function orderTypeText(type: number) {
  return type === 2 ? '出售' : '求购'
}

function orderTypeClass(type: number) {
  return type === 2 ? 'sell' : 'buy'
}

function priceText(item: MaterialOrderItem) {
  return item.price_text || (item.purchase_price_type === 3 ? `${item.purchase_price} 元/吨` : '面议')
}

function resetFilters() {
  Object.assign(filters, {
    order_type: 0,
    industry_id: 0,
    mine_ore_id: 0,
    province_id: 0,
    city_id: 0,
    keyword: '',
  })
  filterCities.value = []
  fetchList()
}

async function fetchList() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getMaterialOrderList({
      page: 1,
      page_size: 20,
      order_type: filters.order_type || undefined,
      industry_id: filters.industry_id || undefined,
      mine_ore_id: filters.mine_ore_id || undefined,
      province_id: filters.province_id || undefined,
      city_id: filters.city_id || undefined,
      keyword: filters.keyword,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '矿产品供求列表加载失败'
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  const [industryResult, oreResult, provinceResult] = await Promise.all([
    getMaterialIndustryList(),
    getMaterialOreList(),
    getRegionList(1),
  ])
  industries.value = industryResult.list || []
  ores.value = oreResult.list || []
  provinces.value = provinceResult.list || []
}

async function loadFilterCities() {
  filters.city_id = 0
  filterCities.value = []

  if (filters.province_id) {
    const result = await getRegionList(filters.province_id)
    filterCities.value = result.list || []
  }

  fetchList()
}

async function loadFormCities() {
  form.city_id = 0
  formCities.value = []

  if (form.province_id) {
    const result = await getRegionList(form.province_id)
    formCities.value = result.list || []
  }
}

async function submitOrder() {
  submitMessage.value = ''

  if (!form.industry_id || !form.mine_ore_id || !form.province_id || !form.city_id || !form.contact_information) {
    submitMessage.value = '请填写品类、矿种、地区和联系方式'
    return
  }

  try {
    submitting.value = true
    const result = await createMaterialOrder(form)
    submitMessage.value = `发布成功，单号：${result.order_number}`
    Object.assign(form, {
      order_type: 2,
      industry_id: 0,
      mine_ore_id: 0,
      purchase_num: 0,
      purchase_price_type: 1,
      purchase_price: 0,
      delivery_place: '',
      province_id: 0,
      city_id: 0,
      indicator_requirement: '',
      img: '',
      img_attr: '',
      contact_information: '',
    })
    formCities.value = []
    fetchList()
  } catch (error) {
    submitMessage.value = error instanceof Error ? error.message : '发布失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  applyRouteFilters()
  await loadOptions()
  fetchList()
})

watch(
  () => route.query.order_type,
  () => {
    applyRouteFilters()
    fetchList()
  },
)
</script>

<template>
  <main class="trade-page products-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="trade-hero products-hero">
      <div class="container trade-hero-inner">
        <p class="eyebrow">MINERAL PRODUCTS</p>
        <h1>矿产品交易</h1>
        <p>聚合矿材网式原料供求信息，支持矿产品出售、矿产品求购、地区筛选、指标要求和在线发布供求单。</p>
        <div class="products-hero-actions">
          <button type="button" @click="filters.order_type = 2; fetchList()">看供货</button>
          <button type="button" @click="filters.order_type = 1; fetchList()">看求购</button>
          <a href="#publish-product-order">发布供求单</a>
        </div>
      </div>
    </section>

    <section class="container trade-layout">
      <div class="trade-main">
        <section class="trade-filter panel">
          <div class="products-current-search">
            <strong>当前搜索</strong>
            <span>{{ activeTypeText }} · {{ filters.keyword || '全部矿产品' }}</span>
            <button type="button" @click="resetFilters">重置</button>
          </div>
          <div>
            <strong>供求类型</strong>
            <button
              v-for="item in orderTypes"
              :key="item.value"
              type="button"
              :class="{ active: filters.order_type === item.value }"
              @click="filters.order_type = item.value; fetchList()"
            >
              {{ item.label }}
            </button>
          </div>
          <div>
            <strong>品类矿种</strong>
            <span class="region-selects">
              <select v-model.number="filters.industry_id" @change="fetchList">
                <option :value="0">全部品类</option>
                <option v-for="item in industries" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select v-model.number="filters.mine_ore_id" @change="fetchList">
                <option :value="0">全部矿种</option>
                <option v-for="item in ores" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </span>
          </div>
          <div>
            <strong>交货地区</strong>
            <span class="region-selects">
              <select v-model.number="filters.province_id" @change="loadFilterCities">
                <option :value="0">全国</option>
                <option v-for="item in provinces" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select v-model.number="filters.city_id" :disabled="!filters.province_id" @change="fetchList">
                <option :value="0">全部城市</option>
                <option v-for="item in filterCities" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </span>
          </div>
          <form class="trade-search" @submit.prevent="fetchList">
            <input v-model.trim="filters.keyword" type="search" placeholder="搜索矿种、指标、交货地关键词" />
            <button type="submit">搜索</button>
          </form>
        </section>

        <section class="trade-list panel">
          <div class="section-title compact">
            <span>原料供求</span>
            <small>共 {{ total }} 条</small>
          </div>

          <div v-if="loading" class="trade-empty">矿产品供求加载中...</div>
          <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
          <div v-else-if="list.length === 0" class="trade-empty">暂无矿产品供求信息</div>

          <article v-for="item in list" v-else :key="item.id" class="mining-card product-order-card">
            <div>
              <div class="mining-card-tags">
                <span :class="orderTypeClass(item.order_type)">{{ orderTypeText(item.order_type) }}</span>
                <span>{{ item.industry_name || '矿产品' }}</span>
                <span>{{ item.mine_ore_name || '矿种待定' }}</span>
              </div>
              <h2 class="product-order-title">
                {{ item.mine_ore_name || item.industry_name || '矿产品供求' }}
                <small>{{ item.order_number }}</small>
              </h2>
              <p>{{ item.indicator_requirement || '暂无指标说明，可联系发布方获取详细化验指标。' }}</p>
              <div class="product-order-facts">
                <span>数量：{{ item.purchase_num ? `${item.purchase_num} 吨` : '详询' }}</span>
                <span>交货地：{{ item.delivery_place || '待定' }}</span>
                <span>发布时间：{{ item.create_time || '-' }}</span>
              </div>
            </div>
            <aside class="product-order-aside">
              <strong>{{ priceText(item) }}</strong>
              <a :href="`tel:${item.contact_information}`">联系发布方</a>
            </aside>
          </article>
        </section>
      </div>

      <aside id="publish-product-order" class="publish-panel panel">
        <div class="section-title compact">
          <span>发布供求单</span>
        </div>
        <form class="publish-form" @submit.prevent="submitOrder">
          <select v-model.number="form.order_type">
            <option :value="2">发布供货单</option>
            <option :value="1">发布求购单</option>
          </select>
          <select v-model.number="form.industry_id">
            <option :value="0">请选择品类</option>
            <option v-for="item in industries" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <select v-model.number="form.mine_ore_id">
            <option :value="0">请选择矿种</option>
            <option v-for="item in ores" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <input v-model.number="form.purchase_num" type="number" min="0" step="0.01" placeholder="数量（吨）" />
          <select v-model.number="form.purchase_price_type">
            <option v-for="item in priceTypes" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <input
            v-if="form.purchase_price_type === 3"
            v-model.number="form.purchase_price"
            type="number"
            min="0"
            step="0.01"
            placeholder="价格（元/吨）"
          />
          <div class="publish-region-selects">
            <select v-model.number="form.province_id" @change="loadFormCities">
              <option :value="0">请选择省份</option>
              <option v-for="item in provinces" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
            <select v-model.number="form.city_id" :disabled="!form.province_id">
              <option :value="0">请选择城市</option>
              <option v-for="item in formCities" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <input v-model.trim="form.delivery_place" type="text" placeholder="交货地，如包头/港口/矿区" />
          <textarea v-model.trim="form.indicator_requirement" placeholder="指标要求，如品位、水分、粒度、包装、结算方式"></textarea>
          <input v-model.trim="form.contact_information" type="tel" placeholder="联系电话 / 微信" />
          <button type="submit" :disabled="submitting">
            {{ submitting ? '提交中...' : form.order_type === 2 ? '发布供货单' : '发布求购单' }}
          </button>
          <p v-if="submitMessage">{{ submitMessage }}</p>
        </form>
      </aside>
    </section>
  </main>
</template>
