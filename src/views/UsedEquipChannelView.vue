<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  createUsedEquipListing,
  getUsedEquipCategoryList,
  getUsedEquipListingList,
  type UsedEquipCategory,
  type UsedEquipCreatePayload,
  type UsedEquipListingItem,
  type UsedEquipListingType,
} from '../services/usedEquip'

const route = useRoute()
const router = useRouter()

const tabs: { label: string; value: UsedEquipListingType }[] = [
  { label: '全部', value: 'all' },
  { label: '转让', value: 'transfer' },
  { label: '求购', value: 'buy' },
  { label: '回收', value: 'recycle' },
  { label: '最新发布', value: 'latest' },
]

const priceTypes = [
  { label: '面议', value: 1 },
  { label: '电议', value: 2 },
  { label: '明码标价', value: 3 },
]

const filters = reactive({
  listing_type: 'all' as UsedEquipListingType,
  category_id: 0,
  keyword: '',
  province: '',
})

const form = reactive<UsedEquipCreatePayload>({
  listing_type: 'transfer',
  category_id: 0,
  title: '',
  summary: '',
  content: '',
  brand: '',
  model: '',
  condition_level: '',
  manufacture_year: '',
  quantity: 1,
  unit: '台',
  price: 0,
  price_type: 1,
  province: '',
  city: '',
  location: '',
  company_name: '',
  contact_name: '',
  contact_phone: '',
  tags: '',
})

const list = ref<UsedEquipListingItem[]>([])
const categories = ref<UsedEquipCategory[]>([])
const total = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const submitting = ref(false)
const submitMessage = ref('')

const activeTabText = computed(
  () => tabs.find((item) => item.value === filters.listing_type)?.label || '全部',
)

function typeClass(type: string) {
  if (type === 'buy') return 'buy'
  if (type === 'recycle') return 'recycle'
  return 'sell'
}

function applyRouteFilters() {
  const listingType = String(route.query.listing_type || 'all') as UsedEquipListingType
  if (tabs.some((item) => item.value === listingType)) {
    filters.listing_type = listingType
  }
  const categoryId = Number(route.query.category_id || 0)
  filters.category_id = Number.isFinite(categoryId) ? categoryId : 0
  filters.keyword = String(route.query.keyword || '')
}

function syncRoute() {
  router.replace({
    query: {
      listing_type: filters.listing_type === 'all' ? undefined : filters.listing_type,
      category_id: filters.category_id || undefined,
      keyword: filters.keyword || undefined,
    },
  })
}

function resetFilters() {
  filters.listing_type = 'all'
  filters.category_id = 0
  filters.keyword = ''
  filters.province = ''
  syncRoute()
  fetchList()
}

async function fetchCategories() {
  try {
    const result = await getUsedEquipCategoryList()
    categories.value = result.list || []
  } catch {
    categories.value = []
  }
}

async function fetchList() {
  try {
    loading.value = true
    errorMessage.value = ''
    const listingType = filters.listing_type === 'all' ? undefined : filters.listing_type
    const result = await getUsedEquipListingList({
      page: 1,
      page_size: 20,
      listing_type: listingType,
      category_id: filters.category_id || undefined,
      keyword: filters.keyword || undefined,
      province: filters.province || undefined,
      sort: filters.listing_type === 'latest' ? 'latest' : undefined,
    })
    list.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    list.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '二手设备信息加载失败'
  } finally {
    loading.value = false
  }
}

async function submitListing() {
  try {
    submitting.value = true
    submitMessage.value = ''
    if (!form.title || !form.contact_name || !form.contact_phone) {
      submitMessage.value = '请填写标题、联系人和电话'
      return
    }
    const result = await createUsedEquipListing({
      ...form,
      category_id: form.category_id || undefined,
      location: form.location || `${form.province || ''}${form.city || ''}`,
    })
    submitMessage.value = `发布成功，编号 ${result.listing_no}`
    Object.assign(form, {
      title: '',
      summary: '',
      content: '',
      brand: '',
      model: '',
      condition_level: '',
      manufacture_year: '',
      quantity: 1,
      price: 0,
      price_type: 1,
      tags: '',
    })
    await fetchList()
  } catch (error) {
    submitMessage.value = error instanceof Error ? error.message : '发布失败'
  } finally {
    submitting.value = false
  }
}

function switchTab(value: UsedEquipListingType) {
  filters.listing_type = value
  syncRoute()
  fetchList()
}

onMounted(async () => {
  applyRouteFilters()
  await fetchCategories()
  await fetchList()
})

watch(
  () => route.query,
  () => {
    applyRouteFilters()
    fetchList()
  },
)
</script>

