<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getTenderNoticeDetail, type TenderNoticeDetail } from '../services/tenders'

const route = useRoute()
const detail = ref<TenderNoticeDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const id = computed(() => Number(route.params.id))

async function loadDetail() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getTenderNoticeDetail(id.value)
    detail.value = result.detail
  } catch (error) {
    detail.value = null
    errorMessage.value = error instanceof Error ? error.message : '公告详情加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
watch(() => route.params.id, loadDetail)
</script>

<template>
  <main class="trade-page baike-detail-page tender-detail-page">
    <RouterLink to="/channel/tenders" class="back-link">返回招标公告</RouterLink>

    <section class="container baike-detail-layout">
      <article class="panel baike-detail-main">
        <div v-if="loading" class="trade-empty">公告详情加载中...</div>
        <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
        <template v-else-if="detail">
          <div class="mining-card-tags">
            <span>{{ detail.notice_type }}</span>
            <span>{{ detail.project_type }}</span>
            <span v-if="detail.region">{{ detail.region }}</span>
            <span v-for="tag in detail.tags" :key="tag">{{ tag }}</span>
          </div>
          <h1>{{ detail.title }}</h1>
          <div class="baike-detail-meta">
            <span>{{ detail.source_name || detail.source_site || '懂矿帝' }}</span>
            <span>{{ detail.published_at || '-' }}</span>
            <span>{{ detail.view_count }} 次浏览</span>
          </div>
          <p class="detail-summary">{{ detail.summary }}</p>
          <div class="tender-facts">
            <span>招标人：{{ detail.publisher || '详见公告' }}</span>
            <span>代理机构：{{ detail.agency || '详见公告' }}</span>
            <span>预算金额：{{ detail.budget || '详见公告' }}</span>
            <span>截止时间：{{ detail.deadline_at || '详见公告' }}</span>
            <span>开标时间：{{ detail.open_at || '详见公告' }}</span>
            <span>联系方式：{{ detail.contact_name || '' }} {{ detail.contact_phone || '详见公告' }}</span>
          </div>
          <div class="baike-rich-content" v-html="detail.content"></div>
        </template>
      </article>

      <aside v-if="detail" class="equipment-sidebar">
        <section class="panel baike-side-card">
          <div class="section-title compact">
            <span>相关公告</span>
          </div>
          <RouterLink v-for="item in detail.related" :key="item.id" :to="`/tenders/${item.id}`">
            <strong>{{ item.title }}</strong>
            <span>{{ item.notice_type }} · {{ item.published_at || '-' }}</span>
          </RouterLink>
          <div v-if="detail.related.length === 0" class="trade-empty">暂无相关公告</div>
        </section>
      </aside>
    </section>
  </main>
</template>
