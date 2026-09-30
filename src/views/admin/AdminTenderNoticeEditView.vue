<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  createAdminTenderNotice,
  getAdminTenderNoticeDetail,
  updateAdminTenderNotice,
  type AdminTenderNoticeSavePayload,
} from '../../services/admin/tenders'

const route = useRoute()
const router = useRouter()
const noticeId = computed(() => Number(route.params.id || 0))
const isEdit = computed(() => noticeId.value > 0)

const form = reactive<AdminTenderNoticeSavePayload>({
  notice_type: '招标公告',
  project_type: '工程服务',
  region: '',
  title: '',
  summary: '',
  content: '',
  tags: [],
  publisher: '',
  agency: '',
  contact_name: '',
  contact_phone: '',
  budget: '',
  deadline_at: '',
  open_at: '',
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
  const result = await getAdminTenderNoticeDetail(noticeId.value)
  const detail = result.detail
  Object.assign(form, {
    id: detail.id,
    notice_type: detail.notice_type || '招标公告',
    project_type: detail.project_type || '工程服务',
    region: detail.region || '',
    title: detail.title || '',
    summary: detail.summary || '',
    content: detail.content || '',
    tags: detail.tags || [],
    publisher: detail.publisher || '',
    agency: detail.agency || '',
    contact_name: detail.contact_name || '',
    contact_phone: detail.contact_phone || '',
    budget: detail.budget || '',
    deadline_at: detail.deadline_at || '',
    open_at: detail.open_at || '',
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
    message.value = '请填写公告标题和正文'
    return
  }

  const payload: AdminTenderNoticeSavePayload = {
    ...form,
    id: isEdit.value ? noticeId.value : undefined,
    tags: splitLines(tagsText.value),
  }

  try {
    saving.value = true
    if (isEdit.value) {
      await updateAdminTenderNotice(payload)
      message.value = '招标公告已更新'
    } else {
      await createAdminTenderNotice(payload)
      message.value = '招标公告已发布'
      router.push('/admin/tenders')
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
        <h2>{{ isEdit ? '编辑招标公告' : '发布招标公告' }}</h2>
        <p>支持招标公告、采购公告、中标公示和变更公告；爬虫来源可保留原站信息并人工修订。</p>
      </div>
    </div>

    <form class="admin-form" @submit.prevent="save">
      <label>
        <span>公告类型</span>
        <select v-model="form.notice_type">
          <option>招标公告</option>
          <option>采购公告</option>
          <option>中标公示</option>
          <option>变更公告</option>
        </select>
      </label>
      <label>
        <span>项目类型</span>
        <select v-model="form.project_type">
          <option>采矿工程</option>
          <option>设备采购</option>
          <option>勘查服务</option>
          <option>生态修复</option>
          <option>智慧矿山</option>
          <option>工程服务</option>
        </select>
      </label>
      <label class="admin-form-wide">
        <span>标题</span>
        <input v-model.trim="form.title" type="text" placeholder="如 某矿山井巷施工招标公告" />
      </label>
      <label>
        <span>项目地区</span>
        <input v-model.trim="form.region" type="text" placeholder="内蒙古 赤峰" />
      </label>
      <label>
        <span>预算/金额</span>
        <input v-model.trim="form.budget" type="text" placeholder="约 320 万元 / 详见公告" />
      </label>
      <label>
        <span>招标人/采购人</span>
        <input v-model.trim="form.publisher" type="text" placeholder="企业或单位名称" />
      </label>
      <label>
        <span>招标代理</span>
        <input v-model.trim="form.agency" type="text" placeholder="代理机构，可为空" />
      </label>
      <label>
        <span>联系人</span>
        <input v-model.trim="form.contact_name" type="text" placeholder="联系人" />
      </label>
      <label>
        <span>联系方式</span>
        <input v-model.trim="form.contact_phone" type="text" placeholder="电话 / 邮箱" />
      </label>
      <label>
        <span>截止时间</span>
        <input v-model.trim="form.deadline_at" type="text" placeholder="2026-05-28 17:00" />
      </label>
      <label>
        <span>开标时间</span>
        <input v-model.trim="form.open_at" type="text" placeholder="2026-05-31 09:30" />
      </label>
      <label class="admin-form-wide">
        <span>摘要</span>
        <textarea v-model.trim="form.summary" placeholder="列表页展示摘要；不填时后端会从正文截取"></textarea>
      </label>
      <label>
        <span>标签</span>
        <textarea v-model.trim="tagsText" placeholder="一行一个，如：设备采购"></textarea>
      </label>
      <label>
        <span>发布时间</span>
        <input v-model.trim="form.published_at" type="text" placeholder="2026-05-18 10:00" />
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
        <input v-model.trim="form.source_site" type="text" placeholder="admin / carrymine / ksztb" />
      </label>
      <label>
        <span>来源 ID</span>
        <input v-model.trim="form.source_id" type="text" placeholder="后台新增可留空" />
      </label>
      <label>
        <span>来源名称</span>
        <input v-model.trim="form.source_name" type="text" placeholder="懂矿帝后台" />
      </label>
      <label class="admin-form-wide">
        <span>来源 URL</span>
        <input v-model.trim="form.source_url" type="url" placeholder="原文链接，可为空" />
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
          placeholder="支持 HTML，例如：<p>招标范围、投标人资格、文件获取方式...</p>"
        ></textarea>
      </label>

      <div class="admin-form-actions">
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        <RouterLink to="/admin/tenders">返回列表</RouterLink>
        <p v-if="message">{{ message }}</p>
      </div>
    </form>
  </section>
</template>
