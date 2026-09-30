<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  createAdminOreBaike,
  getAdminOreBaikeDetail,
  updateAdminOreBaike,
  type AdminOreBaikeSavePayload,
} from '../../services/admin/oreBaike'

const route = useRoute()
const router = useRouter()
const articleId = computed(() => Number(route.params.id || 0))
const isEdit = computed(() => articleId.value > 0)

const form = reactive<AdminOreBaikeSavePayload>({
  title: '',
  summary: '',
  cover: '',
  content: '',
  tags: [],
  author: '懂矿帝编辑',
  source_type: 'manual',
  source_site: 'admin',
  source_id: '',
  source_url: '',
  source_name: '懂矿帝后台',
  is_recommend: false,
  sort: 0,
  status: 1,
  published_at: '',
})

const tagsText = ref('')
const message = ref('')
const saving = ref(false)

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

async function loadDetail() {
  if (!isEdit.value) {
    return
  }
  const result = await getAdminOreBaikeDetail(articleId.value)
  const detail = result.detail
  Object.assign(form, {
    id: detail.id,
    title: detail.title || '',
    summary: detail.summary || '',
    cover: detail.cover || '',
    content: detail.content || '',
    tags: detail.tags || [],
    author: detail.author || '懂矿帝编辑',
    source_type: detail.source_type || 'manual',
    source_site: detail.source_site || 'admin',
    source_id: detail.source_id || '',
    source_url: detail.source_url || '',
    source_name: detail.source_name || '懂矿帝后台',
    is_recommend: Boolean(detail.is_recommend),
    sort: detail.sort || 0,
    status: detail.status ?? 1,
    published_at: detail.published_at || '',
  })
  tagsText.value = form.tags.join('\n')
}

async function save() {
  message.value = ''
  if (!form.title || !form.content) {
    message.value = '请填写百科标题和正文'
    return
  }

  const payload: AdminOreBaikeSavePayload = {
    ...form,
    id: isEdit.value ? articleId.value : undefined,
    tags: splitLines(tagsText.value),
  }

  try {
    saving.value = true
    if (isEdit.value) {
      await updateAdminOreBaike(payload)
      message.value = '百科文章已更新'
    } else {
      await createAdminOreBaike(payload)
      message.value = '百科文章已发布'
      router.push('/admin/ore-baike')
    }
  } catch (error) {
    message.value = error instanceof Error ? error.message : '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

onMounted(loadDetail)
</script>

<template>
  <section class="admin-panel">
    <div class="admin-section-title">
      <div>
        <h2>{{ isEdit ? '编辑矿业百科' : '发布矿业百科' }}</h2>
        <p>后台添加的文章默认标记为 manual；爬虫文章可保留 crawler 来源并人工修订。</p>
      </div>
    </div>

    <form class="admin-form" @submit.prevent="save">
      <label class="admin-form-wide">
        <span>标题</span>
        <input v-model.trim="form.title" type="text" placeholder="如 长石的矿物特征与工业用途" />
      </label>
      <label class="admin-form-wide">
        <span>摘要</span>
        <textarea v-model.trim="form.summary" placeholder="列表页展示摘要；不填时后端会从正文截取"></textarea>
      </label>
      <label>
        <span>封面图</span>
        <input v-model.trim="form.cover" type="url" placeholder="图片 URL" />
      </label>
      <label>
        <span>作者/编辑</span>
        <input v-model.trim="form.author" type="text" placeholder="懂矿帝编辑" />
      </label>
      <label>
        <span>来源类型</span>
        <select v-model="form.source_type">
          <option value="manual">后台添加</option>
          <option value="crawler">爬虫采集</option>
        </select>
      </label>
      <label>
        <span>来源站点</span>
        <input v-model.trim="form.source_site" type="text" placeholder="admin / 51ore / other_site" />
      </label>
      <label>
        <span>来源 ID</span>
        <input v-model.trim="form.source_id" type="text" placeholder="后台新增可留空，爬虫建议填写原站唯一ID" />
      </label>
      <label>
        <span>来源名称</span>
        <input v-model.trim="form.source_name" type="text" placeholder="懂矿帝后台 / 矿材网" />
      </label>
      <label class="admin-form-wide">
        <span>来源 URL</span>
        <input v-model.trim="form.source_url" type="url" placeholder="原文链接，可为空" />
      </label>
      <label>
        <span>标签</span>
        <textarea v-model.trim="tagsText" placeholder="一行一个，如：长石"></textarea>
      </label>
      <label>
        <span>发布时间</span>
        <input v-model.trim="form.published_at" type="text" placeholder="2026-05-17 10:00" />
      </label>
      <label>
        <span>排序</span>
        <input v-model.number="form.sort" type="number" placeholder="数字越大越靠前" />
      </label>
      <label>
        <span>状态</span>
        <select v-model.number="form.status">
          <option :value="1">上架</option>
          <option :value="0">下架</option>
        </select>
      </label>
      <label class="admin-checkbox">
        <input v-model="form.is_recommend" type="checkbox" />
        <span>推荐到前台</span>
      </label>
      <label class="admin-form-wide">
        <span>正文 HTML</span>
        <textarea
          v-model.trim="form.content"
          class="admin-large-textarea"
          placeholder="支持 HTML，例如：<p>长石是重要的造岩矿物...</p>"
        ></textarea>
      </label>

      <div class="admin-form-actions">
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        <RouterLink to="/admin/ore-baike">返回列表</RouterLink>
        <p v-if="message">{{ message }}</p>
      </div>
    </form>
  </section>
</template>
