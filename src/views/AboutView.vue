<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import SiteFooter from '../components/SiteFooter.vue'
import { aboutGroups, aboutPages, getAboutPage } from '../data/about'

const route = useRoute()
const page = computed(() => getAboutPage(String(route.params.page || 'intro')))

const groupedPages = computed(() =>
  aboutGroups.map((group) => ({
    ...group,
    items: aboutPages.filter((item) => item.group === group.key),
  })),
)
</script>

<template>
  <div class="page">
    <main class="about-page">
      <RouterLink to="/" class="back-link">返回首页</RouterLink>

      <section class="container about-layout">
        <aside class="panel about-nav">
          <div v-for="group in groupedPages" :key="group.key" class="about-nav-group">
            <h2>{{ group.title }}</h2>
            <RouterLink
              v-for="item in group.items"
              :key="item.key"
              :to="`/about/${item.key}`"
              :class="{ active: page.key === item.key }"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </aside>

        <article class="panel about-content">
          <p class="eyebrow">懂矿帝</p>
          <h1>{{ page.title }}</h1>
          <p v-for="(text, index) in page.paragraphs" :key="`p-${index}`">{{ text }}</p>
          <ul v-if="page.bullets?.length">
            <li v-for="(item, index) in page.bullets" :key="`b-${index}`">{{ item }}</li>
          </ul>
          <div v-if="page.notes?.length" class="about-notes">
            <p v-for="(note, index) in page.notes" :key="`n-${index}`">{{ note }}</p>
          </div>
        </article>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