<template>
  <main class="trade-page used-equip-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>

    <section class="trade-hero used-equip-hero">
      <div class="container trade-hero-inner">
        <p class="eyebrow">USED MINING EQUIPMENT</p>
        <h1>二手设备交易</h1>
        <p>
          参考处理网、网优二手矿业等站点，聚焦矿山设备转让、求购与回收撮合，支持分类筛选、最新发布和意向对接。
        </p>
        <div class="equipment-hero-actions">
          <button type="button" @click="switchTab('transfer')">看转让</button>
          <button type="button" @click="switchTab('buy')">看求购</button>
          <button type="button" @click="switchTab('recycle')">看回收</button>
          <a href="#publish-used-equip">发布信息</a>
        </div>
      </div>
    </section>

    <section class="container trade-layout">
      <div class="trade-main">
        <section class="trade-filter panel">
          <div class="products-current-search">
            <strong>当前搜索</strong>
            <span>{{ activeTabText }} · {{ filters.keyword || '全部二手设备' }}</span>
            <button type="button" @click="resetFilters">重置</button>
          </div>
          <div>
            <strong>信息类型</strong>
            <button
              v-for="item in tabs"
              :key="item.value"
              type="button"
              :class="{ active: filters.listing_type === item.value }"
              @click="switchTab(item.value)"
            >
              {{ item.label }}
            </button>
          </div>
          <div>
            <strong>设备品类</strong>
            <span class="region-selects">
              <select
                v-model.number="filters.category_id"
                @change="syncRoute(); fetchList()"
              >
                <option :value="0">全部分类</option>
                <option v-for="item in categories" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </span>
          </div>
          <form class="trade-search" @submit.prevent="syncRoute(); fetchList()">
            <input v-model.trim="filters.keyword" type="search" placeholder="搜索设备名称、品牌、型号、地区" />
            <button type="submit">搜索</button>
          </form>
        </section>

        <section class="trade-list panel">
          <div class="section-title compact">
            <span>二手设备供求</span>
            <small>共 {{ total }} 条</small>
          </div>

          <div v-if="loading" class="trade-empty">二手设备信息加载中...</div>
          <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
          <div v-else-if="list.length === 0" class="trade-empty">暂无二手设备信息</div>

          <article v-for="item in list" v-else :key="item.id" class="mining-card product-order-card used-equip-card">
            <div>
              <div class="mining-card-tags">
                <span :class="typeClass(item.listing_type)">{{ item.listing_type_text }}</span>
                <span v-if="item.category_name">{{ item.category_name }}</span>
                <span v-if="item.is_top">置顶</span>
                <span v-if="item.is_hot">热门</span>
                <span v-for="tag in (item.tags || []).slice(0, 2)" :key="`${item.id}-${tag}`">{{ tag }}</span>
              </div>
              <h2 class="product-order-title">
                <RouterLink :to="`/used-equip/${item.id}`">{{ item.title }}</RouterLink>
                <small>{{ item.listing_no }}</small>
              </h2>
              <p>{{ item.summary || '暂无摘要，点击查看详情。' }}</p>
              <div class="product-order-facts">
                <span v-if="item.brand || item.model">型号：{{ [item.brand, item.model].filter(Boolean).join(' ') }}</span>
                <span v-if="item.condition_level">成色：{{ item.condition_level }}</span>
                <span>地区：{{ item.location || '待定' }}</span>
                <span>浏览：{{ item.view_count }}</span>
                <span>{{ item.published_at || '-' }}</span>
              </div>
            </div>
            <aside class="product-order-aside">
              <strong>{{ item.price_text }}</strong>
              <RouterLink :to="`/used-equip/${item.id}`">查看详情</RouterLink>
            </aside>
          </article>
        </section>
      </div>

      <aside id="publish-used-equip" class="publish-panel panel">
        <div class="section-title compact">
          <span>发布二手信息</span>
        </div>
        <form class="publish-form" @submit.prevent="submitListing">
          <select v-model="form.listing_type">
            <option value="transfer">发布转让</option>
            <option value="buy">发布求购</option>
            <option value="recycle">发布回收</option>
          </select>
          <select v-model.number="form.category_id">
            <option :value="0">请选择品类</option>
            <option v-for="item in categories" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <input v-model.trim="form.title" type="text" placeholder="标题，如：转让69鄂式破碎机" required />
          <input v-model.trim="form.summary" type="text" placeholder="一句话摘要" />
          <input v-model.trim="form.brand" type="text" placeholder="品牌" />
          <input v-model.trim="form.model" type="text" placeholder="型号" />
          <input v-model.trim="form.condition_level" type="text" placeholder="成色，如九成新" />
          <input v-model.trim="form.manufacture_year" type="text" placeholder="出厂年份" />
          <input v-model.number="form.quantity" type="number" min="1" placeholder="数量" />
          <select v-model.number="form.price_type">
            <option v-for="item in priceTypes" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <input
            v-if="form.price_type === 3"
            v-model.number="form.price"
            type="number"
            min="0"
            step="0.01"
            placeholder="价格（元）"
          />
          <input v-model.trim="form.province" type="text" placeholder="省份，如山东" />
          <input v-model.trim="form.city" type="text" placeholder="城市，如临沂" />
          <input v-model.trim="form.location" type="text" placeholder="所在地展示，可留空自动拼接" />
          <input v-model.trim="form.company_name" type="text" placeholder="单位名称" />
          <textarea v-model.trim="form.content" placeholder="详细描述：工况、配件、看货地点、运输方式等"></textarea>
          <input v-model.trim="form.contact_name" type="text" placeholder="联系人" required />
          <input v-model.trim="form.contact_phone" type="tel" placeholder="联系电话" required />
          <input v-model.trim="form.tags" type="text" placeholder="标签，逗号分隔" />
          <button type="submit" :disabled="submitting">
            {{ submitting ? '提交中...' : '立即发布' }}
          </button>
          <p v-if="submitMessage">{{ submitMessage }}</p>
        </form>
      </aside>
    </section>
  </main>
</template>
