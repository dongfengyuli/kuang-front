<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const channelName = computed(() => String(route.params.code || 'channel'))
</script>

<template>
  <main class="placeholder-page">
    <RouterLink to="/" class="back-link">返回首页</RouterLink>
    <section>
      <p class="eyebrow">频道建设中</p>
      <h1>{{ channelName }}</h1>
      <p>这里将承载对应栏目的列表页、筛选条件、详情页和发布入口。</p>
    </section>
  </main>
</template>
