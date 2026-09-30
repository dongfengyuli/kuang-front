<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAdminAuthStore } from '../../stores/adminAuth'

const adminAuthStore = useAdminAuthStore()
const router = useRouter()

const navItems = [
  { label: '设备管理', path: '/admin/equipment' },
  { label: '发布设备', path: '/admin/equipment/create' },
  { label: '询盘管理', path: '/admin/equipment/inquiries' },
  { label: '推荐企业', path: '/admin/equipment/companies' },
  { label: '矿123导航', path: '/admin/kuang123' },
  { label: '新增网站', path: '/admin/kuang123/create' },
  { label: '首页名企推荐', path: '/admin/recommended-companies' },
  { label: '新增名企', path: '/admin/recommended-companies/create' },
  { label: '矿业资讯', path: '/admin/mining-news' },
  { label: '发布资讯', path: '/admin/mining-news/create' },
  { label: '招标公告', path: '/admin/tenders' },
  { label: '发布公告', path: '/admin/tenders/create' },
  { label: '矿业百科', path: '/admin/ore-baike' },
  { label: '发布百科', path: '/admin/ore-baike/create' },
]

function logout() {
  adminAuthStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <main class="admin-shell">
    <aside class="admin-sidebar">
      <RouterLink to="/" class="admin-brand">
        <span class="brand-mark">
          <span class="brand-badge-star"></span>
          <span class="brand-badge-mountains"></span>
          <span class="brand-badge-tools"></span>
        </span>
        <strong>懂矿帝后台</strong>
      </RouterLink>
      <nav>
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path">
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <section class="admin-main">
      <header class="admin-topbar">
        <div>
          <p class="eyebrow">ADMIN CENTER</p>
          <h1>懂矿帝内容维护</h1>
        </div>
        <div class="admin-topbar-actions">
          <span>管理员：{{ adminAuthStore.user?.user_name || 'admin' }}</span>
          <RouterLink to="/kuang123">查看矿123</RouterLink>
          <button type="button" @click="logout">退出</button>
        </div>
      </header>

      <RouterView />
    </section>
  </main>
</template>
