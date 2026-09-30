<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getOreBaikeDetail, type OreBaikeDetail } from '../services/oreBaike'

const route = useRoute()
const detail = ref<OreBaikeDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const id = computed(() => Number(route.params.id))

async function loadDetail() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getOreBaikeDetail(id.value)
    detail.value = result.detail
  } catch (error) {
    detail.value = null
    errorMessage.value = error instanceof Error ? error.message : '百科详情加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
watch(() => route.params.id, loadDetail)
</script>

<template>
  <main class="trade-page baike-detail-page">
    <RouterLink to="/baike" class="back-link">返回矿业百科</RouterLink>

    <section class="container baike-detail-layout">
      <article class="panel baike-detail-main">
        <div v-if="loading" class="trade-empty">百科详情加载中...</div>
        <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
        <template v-else-if="detail">
          <div class="mining-card-tags">
            <span v-for="tag in detail.tags" :key="tag">{{ tag }}</span>
          </div>
          <h1>{{ detail.title }}</h1>
          <div class="baike-detail-meta">
            <span>{{ detail.source_name || '矿业百科' }}</span>
            <span>{{ detail.published_at || '-' }}</span>
            <span>{{ detail.view_count }} 次浏览</span>
          </div>
          <p class="detail-summary">{{ detail.summary }}</p>
          <div class="baike-rich-content" v-html="detail.content"></div>
        </template>
      </article>

      <aside v-if="detail" class="equipment-sidebar">
        <section class="panel baike-side-card">
          <div class="section-title compact">
            <span>相关百科</span>
          </div>
          <RouterLink v-for="item in detail.related" :key="item.id" :to="`/baike/${item.id}`">
            <strong>{{ item.title }}</strong>
            <span>{{ item.published_at || '-' }} · {{ item.view_count }} 次浏览</span>
          </RouterLink>
          <div v-if="detail.related.length === 0" class="trade-empty">暂无相关百科</div>
        </section>
      </aside>
    </section>
  </main>
</template>
