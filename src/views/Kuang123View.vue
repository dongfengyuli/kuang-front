<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import SiteFooter from '../components/SiteFooter.vue'
import { footerTools, navItems } from '../data/home'
import { getKuang123List, type Kuang123Group, type Kuang123Site } from '../services/kuang123'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const groups = ref<Kuang123Group[]>([])
const loading = ref(false)
const errorMessage = ref('')
const filters = reactive({
  keyword: '',
})

const hasSites = computed(() => groups.value.some((group) => group.sites.length > 0))
const recommendSites = computed(() =>
  groups.value
    .flatMap((group) => group.sites)
    .filter((site) => site.is_recommend === 1)
    .slice(0, 12),
)
const categoryNav = computed(() => groups.value.map((group) => group.category))

function normalizeHref(href: string) {
  if (!href) {
    return '#'
  }

  return /^https?:\/\//i.test(href) ? href : `https://${href}`
}

function siteInitial(site: Kuang123Site) {
  return site.name.slice(0, 1)
}

function scrollToCategory(code: string) {
  document.querySelector(`#kuang123-${code}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function fetchGroups() {
  try {
    loading.value = true
    errorMessage.value = ''
    const result = await getKuang123List({ keyword: filters.keyword, limit: 400 })
    groups.value = result.groups || []
  } catch (error) {
    groups.value = []
    errorMessage.value = error instanceof Error ? error.message : '矿123 数据加载失败'
  } finally {
    loading.value = false
  }
}

function submitSearch() {
  fetchGroups()
}

onMounted(fetchGroups)
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <div class="container topbar-inner">
        <span>收藏本站</span>
        <div class="topbar-actions">
          <template v-if="authStore.isLoggedIn">
            <span>欢迎，{{ authStore.user?.user_name || authStore.user?.email }}</span>
            <button type="button" @click="authStore.logout">退出</button>
          </template>
          <template v-else>
            <RouterLink to="/login">登录</RouterLink>
            <RouterLink to="/register">免费注册</RouterLink>
          </template>
        </div>
      </div>
    </header>

    <nav class="site-nav">
      <div class="container nav-inner">
        <RouterLink to="/" class="brand">
          <span class="brand-mark">
            <span class="brand-badge-star"></span>
            <span class="brand-badge-mountains"></span>
            <span class="brand-badge-tools"></span>
          </span>
          <span>
            <strong>懂矿帝</strong>
            <small>矿业信息与交易服务</small>
          </span>
        </RouterLink>
        <div class="nav-links">
          <RouterLink v-for="item in navItems" :key="item.label" :to="item.path">
            {{ item.label }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <main class="kuang123-page kuang123-hao">
      <section class="kuang123-hero-strip">
        <div class="container kuang123-hero-inner">
          <div>
            <p class="eyebrow">KUANG 123</p>
            <h1>矿业网址大全</h1>
            <p>矿业门户、矿权交易、矿产品行情、矿山设备、二手设备、冶金有色等常用网站，一站式分类直达。</p>
          </div>
          <form class="kuang123-search" @submit.prevent="submitSearch">
            <input v-model.trim="filters.keyword" type="search" placeholder="搜索网站名称、分类或标签" />
            <button type="submit">搜索</button>
          </form>
        </div>
      </section>

      <section class="container kuang123-section">
        <section class="kuang123-quick panel">
          <strong>推荐直达</strong>
          <div>
            <a
              v-for="site in recommendSites"
              :key="`recommend-${site.id}`"
              :href="normalizeHref(site.url)"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ site.name }}
            </a>
          </div>
        </section>

        <section class="kuang123-category-bar panel">
          <button
            v-for="category in categoryNav"
            :key="category.code"
            type="button"
            @click="scrollToCategory(category.code)"
          >
            {{ category.name }}
          </button>
        </section>

        <div v-if="loading" class="kuang123-state panel">矿业网站导航加载中...</div>
        <div v-else-if="errorMessage" class="kuang123-state panel">{{ errorMessage }}</div>
        <div v-else-if="!hasSites" class="kuang123-state panel">暂无网站导航数据</div>

        <div v-else class="kuang123-zones">
          <article
            v-for="group in groups"
            :id="`kuang123-${group.category.code}`"
            :key="group.category.code"
            class="kuang123-zone panel"
          >
            <div class="kuang123-zone-heading">
              <small>{{ group.category.icon || '导航' }}</small>
              <strong>{{ group.category.name }}</strong>
              <p>{{ group.category.description }}</p>
            </div>
            <div class="site-link-grid">
              <a
                v-for="site in group.sites"
                :key="site.id"
                :href="normalizeHref(site.url)"
                target="_blank"
                rel="noopener noreferrer"
                class="site-link"
                :title="site.description || site.name"
              >
                <span class="site-link-icon">{{ siteInitial(site) }}</span>
                <strong>{{ site.name }}</strong>
                <small>{{ site.description || site.tags.slice(0, 2).join(' / ') }}</small>
              </a>
            </div>
          </article>
        </div>

        <section class="kuang123-tools panel">
          <div class="kuang123-zone-heading">
            <small>工具</small>
            <strong>实用工具</strong>
            <p>常用查询、地图、翻译、汇率、专利、合同等外部工具。</p>
          </div>
          <div class="kuang123-tool-grid">
            <a v-for="tool in footerTools" :key="tool.label" :href="tool.href" target="_blank" rel="noopener noreferrer">
              {{ tool.label }}
            </a>
          </div>
        </section>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
