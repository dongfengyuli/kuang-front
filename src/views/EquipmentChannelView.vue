<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getRegionList, type RegionItem } from '../services/content'
import {
  createEquipmentInquiry,
  getEquipmentCategoryList,
  getEquipmentProductList,
  getRecommendedEquipmentCompanies,
  type EquipmentCategoryItem,
  type EquipmentCompanyItem,
  type EquipmentInquiryPayload,
  type EquipmentProductItem,
} from '../services/equipment'

const filters = reactive({
  category_id: 0,
  sub_category_id: 0,
  product_category_id: 0,
  province_id: 0,
  city_id: 0,
  district_id: 0,
  keyword: '',
})

const inquiryForm = reactive({
  title: '',
  content: '',
  quantity: '',
  contact_name: '',
  contact_phone: '',
  company_name: '',
})

const products = ref<EquipmentProductItem[]>([])
const total = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const categories = ref<EquipmentCategoryItem[]>([])
const subCategories = ref<EquipmentCategoryItem[]>([])
const productCategories = ref<EquipmentCategoryItem[]>([])
const provinces = ref<RegionItem[]>([])
const cities = ref<RegionItem[]>([])
const districts = ref<RegionItem[]>([])
const recommendedCompanies = ref<EquipmentCompanyItem[]>([])
const companyError = ref('')
const compareItems = ref<EquipmentProductItem[]>([])
const compareOpen = ref(false)
const compareMessage = ref('')
const inquiryOpen = ref(false)
const inquirySubmitting = ref(false)
const inquiryMessage = ref('')
const inquiryProducts = ref<EquipmentProductItem[]>([])
const inquiryCompany = ref<EquipmentCompanyItem | null>(null)

const activeCategoryId = computed(
  () => filters.product_category_id || filters.sub_category_id || filters.category_id || undefined,
)

const inquiryProductNames = computed(() => inquiryProducts.value.map((item) => item.title).join('、'))

function productTags(item: EquipmentProductItem) {
  return item.tags?.length ? item.tags : [item.member_level || '普通会员', item.category_name || '矿山设备']
}

function productLocation(item: EquipmentProductItem) {
  return item.location || '全国'
}

function parameterEntries(item: EquipmentProductItem) {
  return Object.entries(item.parameters || {}).slice(0, 4)
}

function isCompared(item: EquipmentProductItem) {
  return compareItems.value.some((selected) => selected.id === item.id)
}

async function fetchProducts() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getEquipmentProductList({
      page: 1,
      page_size: 12,
      category_id: activeCategoryId.value,
      province_id: filters.province_id || undefined,
      city_id: filters.city_id || undefined,
      district_id: filters.district_id || undefined,
      keyword: filters.keyword,
    })
    products.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    products.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '矿山设备列表加载失败'
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  const result = await getEquipmentCategoryList(0)
  categories.value = result.list || []
}

async function loadSubCategories() {
  filters.sub_category_id = 0
  filters.product_category_id = 0
  subCategories.value = []
  productCategories.value = []

  if (filters.category_id) {
    const result = await getEquipmentCategoryList(filters.category_id)
    subCategories.value = result.list || []
  }

  fetchProducts()
}

async function loadProductCategories() {
  filters.product_category_id = 0
  productCategories.value = []

  if (filters.sub_category_id) {
    const result = await getEquipmentCategoryList(filters.sub_category_id)
    productCategories.value = result.list || []
  }

  fetchProducts()
}

async function loadProvinces() {
  const result = await getRegionList(1)
  provinces.value = result.list || []
}

async function loadCities() {
  filters.city_id = 0
  filters.district_id = 0
  cities.value = []
  districts.value = []

  if (filters.province_id) {
    const result = await getRegionList(filters.province_id)
    cities.value = result.list || []
  }

  fetchProducts()
}

async function loadDistricts() {
  filters.district_id = 0
  districts.value = []

  if (filters.city_id) {
    const result = await getRegionList(filters.city_id)
    districts.value = result.list || []
  }

  fetchProducts()
}

async function loadRecommendedCompanies() {
  try {
    companyError.value = ''
    const result = await getRecommendedEquipmentCompanies()
    recommendedCompanies.value = result.list || []
  } catch (error) {
    companyError.value = error instanceof Error ? error.message : '推荐企业加载失败'
  }
}

