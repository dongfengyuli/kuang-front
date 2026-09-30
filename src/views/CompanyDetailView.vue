<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getRecommendedCompanyDetail, type RecommendedCompanyDetail } from '../services/recommendedCompanies'

const route = useRoute()
const detail = ref<RecommendedCompanyDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const id = computed(() => Number(route.params.id))

async function loadDetail() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getRecommendedCompanyDetail(id.value)
    detail.value = result.detail
  } catch (error) {
    detail.value = null
    errorMessage.value = error instanceof Error ? error.message : '企业详情加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
watch(() => route.params.id, loadDetail)
</script>

<template>
  <main class="trade-page company-detail-page">
    <RouterLink to="/channel/companies" class="back-link">返回推荐企业</RouterLink>

    <section class="container detail-layout">
      <article class="panel mining-detail company-detail-main">
        <div v-if="loading" class="trade-empty">企业详情加载中...</div>
        <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>
        <template v-else-if="detail">
          <div class="company-detail-head">
            <img :src="detail.logo || detail.cover" :alt="detail.name" />
            <div>
              <div class="mining-card-tags">
                <span v-if="detail.business_type">{{ detail.business_type }}</span>
                <span v-for="tag in detail.tags" :key="tag">{{ tag }}</span>
              </div>
              <h1>{{ detail.name }}</h1>
              <p class="detail-summary">{{ detail.summary }}</p>
            </div>
          </div>

          <dl class="detail-facts">
            <div>
              <dt>主营产品</dt>
              <dd>{{ detail.products || '-' }}</dd>
            </div>
            <div>
              <dt>所在地区</dt>
              <dd>{{ detail.region || '-' }}</dd>
            </div>
            <div>
              <dt>企业官网</dt>
              <dd>
                <a v-if="detail.website" :href="detail.website" target="_blank" rel="noopener noreferrer">访问官网</a>
                <span v-else>-</span>
              </dd>
            </div>
            <div>
              <dt>浏览量</dt>
              <dd>{{ detail.view_count }}</dd>
            </div>
          </dl>

          <div class="detail-content">
            <h2>企业介绍</h2>
            <p>{{ detail.intro || detail.summary }}</p>
          </div>
        </template>
      </article>

      <aside v-if="detail" class="contact-card panel">
        <h3>联系方式</h3>
        <dl class="detail-facts company-contact-facts">
          <div>
            <dt>联系人</dt>
            <dd>{{ detail.contact_name || '-' }}</dd>
          </div>
          <div>
            <dt>联系电话</dt>
            <dd>{{ detail.contact_phone || '-' }}</dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd>{{ detail.address || '-' }}</dd>
          </div>
        </dl>
      </aside>
    </section>
  </main>
</template>
