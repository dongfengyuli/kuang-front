<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  createUsedEquipInquiry,
  getUsedEquipListingDetail,
  type UsedEquipListingDetail,
} from '../services/usedEquip'

const route = useRoute()
const detail = ref<UsedEquipListingDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const submitting = ref(false)
const submitMessage = ref('')

const inquiry = reactive({
  contact_name: '',
  contact_phone: '',
  company_name: '',
  content: '',
})

const listingId = computed(() => Number(route.params.id || 0))

function typeClass(type: string) {
  if (type === 'buy') return 'buy'
  if (type === 'recycle') return 'recycle'
  return 'sell'
}

async function fetchDetail() {
  if (!listingId.value) {
    errorMessage.value = '无效的信息 ID'
    return
  }
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getUsedEquipListingDetail(listingId.value)
    detail.value = result.detail
  } catch (error) {
    detail.value = null
    errorMessage.value = error instanceof Error ? error.message : '详情加载失败'
  } finally {
    loading.value = false
  }
}

async function submitInquiry() {
  if (!detail.value) return
  try {
    submitting.value = true
    submitMessage.value = ''
    if (!inquiry.contact_name || !inquiry.contact_phone) {
      submitMessage.value = '请填写联系人和电话'
      return
    }
    await createUsedEquipInquiry({
      listing_id: detail.value.id,
      inquiry_type: 'intent',
      content: inquiry.content || `我对「${detail.value.title}」有意向，请联系我。`,
      contact_name: inquiry.contact_name,
      contact_phone: inquiry.contact_phone,
      company_name: inquiry.company_name,
    })
    submitMessage.value = '意向已提交，发布方会尽快联系您'
    inquiry.content = ''
  } catch (error) {
    submitMessage.value = error instanceof Error ? error.message : '提交失败'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchDetail)
watch(listingId, fetchDetail)
</script>

<template>
  <main class="trade-page used-equip-detail-page">
    <RouterLink to="/channel/used-equip" class="back-link">返回二手设备交易</RouterLink>

    <div v-if="loading" class="container trade-empty">详情加载中...</div>
    <div v-else-if="errorMessage" class="container trade-empty">{{ errorMessage }}</div>

    <template v-else-if="detail">
      <section class="container used-equip-detail-layout">
        <article class="panel used-equip-detail-main">
          <div class="mining-card-tags">
            <span :class="typeClass(detail.listing_type)">{{ detail.listing_type_text }}</span>
            <span v-if="detail.category_name">{{ detail.category_name }}</span>
            <span v-if="detail.is_recommend">推荐</span>
            <span v-if="detail.is_hot">热门</span>
          </div>
          <h1>{{ detail.title }}</h1>
          <p class="used-equip-detail-meta">
            <span>编号 {{ detail.listing_no }}</span>
            <span>{{ detail.published_at }}</span>
            <span>浏览 {{ detail.view_count }}</span>
            <span>意向 {{ detail.inquiry_count }}</span>
          </p>

          <div v-if="detail.images?.length" class="used-equip-gallery">
            <img v-for="(img, index) in detail.images" :key="`${detail.id}-${index}`" :src="img" :alt="detail.title" />
          </div>

          <div class="used-equip-facts">
            <div><strong>价格</strong><span>{{ detail.price_text }}</span></div>
            <div><strong>品牌型号</strong><span>{{ [detail.brand, detail.model].filter(Boolean).join(' ') || '详询' }}</span></div>
            <div><strong>成色</strong><span>{{ detail.condition_level || '详询' }}</span></div>
            <div><strong>年份</strong><span>{{ detail.manufacture_year || '详询' }}</span></div>
            <div><strong>数量</strong><span>{{ detail.quantity }}{{ detail.unit }}</span></div>
            <div><strong>地区</strong><span>{{ detail.location || '待定' }}</span></div>
            <div><strong>单位</strong><span>{{ detail.company_name || '个人/企业' }}</span></div>
          </div>

          <section class="detail-content">
            <h2>详细说明</h2>
            <p style="white-space: pre-wrap">{{ detail.content || detail.summary || '暂无详细说明' }}</p>
          </section>

          <section v-if="detail.related?.length" class="used-equip-related">
            <h2>相关信息</h2>
            <div class="used-equip-related-list">
              <RouterLink
                v-for="item in detail.related"
                :key="item.id"
                :to="`/used-equip/${item.id}`"
                class="used-equip-related-item"
              >
                <strong>{{ item.title }}</strong>
                <span>{{ item.listing_type_text }} · {{ item.price_text }}</span>
              </RouterLink>
            </div>
          </section>
        </article>

        <aside class="panel used-equip-detail-aside">
          <div class="section-title compact"><span>联系与意向</span></div>
          <p class="used-equip-contact">
            <strong>{{ detail.contact_name || '发布方' }}</strong>
            <a v-if="detail.contact_phone" :href="`tel:${detail.contact_phone}`">{{ detail.contact_phone }}</a>
          </p>
          <form class="publish-form" @submit.prevent="submitInquiry">
            <input v-model.trim="inquiry.contact_name" type="text" placeholder="您的姓名" required />
            <input v-model.trim="inquiry.contact_phone" type="tel" placeholder="您的电话" required />
            <input v-model.trim="inquiry.company_name" type="text" placeholder="单位名称（可选）" />
            <textarea v-model.trim="inquiry.content" placeholder="留言：看货时间、预算、运输需求等"></textarea>
            <button type="submit" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交意向对接' }}
            </button>
            <p v-if="submitMessage">{{ submitMessage }}</p>
          </form>
        </aside>
      </section>
    </template>
  </main>
</template>