function resetFilters() {
  Object.assign(filters, {
    category_id: 0,
    sub_category_id: 0,
    product_category_id: 0,
    province_id: 0,
    city_id: 0,
    district_id: 0,
    keyword: '',
  })
  subCategories.value = []
  productCategories.value = []
  cities.value = []
  districts.value = []
  fetchProducts()
}

function resetInquiryForm() {
  Object.assign(inquiryForm, {
    title: '',
    content: '',
    quantity: '',
    contact_name: '',
    contact_phone: '',
    company_name: '',
  })
}

function openProductInquiry(item: EquipmentProductItem) {
  inquiryProducts.value = [item]
  inquiryCompany.value = null
  inquiryMessage.value = ''
  inquiryForm.title = `咨询：${item.title}`
  inquiryOpen.value = true
}

function openCompareInquiry() {
  if (compareItems.value.length === 0) {
    compareMessage.value = '请先选择需要询盘的设备'
    return
  }

  inquiryProducts.value = [...compareItems.value]
  inquiryCompany.value = null
  inquiryMessage.value = ''
  inquiryForm.title = `批量询盘：${compareItems.value.map((item) => item.title).join('、')}`
  inquiryOpen.value = true
}

function openCompanyInquiry(company: EquipmentCompanyItem) {
  inquiryProducts.value = []
  inquiryCompany.value = company
  inquiryMessage.value = ''
  inquiryForm.title = `咨询企业：${company.name}`
  inquiryOpen.value = true
}

function closeInquiry() {
  inquiryOpen.value = false
  inquiryProducts.value = []
  inquiryCompany.value = null
}

function toggleCompare(item: EquipmentProductItem) {
  compareMessage.value = ''
  const index = compareItems.value.findIndex((selected) => selected.id === item.id)

  if (index >= 0) {
    compareItems.value.splice(index, 1)
    return
  }

  if (compareItems.value.length >= 5) {
    compareMessage.value = '最多只能选择 5 个设备进行对比'
    return
  }

  compareItems.value.push(item)
}

function removeCompareItem(item: EquipmentProductItem) {
  compareItems.value = compareItems.value.filter((selected) => selected.id !== item.id)
}

function clearCompare() {
  compareItems.value = []
  compareOpen.value = false
  compareMessage.value = ''
}

async function submitInquiry() {
  inquiryMessage.value = ''

  if (!inquiryForm.title || !inquiryForm.content || !inquiryForm.contact_name || !inquiryForm.contact_phone) {
    inquiryMessage.value = '请填写询盘标题、需求详情、联系人和联系电话'
    return
  }

  const payload: EquipmentInquiryPayload = {
    product_ids: inquiryProducts.value.length ? inquiryProducts.value.map((item) => item.id) : undefined,
    company_id: inquiryCompany.value?.id,
    ...inquiryForm,
  }

  try {
    inquirySubmitting.value = true
    await createEquipmentInquiry(payload)
    inquiryMessage.value = '询盘已提交，供应商会尽快联系你'
    resetInquiryForm()
    inquiryProducts.value = []
    inquiryCompany.value = null
  } catch (error) {
    inquiryMessage.value = error instanceof Error ? error.message : '询盘提交失败，请稍后重试'
  } finally {
    inquirySubmitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadProvinces(), loadRecommendedCompanies()])
  fetchProducts()
})
</script>

