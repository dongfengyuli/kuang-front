import { createRouter, createWebHistory } from 'vue-router'
import { useAdminAuthStore } from '../stores/adminAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/kuang123',
      name: 'kuang123',
      component: () => import('../views/Kuang123View.vue'),
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue'),
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAdminAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/equipment',
        },
        {
          path: 'equipment',
          name: 'admin-equipment',
          component: () => import('../views/admin/AdminEquipmentListView.vue'),
        },
        {
          path: 'equipment/create',
          name: 'admin-equipment-create',
          component: () => import('../views/admin/AdminEquipmentEditView.vue'),
        },
        {
          path: 'equipment/:id/edit',
          name: 'admin-equipment-edit',
          component: () => import('../views/admin/AdminEquipmentEditView.vue'),
        },
        {
          path: 'equipment/inquiries',
          name: 'admin-equipment-inquiries',
          component: () => import('../views/admin/AdminEquipmentInquiriesView.vue'),
        },
        {
          path: 'equipment/companies',
          name: 'admin-equipment-companies',
          component: () => import('../views/admin/AdminEquipmentCompaniesView.vue'),
        },
        {
          path: 'kuang123',
          name: 'admin-kuang123',
          component: () => import('../views/admin/AdminKuang123ListView.vue'),
        },
        {
          path: 'kuang123/create',
          name: 'admin-kuang123-create',
          component: () => import('../views/admin/AdminKuang123EditView.vue'),
        },
        {
          path: 'kuang123/:id/edit',
          name: 'admin-kuang123-edit',
          component: () => import('../views/admin/AdminKuang123EditView.vue'),
        },
        {
          path: 'recommended-companies',
          name: 'admin-recommended-companies',
          component: () => import('../views/admin/AdminRecommendedCompanyListView.vue'),
        },
        {
          path: 'recommended-companies/create',
          name: 'admin-recommended-companies-create',
          component: () => import('../views/admin/AdminRecommendedCompanyEditView.vue'),
        },
        {
          path: 'recommended-companies/:id/edit',
          name: 'admin-recommended-companies-edit',
          component: () => import('../views/admin/AdminRecommendedCompanyEditView.vue'),
        },
        {
          path: 'ore-baike',
          name: 'admin-ore-baike',
          component: () => import('../views/admin/AdminOreBaikeListView.vue'),
        },
        {
          path: 'ore-baike/create',
          name: 'admin-ore-baike-create',
          component: () => import('../views/admin/AdminOreBaikeEditView.vue'),
        },
        {
          path: 'ore-baike/:id/edit',
          name: 'admin-ore-baike-edit',
          component: () => import('../views/admin/AdminOreBaikeEditView.vue'),
        },
        {
          path: 'mining-news',
          name: 'admin-mining-news',
          component: () => import('../views/admin/AdminMiningNewsListView.vue'),
        },
        {
          path: 'mining-news/create',
          name: 'admin-mining-news-create',
          component: () => import('../views/admin/AdminMiningNewsEditView.vue'),
        },
        {
          path: 'mining-news/:id/edit',
          name: 'admin-mining-news-edit',
          component: () => import('../views/admin/AdminMiningNewsEditView.vue'),
        },
        {
          path: 'tenders',
          name: 'admin-tenders',
          component: () => import('../views/admin/AdminTenderNoticeListView.vue'),
        },
        {
          path: 'tenders/create',
          name: 'admin-tenders-create',
          component: () => import('../views/admin/AdminTenderNoticeEditView.vue'),
        },
        {
          path: 'tenders/:id/edit',
          name: 'admin-tenders-edit',
          component: () => import('../views/admin/AdminTenderNoticeEditView.vue'),
        },
      ],
    },
    {
      path: '/channel/mining-rights',
      name: 'mining-rights',
      component: () => import('../views/MiningRightsView.vue'),
    },
    {
      path: '/channel/equipment',
      name: 'equipment',
      component: () => import('../views/EquipmentChannelView.vue'),
    },
    {
      path: '/channel/exhibitions',
      name: 'exhibitions',
      component: () => import('../views/ExhibitionsView.vue'),
    },
    {
      path: '/baike',
      name: 'ore-baike',
      component: () => import('../views/OreBaikeView.vue'),
      alias: ['/channel/baike', '/channel/矿业百科', '/channel/矿材百科'],
    },
    {
      path: '/news',
      name: 'mining-news',
      component: () => import('../views/MiningNewsView.vue'),
      alias: ['/channel/news', '/channel/矿业资讯'],
    },
    {
      path: '/channel/products',
      name: 'products',
      component: () => import('../views/ProductsTradeView.vue'),
    },
    {
      path: '/channel/used-equip',
      name: 'used-equip',
      component: () => import('../views/UsedEquipChannelView.vue'),
      alias: ['/channel/geology', '/channel/地质勘查', '/channel/二手设备交易'],
    },
    {
      path: '/used-equip/:id',
      name: 'used-equip-detail',
      component: () => import('../views/UsedEquipDetailView.vue'),
    },
    {
      path: '/channel/companies',
      name: 'companies',
      component: () => import('../views/CompaniesView.vue'),
      alias: ['/companies'],
    },
    {
      path: '/companies/:id',
      name: 'company-detail',
      component: () => import('../views/CompanyDetailView.vue'),
    },
    {
      path: '/trade/mining-rights/:id',
      name: 'mining-right-detail',
      component: () => import('../views/MiningRightDetailView.vue'),
    },
    {
      path: '/exhibitions/:id',
      name: 'exhibition-detail',
      component: () => import('../views/ExhibitionDetailView.vue'),
    },
    {
      path: '/baike/:id',
      name: 'ore-baike-detail',
      component: () => import('../views/OreBaikeDetailView.vue'),
    },
    {
      path: '/news/:id',
      name: 'mining-news-detail',
      component: () => import('../views/MiningNewsDetailView.vue'),
    },
    {
      path: '/channel/tenders',
      name: 'tenders',
      component: () => import('../views/TendersView.vue'),
      alias: ['/tenders', '/channel/招标公告', '/channel/项目招标'],
    },
    {
      path: '/tenders/:id',
      name: 'tender-detail',
      component: () => import('../views/TenderDetailView.vue'),
    },
    {
      path: '/about/:page?',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/channel/:code',
      name: 'channel',
      component: () => import('../views/PlaceholderView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'channel' && ['矿业百科', '矿材百科', 'baike'].includes(String(to.params.code))) {
    return {
      name: 'ore-baike',
      replace: true,
    }
  }

  if (to.name === 'channel' && ['矿业资讯', '国内资讯', '国外资讯', 'news'].includes(String(to.params.code))) {
    return {
      name: 'mining-news',
      query: ['国内资讯', '国外资讯'].includes(String(to.params.code))
        ? { category: String(to.params.code) === '国外资讯' ? 'international' : 'domestic' }
        : undefined,
      replace: true,
    }
  }

  if (to.name === 'channel' && ['招标公告', '项目招标', 'tenders'].includes(String(to.params.code))) {
    return {
      name: 'tenders',
      replace: true,
    }
  }

  if (to.name === 'channel' && ['geology', '地质勘查', '二手设备交易', 'used-equip'].includes(String(to.params.code))) {
    return {
      name: 'used-equip',
      replace: true,
    }
  }

  if (!to.matched.some((record) => record.meta.requiresAdminAuth)) {
    return true
  }

  const adminAuthStore = useAdminAuthStore()

  if (adminAuthStore.isLoggedIn) {
    return true
  }

  return {
    name: 'admin-login',
    query: {
      redirect: to.fullPath,
    },
  }
})

export default router
