<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { exhibitions, type ExhibitionItem, type ExhibitionStatus } from '../data/exhibitions'
import { createExhibitionRegistration, getExhibitionDetail } from '../services/exhibitions'

const route = useRoute()
const activeTab = ref('intro')
const exhibitorKeyword = ref('')
const detail = ref<ExhibitionItem | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const registrationOpen = ref(false)
const registrationSubmitting = ref(false)
const registrationMessage = ref('')
const registrationForm = reactive({
  intent_type: 'visit' as 'visit' | 'exhibit',
  company_name: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  demand: '',
})

const relatedExhibitions = computed(() => {
  if (!detail.value) {
    return []
  }

  return exhibitions
    .filter((item) => item.id !== detail.value?.id && (item.type === detail.value?.type || item.region === detail.value?.region))
    .slice(0, 3)
})

const filteredExhibitors = computed(() => {
  if (!detail.value) {
    return []
  }

  const keyword = exhibitorKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return detail.value.exhibitors
  }

  return detail.value.exhibitors.filter((item) =>
    [item.name, item.booth, item.business, item.type].join(' ').toLowerCase().includes(keyword),
  )
})

const tabs = [
  { label: '展会介绍', value: 'intro' },
  { label: '展商名录', value: 'exhibitors' },
  { label: '同期活动', value: 'activities' },
  { label: '参观指南', value: 'guide' },
  { label: '新闻报道', value: 'reports' },
]

function statusText(status: ExhibitionStatus) {
  return {
    upcoming: '预告',
    ongoing: '进行中',
    ended: '已结束',
  }[status]
}

async function loadDetail() {
  const uuid = String(route.params.id || '')
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getExhibitionDetail(uuid)
    detail.value = result.detail
  } catch (error) {
    detail.value = exhibitions.find((item) => item.id === uuid) || null
    errorMessage.value = detail.value ? '' : error instanceof Error ? error.message : '展会详情加载失败'
  } finally {
    loading.value = false
  }
}

function openRegistration(intentType: 'visit' | 'exhibit') {
  registrationForm.intent_type = intentType
  registrationMessage.value = ''
  registrationOpen.value = true
}

function closeRegistration() {
  registrationOpen.value = false
}

async function submitRegistration() {
  if (!detail.value) {
    return
  }
  registrationMessage.value = ''
  if (!registrationForm.contact_name || !registrationForm.contact_phone) {
    registrationMessage.value = '请填写联系人和联系电话'
    return
  }

  try {
    registrationSubmitting.value = true
    const result = await createExhibitionRegistration({
      uuid: detail.value.id,
      ...registrationForm,
    })
    registrationMessage.value = `提交成功，单号：${result.registration_no}`
    Object.assign(registrationForm, {
      company_name: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      demand: '',
    })
  } catch (error) {
    registrationMessage.value = error instanceof Error ? error.message : '提交失败，请稍后重试'
  } finally {
    registrationSubmitting.value = false
  }
}

onMounted(loadDetail)
watch(() => route.params.id, loadDetail)
</script>