<template>
  <main class="trade-page equipment-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="trade-hero equipment-hero">
      <div class="container trade-hero-inner">
        <p class="eyebrow">MINING EQUIPMENT</p>
        <h1>矿山设备选型采购</h1>
        <p>参考矿采网的产品选型逻辑，聚合设备品类、供应商、询盘和对比能力，帮助矿山企业快速找到合适设备。</p>
        <div class="equipment-hero-actions">
          <a href="#equipment-products">找产品</a>
          <a href="#equipment-companies">找企业</a>
          <button type="button" @click="inquiryOpen = true">发询盘</button>
        </div>
      </div>
    </section>

    <section class="container trade-layout">
      <div class="trade-main">
        <section class="trade-filter panel equipment-filter">
          <div class="equipment-current-search">
            <strong>当前搜索</strong>
            <span>{{ filters.keyword || '全部矿山设备' }}</span>
            <button type="button" @click="resetFilters">重置</button>
          </div>
          <div>
            <strong>设备品类</strong>
            <span class="region-selects">
              <select v-model.number="filters.category_id" @change="loadSubCategories">
                <option :value="0">全部大类</option>
                <option v-for="item in categories" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select
                v-model.number="filters.sub_category_id"
                :disabled="!filters.category_id"
                @change="loadProductCategories"
              >
                <option :value="0">全部子类</option>
                <option v-for="item in subCategories" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select v-model.number="filters.product_category_id" :disabled="!filters.sub_category_id" @change="fetchProducts">
                <option :value="0">全部细分</option>
                <option v-for="item in productCategories" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </span>
          </div>
          <div>
            <strong>地区</strong>
            <span class="region-selects">
              <select v-model.number="filters.province_id" @change="loadCities">
                <option :value="0">全国</option>
                <option v-for="item in provinces" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select v-model.number="filters.city_id" :disabled="!filters.province_id" @change="loadDistricts">
                <option :value="0">全部城市</option>
                <option v-for="item in cities" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <select v-model.number="filters.district_id" :disabled="!filters.city_id" @change="fetchProducts">
                <option :value="0">全部区县</option>
                <option v-for="item in districts" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </span>
          </div>
          <form class="trade-search" @submit.prevent="fetchProducts">
            <input v-model.trim="filters.keyword" type="search" placeholder="搜索设备名称、型号、供应商" />
            <button type="submit">搜索</button>
          </form>
        </section>

        <section id="equipment-products" class="trade-list panel">
          <div class="section-title compact">
            <span>设备产品</span>
            <small>共 {{ total }} 条</small>
          </div>

          <div v-if="loading" class="trade-empty">矿山设备加载中...</div>
          <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
          <div v-else-if="products.length === 0" class="trade-empty">暂无矿山设备产品</div>

          <article v-for="item in products" v-else :key="item.id" class="mining-card equipment-card">
            <div class="equipment-card-body">
              <div class="mining-card-tags">
                <span v-for="tag in productTags(item)" :key="`${item.id}-${tag}`">{{ tag }}</span>
              </div>
              <h2 class="equipment-card-title">{{ item.title }}</h2>
              <p>{{ item.summary || '供应商暂未填写产品说明，可发起询盘获取详细参数与报价。' }}</p>
              <dl v-if="parameterEntries(item).length" class="equipment-params">
                <div v-for="[name, value] in parameterEntries(item)" :key="`${item.id}-${name}`">
                  <dt>{{ name }}</dt>
                  <dd>{{ value }}</dd>
                </div>
              </dl>
              <div class="mining-card-meta">
                <span>型号：{{ item.model || '详询' }}</span>
                <span>分类：{{ item.category_name || '矿山设备' }}</span>
                <span>供应商：{{ item.company_name || '待补充' }}</span>
                <span>地区：{{ productLocation(item) }}</span>
                <span>发布时间：{{ item.published_at || '-' }}</span>
              </div>
            </div>
            <aside class="equipment-card-actions">
              <strong>{{ item.model || '可询价' }}</strong>
              <button type="button" @click="openProductInquiry(item)">一键询盘</button>
              <button type="button" :class="{ active: isCompared(item) }" @click="toggleCompare(item)">
                {{ isCompared(item) ? '已加入' : '+ 对比' }}
              </button>
            </aside>
          </article>
        </section>
      </div>

      <aside class="equipment-sidebar">
        <section class="publish-panel panel">
          <div class="section-title compact">
            <span>发布询盘</span>
          </div>
          <form class="publish-form" @submit.prevent="submitInquiry">
            <input v-model.trim="inquiryForm.title" type="text" placeholder="询盘标题，如采购圆锥破碎机" />
            <input v-model.trim="inquiryForm.quantity" type="text" placeholder="采购数量，如 1 台 / 5 套" />
            <textarea v-model.trim="inquiryForm.content" placeholder="说明型号、产能、工况、交付地等需求"></textarea>
            <input v-model.trim="inquiryForm.company_name" type="text" placeholder="你的企业名称" />
            <input v-model.trim="inquiryForm.contact_name" type="text" placeholder="联系人" />
            <input v-model.trim="inquiryForm.contact_phone" type="tel" placeholder="联系电话" />
            <button type="submit" :disabled="inquirySubmitting">
              {{ inquirySubmitting ? '提交中...' : '立即提交' }}
            </button>
            <p v-if="inquiryMessage">{{ inquiryMessage }}</p>
          </form>
        </section>

        <section id="equipment-companies" class="panel equipment-company-panel">
          <div class="section-title compact">
            <span>推荐企业</span>
          </div>
          <div v-if="companyError" class="trade-empty">{{ companyError }}</div>
          <div v-else-if="recommendedCompanies.length === 0" class="trade-empty">暂无推荐企业</div>
          <article v-for="company in recommendedCompanies" v-else :key="company.id" class="equipment-company-card">
            <strong>{{ company.name }}</strong>
            <p>{{ company.main_products || '主营矿山设备及配套服务' }}</p>
            <div>
              <span v-if="company.location">{{ company.location }}</span>
              <span v-for="tag in company.tags || []" :key="`${company.id}-${tag}`">{{ tag }}</span>
            </div>
            <button type="button" @click="openCompanyInquiry(company)">询盘</button>
          </article>
        </section>
      </aside>
    </section>

    <section v-if="compareItems.length" class="compare-dock">
      <div class="container compare-dock-inner">
        <strong>已选择 {{ compareItems.length }}/5</strong>
        <div class="compare-tags">
          <button v-for="item in compareItems" :key="item.id" type="button" @click="removeCompareItem(item)">
            {{ item.title }} ×
          </button>
        </div>
        <div class="compare-actions">
          <button type="button" :disabled="compareItems.length < 2" @click="compareOpen = true">一键对比</button>
          <button type="button" @click="openCompareInquiry">一键询盘</button>
          <button type="button" @click="clearCompare">清空</button>
        </div>
        <p v-if="compareMessage">{{ compareMessage }}</p>
      </div>
    </section>

    <div v-if="inquiryOpen" class="inquiry-modal" @click.self="closeInquiry">
      <section class="inquiry-dialog panel">
        <div class="section-title compact">
          <span>一键询盘</span>
          <button type="button" @click="closeInquiry">关闭</button>
        </div>
        <p v-if="inquiryProducts.length" class="inquiry-target">询盘产品：{{ inquiryProductNames }}</p>
        <p v-else-if="inquiryCompany" class="inquiry-target">询盘企业：{{ inquiryCompany.name }}</p>
        <form class="publish-form" @submit.prevent="submitInquiry">
          <input v-model.trim="inquiryForm.title" type="text" placeholder="询盘标题" />
          <input v-model.trim="inquiryForm.quantity" type="text" placeholder="采购数量" />
          <textarea v-model.trim="inquiryForm.content" placeholder="请填写采购需求、工况参数、交付地区等"></textarea>
          <input v-model.trim="inquiryForm.company_name" type="text" placeholder="你的企业名称" />
          <input v-model.trim="inquiryForm.contact_name" type="text" placeholder="联系人" />
          <input v-model.trim="inquiryForm.contact_phone" type="tel" placeholder="联系电话" />
          <button type="submit" :disabled="inquirySubmitting">
            {{ inquirySubmitting ? '提交中...' : '提交询盘' }}
          </button>
          <p v-if="inquiryMessage">{{ inquiryMessage }}</p>
        </form>
      </section>
    </div>

    <div v-if="compareOpen" class="inquiry-modal" @click.self="compareOpen = false">
      <section class="compare-dialog panel">
        <div class="section-title compact">
          <span>设备对比</span>
          <button type="button" @click="compareOpen = false">关闭</button>
        </div>
        <div class="equipment-compare-table">
          <article v-for="item in compareItems" :key="item.id">
            <strong>{{ item.title }}</strong>
            <span>型号：{{ item.model || '详询' }}</span>
            <span>分类：{{ item.category_name || '矿山设备' }}</span>
            <span>供应商：{{ item.company_name || '待补充' }}</span>
            <span>地区：{{ productLocation(item) }}</span>
            <p>{{ item.summary || '暂无产品说明' }}</p>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
