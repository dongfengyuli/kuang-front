<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAdminAuthStore } from '../../stores/adminAuth'

const route = useRoute()
const router = useRouter()
const adminAuthStore = useAdminAuthStore()
const loading = ref(false)
const message = ref('')

const form = reactive({
  user_name: '',
  password: '',
})

async function handleLogin() {
  message.value = ''

  if (!form.user_name || !form.password) {
    message.value = '请输入后台用户名和密码'
    return
  }

  try {
    loading.value = true
    await adminAuthStore.login(form)
    router.push(String(route.query.redirect || '/admin/equipment'))
  } catch (error) {
    message.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="admin-login-page">
    <section class="admin-login-card">
      <RouterLink to="/" class="auth-back">返回首页</RouterLink>
      <div class="auth-heading">
        <p class="eyebrow">ADMIN LOGIN</p>
        <h1>后台登录</h1>
        <p>登录后可维护矿山设备发布、询盘和推荐企业。</p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label class="auth-field">
          <span>用户名</span>
          <input v-model.trim="form.user_name" type="text" autocomplete="username" placeholder="请输入后台用户名" />
        </label>
        <label class="auth-field">
          <span>密码</span>
          <input v-model.trim="form.password" type="password" autocomplete="current-password" placeholder="请输入密码" />
        </label>
        <p v-if="message" class="auth-error">{{ message }}</p>
        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录后台' }}
        </button>
      </form>
    </section>
  </main>
</template>