<template>
  <main class="trade-page exhibition-detail-page">
    <RouterLink to="/channel/exhibitions" class="back-link">返回展会列表</RouterLink>

    <div v-if="loading" class="trade-empty">展会详情加载中...</div>
    <div v-else-if="errorMessage" class="trade-empty">{{ errorMessage }}</div>

    <template v-else-if="detail">
      <section class="exhibition-detail-hero" :style="{ background: detail.image }">
        <div class="container exhibition-detail-hero-inner">
          <div class="mining-card-tags">
            <span>{{ statusText(detail.status) }}</span>
            <span>{{ detail.type }}</span>
            <span v-for="tag in detail.tags" :key="tag">{{ tag }}</span>
          </div>
          <h1>{{ detail.title }}</h1>
          <p>{{ detail.summary }}</p>
        </div>
      </section>

      <section class="container exhibition-detail-layout">
        <article class="panel exhibition-detail-main">
          <dl class="exhibition-detail-facts">
            <div>
              <dt>时间</dt>
              <dd>{{ detail.dateRange }}</dd>
            </div>
            <div>
              <dt>地点</dt>
              <dd>{{ detail.city }} · {{ detail.venue }}</dd>
            </div>
            <div>
              <dt>主办</dt>
              <dd>{{ detail.organizer }}</dd>
            </div>
            <div>
              <dt>周期</dt>
              <dd>{{ detail.cycle }}</dd>
            </div>
            <div>
              <dt>规模</dt>
              <dd>{{ detail.scale }}</dd>
            </div>
            <div>
              <dt>热度</dt>
              <dd>{{ detail.heat.toLocaleString() }} 次浏览</dd>
            </div>
          </dl>

          <nav class="exhibition-tabs" aria-label="展会详情">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              :class="{ active: activeTab === tab.value }"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </nav>

          <section v-if="activeTab === 'intro'" class="exhibition-tab-panel">
            <h2>展会介绍</h2>
            <p v-for="paragraph in detail.intro" :key="paragraph">{{ paragraph }}</p>
          </section>

          <section v-else-if="activeTab === 'exhibitors'" class="exhibition-tab-panel">
            <div class="exhibition-tab-heading">
              <h2>展商名录</h2>
              <input v-model.trim="exhibitorKeyword" type="search" placeholder="搜索企业 / 展位号 / 主营" />
            </div>
            <div class="exhibitor-table">
              <article v-for="item in filteredExhibitors" :key="`${item.name}-${item.booth}`">
                <strong>{{ item.name }}</strong>
                <span>{{ item.booth }}</span>
                <p>{{ item.business }}</p>
                <small>{{ item.type }}</small>
              </article>
            </div>
            <div v-if="filteredExhibitors.length === 0" class="trade-empty">暂无匹配展商</div>
          </section>

          <section v-else-if="activeTab === 'activities'" class="exhibition-tab-panel">
            <h2>同期活动</h2>
            <div class="activity-list">
              <article v-for="item in detail.activities" :key="`${item.time}-${item.title}`">
                <time>{{ item.time }}</time>
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.location }}</span>
                </div>
              </article>
            </div>
          </section>

          <section v-else-if="activeTab === 'guide'" class="exhibition-tab-panel">
            <h2>参观指南</h2>
            <dl class="guide-list">
              <div v-for="item in detail.guide" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section v-else class="exhibition-tab-panel">
            <h2>新闻报道</h2>
            <ul class="link-list">
              <li v-for="item in detail.reports" :key="item.title">
                <span>{{ item.title }}</span>
                <small>{{ item.date }}</small>
              </li>
            </ul>
          </section>
        </article>

        <aside class="equipment-sidebar">
          <section class="panel contact-card exhibition-contact-card">
            <strong>展会对接</strong>
            <p>需要展位、名录、论坛票或商务对接，可联系懂矿帝展会顾问。</p>
            <div>
              <span>服务热线</span>
              <b>18748063792</b>
            </div>
            <a href="tel:18748063792">电话咨询</a>
            <button type="button" @click="openRegistration('exhibit')">提交参展需求</button>
          </section>

          <section class="panel exhibition-related">
            <div class="section-title compact">
              <span>相关展会</span>
            </div>
            <RouterLink v-for="item in relatedExhibitions" :key="item.id" :to="`/exhibitions/${item.id}`">
              <strong>{{ item.title }}</strong>
              <span>{{ item.dateRange }} · {{ item.city }}</span>
            </RouterLink>
          </section>
        </aside>
      </section>

      <section class="exhibition-action-dock">
        <div class="container exhibition-action-dock-inner">
          <span>{{ detail.title }}</span>
          <div>
            <button type="button" @click="openRegistration('exhibit')">我要参展</button>
            <button type="button" @click="openRegistration('visit')">我要参观</button>
          </div>
        </div>
      </section>

      <div v-if="registrationOpen" class="inquiry-modal" @click.self="closeRegistration">
        <section class="inquiry-dialog panel">
          <div class="section-title compact">
            <span>{{ registrationForm.intent_type === 'exhibit' ? '我要参展' : '我要参观' }}</span>
            <button type="button" @click="closeRegistration">关闭</button>
          </div>
          <p class="inquiry-target">目标展会：{{ detail.title }}</p>
          <form class="publish-form" @submit.prevent="submitRegistration">
            <select v-model="registrationForm.intent_type">
              <option value="visit">我要参观</option>
              <option value="exhibit">我要参展</option>
            </select>
            <input v-model.trim="registrationForm.company_name" type="text" placeholder="企业名称" />
            <input v-model.trim="registrationForm.contact_name" type="text" placeholder="联系人" />
            <input v-model.trim="registrationForm.contact_phone" type="tel" placeholder="联系电话" />
            <input v-model.trim="registrationForm.contact_email" type="email" placeholder="邮箱（选填）" />
            <textarea v-model.trim="registrationForm.demand" placeholder="需求说明，如展位、名录、论坛票、商务对接"></textarea>
            <button type="submit" :disabled="registrationSubmitting">
              {{ registrationSubmitting ? '提交中...' : '提交需求' }}
            </button>
            <p v-if="registrationMessage">{{ registrationMessage }}</p>
          </form>
        </section>
      </div>
    </template>

    <section v-else class="placeholder-page">
      <section>
        <p class="eyebrow">展会不存在</p>
        <h1>未找到展会</h1>
        <p>请返回展会列表重新选择。</p>
      </section>
    </section>
  </main>
</template>
