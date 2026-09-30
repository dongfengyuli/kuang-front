<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  createAdminMiningNews,
  getAdminMiningNewsDetail,
  updateAdminMiningNews,
  type AdminMiningNewsSavePayload,
} from '../../services/admin/miningNews'

const route = useRoute()
const router = useRouter()
const newsId = computed(() => Number(route.params.id || 0))
const isEdit = computed(() => newsId.value > 0)

const form = reactive<AdminMiningNewsSavePayload>({
  category: 'domestic',
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
  is_hot: false,
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
  const result = await getAdminMiningNewsDetail(newsId.value)
  const detail = result.detail
  Object.assign(form, {
    id: detail.id,
    category: detail.category || 'domestic',
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
    is_hot: Boolean(detail.is_hot),
    sort: detail.sort || 0,
    status: detail.status ?? 1,
    published_at: detail.published_at || '',
  })
  tagsText.value = form.tags.join('\n')
}

async function save() {
  message.value = ''
  if (!form.title || !form.content) {
    message.value = '请填写资讯标题和正文'
    return
  }

  const payload: AdminMiningNewsSavePayload = {
    ...form,
    id: isEdit.value ? newsId.value : undefined,
    tags: splitLines(tagsText.value),
  }

  try {
    saving.value = true
    if (isEdit.value) {
      await updateAdminMiningNews(payload)
      message.value = '矿业资讯已更新'
    } else {
      await createAdminMiningNews(payload)
      message.value = '矿业资讯已发布'
      router.push('/admin/mining-news')
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
        <h2>{{ isEdit ? '编辑矿业资讯' : '发布矿业资讯' }}</h2>
        <p>后台添加默认为 manual；爬虫同步的数据可保留 crawler 来源并人工修订。</p>
      </div>
    </div>

    <form class="admin-form" @submit.prevent="save">
      <label>
        <span>资讯分类</span>
        <select v-model="form.category">
          <option value="domestic">国内资讯</option>
          <option value="international">国外资讯</option>
        </select>
      </label>
      <label>
        <span>标题</span>
        <input v-model.trim="form.title" type="text" placeholder="如 全球铜矿项目投资热度继续提升" />
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
        <input v-model.trim="form.source_site" type="text" placeholder="admin / 51ore / carrymine" />
      </label>
      <label>
        <span>来源 ID</span>
        <input v-model.trim="form.source_id" type="text" placeholder="后台新增可留空，爬虫建议填写原站唯一ID" />
      </label>
      <label>
        <span>来源名称</span>
        <input v-model.trim="form.source_name" type="text" placeholder="懂矿帝后台 / 矿材网 / CarryMine" />
      </label>
      <label class="admin-form-wide">
        <span>来源 URL</span>
        <input v-model.trim="form.source_url" type="url" placeholder="原文链接，可为空" />
      </label>
      <label>
        <span>标签</span>
        <textarea v-model.trim="tagsText" placeholder="一行一个，如：绿色矿山"></textarea>
      </label>
      <label>
        <span>发布时间</span>
        <input v-model.trim="form.published_at" type="text" placeholder="2026-05-18 10:00" />
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
      <label class="admin-checkbox">
        <input v-model="form.is_hot" type="checkbox" />
        <span>标记热门</span>
      </label>
      <label class="admin-form-wide">
        <span>正文 HTML</span>
        <textarea
          v-model.trim="form.content"
          class="admin-large-textarea"
          placeholder="支持 HTML，例如：<p>矿业资讯正文...</p>"
        ></textarea>
      </label>

      <div class="admin-form-actions">
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        <RouterLink to="/admin/mining-news">返回列表</RouterLink>
        <p v-if="message">{{ message }}</p>
      </div>
    </form>
  </section>
</template>
