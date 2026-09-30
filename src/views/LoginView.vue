<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { sendMobileCode } from '../services/auth'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loginMode = ref<'email' | 'mobile'>('email')

const form = reactive({
  email: '',
  password: '',
  mobile: '',
  code: '',
})

const loading = ref(false)
const codeLoading = ref(false)
const errorMessage = ref('')
const codeMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (loginMode.value === 'email') {
    if (!form.email || !form.password) {
      errorMessage.value = '请输入邮箱和密码'
      return
    }
  } else if (!form.mobile || !form.code) {
    errorMessage.value = '请输入手机号和验证码'
    return
  }

  try {
    loading.value = true

    if (loginMode.value === 'email') {
      await authStore.login({
        email: form.email,
        password: form.password,
      })
    } else {
      await authStore.loginByMobile({
        mobile: form.mobile,
        code: form.code,
      })
    }

    router.push('/')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function handleSendCode() {
  errorMessage.value = ''
  codeMessage.value = ''

  if (!form.mobile) {
    errorMessage.value = '请输入手机号'
    return
  }

  try {
    codeLoading.value = true
    const result = await sendMobileCode(form.mobile, 'login')
    codeMessage.value = `验证码已生成：${result.code}`
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '获取验证码失败'
  } finally {
    codeLoading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <RouterLink to="/" class="auth-back">返回首页</RouterLink>

      <div class="auth-heading">
        <p class="eyebrow">用户登录</p>
        <h1>欢迎登录矿业信息平台</h1>
        <p>使用邮箱和密码登录后，可以发布供需、管理企业信息和查看个人中心。</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-tabs">
          <button
            type="button"
            :class="{ active: loginMode === 'email' }"
            @click="loginMode = 'email'"
          >
            邮箱密码登录
          </button>
          <button
            type="button"
            :class="{ active: loginMode === 'mobile' }"
            @click="loginMode = 'mobile'"
          >
            手机验证码登录
          </button>
        </div>

        <template v-if="loginMode === 'email'">
          <label class="auth-field">
            <span>邮箱：</span>
            <input v-model.trim="form.email" type="email" autocomplete="email" placeholder="请输入邮箱" />
          </label>

          <label class="auth-field">
            <span>密码：</span>
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
            />
          </label>
        </template>

        <template v-else>
          <label class="auth-field">
            <span>手机号：</span>
            <input v-model.trim="form.mobile" type="tel" autocomplete="tel" placeholder="请输入手机号" />
          </label>

          <label class="auth-field">
            <span>验证码：</span>
            <span class="code-input">
              <input v-model.trim="form.code" type="text" inputmode="numeric" placeholder="请输入验证码" />
              <button type="button" :disabled="codeLoading" @click="handleSendCode">
                {{ codeLoading ? '获取中...' : '获取验证码' }}
              </button>
            </span>
          </label>
        </template>

        <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>
        <p v-if="codeMessage" class="auth-tip">{{ codeMessage }}</p>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>

        <p class="auth-switch">
          还没有账号？
          <RouterLink to="/register">立即免费注册</RouterLink>
        </p>
      </form>
    </section>
  </main>
</template>
