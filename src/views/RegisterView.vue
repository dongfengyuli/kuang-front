<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { sendMobileCode } from '../services/auth'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const registerMode = ref<'email' | 'mobile'>('email')

const form = reactive({
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
  mobile: '',
  code: '',
  agreed: false,
})

const loading = ref(false)
const codeLoading = ref(false)
const errorMessage = ref('')
const codeMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.userName || !form.password) {
    errorMessage.value = '请填写用户名和密码'
    return
  }

  if (registerMode.value === 'email' && !form.email) {
    errorMessage.value = '请填写邮箱'
    return
  }

  if (registerMode.value === 'mobile' && (!form.mobile || !form.code)) {
    errorMessage.value = '请填写手机号和验证码'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  if (!form.agreed) {
    errorMessage.value = '请先阅读并同意服务协议'
    return
  }

  try {
    loading.value = true

    if (registerMode.value === 'email') {
      await authStore.register({
        user_name: form.userName,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
      })
    } else {
      await authStore.registerByMobile({
        user_name: form.userName,
        mobile: form.mobile,
        password: form.password,
        code: form.code,
      })
    }

    router.push('/')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '注册失败，请稍后重试'
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
    const result = await sendMobileCode(form.mobile, 'register')
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
    <section class="auth-card register-card">
      <RouterLink to="/" class="auth-back">返回首页</RouterLink>

      <div class="auth-heading">
        <p class="eyebrow">用户注册</p>
        <h1>立即免费注册</h1>
        <p>当前后端用户服务支持邮箱注册，手机号会作为补充联系方式提交。</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-tabs">
          <button
            type="button"
            :class="{ active: registerMode === 'email' }"
            @click="registerMode = 'email'"
          >
            邮箱注册
          </button>
          <button
            type="button"
            :class="{ active: registerMode === 'mobile' }"
            @click="registerMode = 'mobile'"
          >
            手机号注册
          </button>
        </div>

        <label class="auth-field">
          <span>用户名：</span>
          <input v-model.trim="form.userName" type="text" autocomplete="username" />
        </label>

        <label v-if="registerMode === 'email'" class="auth-field">
          <span>邮箱：</span>
          <input v-model.trim="form.email" type="email" autocomplete="email" />
        </label>

        <template v-else>
          <label class="auth-field">
            <span>手机号码：</span>
            <input v-model.trim="form.mobile" type="tel" autocomplete="tel" />
          </label>

          <label class="auth-field">
            <span>验证码：</span>
            <span class="code-input">
              <input v-model.trim="form.code" type="text" inputmode="numeric" />
              <button type="button" :disabled="codeLoading" @click="handleSendCode">
                {{ codeLoading ? '获取中...' : '获取短信验证码' }}
              </button>
            </span>
          </label>
        </template>

        <label class="auth-field">
          <span>密码：</span>
          <input v-model="form.password" type="password" autocomplete="new-password" />
        </label>

        <label class="auth-field">
          <span>确认密码：</span>
          <input v-model="form.confirmPassword" type="password" autocomplete="new-password" />
        </label>

        <label v-if="registerMode === 'email'" class="auth-field">
          <span>手机号码：</span>
          <input v-model.trim="form.mobile" type="tel" autocomplete="tel" />
        </label>

        <label class="auth-agreement">
          <input v-model="form.agreed" type="checkbox" />
          <span>我已阅读并同意中国矿业信息网使用协议及隐私条款</span>
        </label>

        <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>
        <p v-if="codeMessage" class="auth-tip">{{ codeMessage }}</p>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '立即免费注册' }}
        </button>

        <p class="auth-switch">
          已有账号？
          <RouterLink to="/login">去登录</RouterLink>
        </p>
      </form>
    </section>
  </main>
</template>
