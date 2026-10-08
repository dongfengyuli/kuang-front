<script setup lang="ts">
import { RouterLink } from 'vue-router'

const aboutLinks = [
  { label: '网站介绍', path: '/about/intro' },
  { label: '法律声明', path: '/about/legal' },
  { label: '服务条款', path: '/about/terms' },
  { label: '汇款方式', path: '/about/payment' },
  { label: '服务电话', path: '/about/phone' },
]

const memberLinks = [
  { label: '会员收费标准', path: '/about/member-fee' },
  { label: '会员服务事项', path: '/about/member-service' },
]

const adLinks = [
  { label: '首页收费标准', path: '/about/ad-home' },
  { label: '二级页面收费标准', path: '/about/ad-channel' },
]

const sitemapLinks = [
  { label: '矿权交易', path: '/channel/mining-rights' },
  { label: '矿山设备', path: '/channel/equipment' },
  { label: '二手设备交易', path: '/channel/used-equip' },
  { label: '矿产品交易', path: '/channel/products' },
  { label: '矿业资讯', path: '/news' },
  { label: '矿业百科', path: '/baike' },
  { label: '招标公告', path: '/channel/tenders' },
]

const wechatQrUrl = '/kuang_static_resources/pic/wechat-official-qr.jpg'
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer-main">
      <div class="site-footer-col">
        <h3>关于我们</h3>
        <div class="site-footer-links">
          <RouterLink v-for="item in aboutLinks" :key="item.label" :to="item.path">
            {{ item.label }}
          </RouterLink>
        </div>
      </div>

      <div class="site-footer-col">
        <h3>会员服务</h3>
        <div class="site-footer-links">
          <RouterLink v-for="item in memberLinks" :key="item.label" :to="item.path">
            {{ item.label }}
          </RouterLink>
        </div>
      </div>

      <div class="site-footer-col">
        <h3>广告服务</h3>
        <div class="site-footer-links">
          <RouterLink v-for="item in adLinks" :key="item.label" :to="item.path">
            {{ item.label }}
          </RouterLink>
        </div>
      </div>

      <div class="site-footer-col site-footer-contact">
        <h3>联系我们</h3>
        <p><span>联系电话：</span>400-000-0000</p>
        <p><span>服务热线：</span>18311219160</p>
        <p><span>公司网址：</span>www.dongkuangdi.com</p>
        <p><span>公司地址：</span>江苏省苏州市吴江区MAX科技园</p>
        <p class="site-footer-brand">懂矿帝 · 矿业信息门户</p>
      </div>

      <div class="site-footer-col site-footer-qr">
        <h3>扫一扫关注公众号</h3>
        <div class="site-footer-qr-box">
          <img
            :src="wechatQrUrl"
            alt="懂矿帝微信公众号二维码"
            width="118"
            height="118"
          />
        </div>
        <p>微信公众号：懂矿帝</p>
      </div>
    </div>

    <div class="site-footer-sitemap">
      <div class="container">
        <strong>网站地图</strong>
        <nav>
          <RouterLink v-for="item in sitemapLinks" :key="item.label" :to="item.path">
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </div>

    <div class="site-footer-copy">
      <div class="container">
        <p>Copyright © 2026 懂矿帝 All Rights Reserved.</p>
        <p>地址：江苏省苏州市吴江区MAX科技园</p>
      </div>
    </div>
  </footer>
</template>
