<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getMiningRightDetail, type MiningRightItem } from '../services/trade'

const route = useRoute()
const detail = ref<MiningRightItem | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const id = computed(() => Number(route.params.id))

function priceText(item: MiningRightItem) {
  if (item.price_type === 2 && item.price > 0) {
    return `${item.price} 万元`
  }

  return '面议'
}

onMounted(async () => {
  try {
    loading.value = true
    const result = await getMiningRightDetail(id.value)
    detail.value = result.detail
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '矿权详情加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="trade-page">
    <RouterLink to="/channel/mining-rights" class="back-link">返回矿权交易</RouterLink>

    <section class="container detail-layout">
      <article class="panel mining-detail">
        <div v-if="loading" class="trade-empty">详情加载中...</div>
        <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
        <template v-else-if="detail">
          <div class="mining-card-tags">
            <span>{{ detail.listing_type === 'mining_right_buy' ? '求购' : '转让' }}</span>
            <span>{{ detail.right_type || '矿权' }}</span>
            <span>{{ detail.mine_cat_name || detail.mine_type || '矿种待定' }}</span>
          </div>
          <h1>{{ detail.title }}</h1>
          <p class="detail-summary">{{ detail.summary }}</p>

          <dl class="detail-facts">
            <div>
              <dt>矿区位置</dt>
              <dd>{{ detail.location || '待补充' }}</dd>
            </div>
            <div>
              <dt>资源储量</dt>
              <dd>{{ detail.resource_amount || '详询' }}</dd>
            </div>
            <div>
              <dt>价格</dt>
              <dd>{{ priceText(detail) }}</dd>
            </div>
            <div>
              <dt>发布时间</dt>
              <dd>{{ detail.published_at || '-' }}</dd>
            </div>
          </dl>

          <section class="detail-content">
            <h2>项目详情</h2>
            <p>{{ detail.content }}</p>
          </section>
        </template>
      </article>

      <aside v-if="detail" class="panel contact-card">
        <strong>联系项目方</strong>
        <p>{{ detail.company_name || '企业名称待补充' }}</p>
        <div>
          <span>联系人</span>
          <b>{{ detail.contact_name || '待补充' }}</b>
        </div>
        <div>
          <span>联系电话</span>
          <b>{{ detail.contact_phone || '待补充' }}</b>
        </div>
      </aside>
    </section>
  </main>
</template>
