<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import CoalToolShell from '../components/CoalToolShell.vue'
import { lines } from '../utils/coal/blending'
import { records, readLocal, recordKey, writeLocal, downloadCSV, type RecordEntry } from '../utils/coal/storage'
document.title='煤源与测算记录 · 懂矿帝'
const entries=ref(records()),message=ref('')
const count=(id:string)=>{const data=readLocal<unknown>(`kuang:coal:sources:v1:${id}`,[]);return Array.isArray(data)?data.length:0}
function remove(entry:RecordEntry){try{const next=entries.value.filter(x=>x.id!==entry.id);writeLocal(recordKey,next);entries.value=next;message.value='已移除该本机记录。'}catch{message.value='删除失败，浏览器存储不可用。'}}
function exportAll(){downloadCSV('懂矿帝测算记录.csv',[['名称','时间','页面','原始输入 JSON','测算输出 JSON'],...entries.value.map(x=>[x.name,x.date,x.path,JSON.stringify(x.input),JSON.stringify(x.output)])])}
</script>
<template><CoalToolShell><section class="container coal-section"><div class="coal-detail-heading"><p class="coal-eyebrow">你的本机工作台</p><h1>煤源与测算记录</h1><p>常用煤源分场景保存，历史测算保留输入与结果，随时回到表单复算。</p></div><div class="coal-note">数据仅保存在当前浏览器，跨设备不共享；清理浏览器数据会清除记录。重要测算请导出备份。最多保留最近 100 条测算。</div><h2>我的煤源库</h2><div class="coal-lines-preview"><RouterLink v-for="l in lines" :key="l.id" :to="`/tools/coal/${l.id}`"><span>{{l.short}}</span><h3>{{count(l.id)}} <small>条煤源</small></h3><p>进入该产品线，点击「载入煤源库」继续编辑。</p><strong>管理煤源 →</strong></RouterLink></div><div class="coal-section-head"><h2>历史测算</h2><button v-if="entries.length" class="coal-btn" @click="exportAll">导出全部记录 CSV</button></div><p v-if="message" class="coal-feedback" role="status">{{message}}</p><div v-if="!entries.length" class="coal-panel coal-empty"><h3>还没有保存的测算</h3><p>在计算工具或配煤报告中点击「保存测算」，即可在这里再次打开。</p><RouterLink class="coal-btn primary" to="/tools">去计算 →</RouterLink></div><div v-else class="coal-records"><article v-for="entry in entries" :key="entry.id" class="coal-panel"><div><h3>{{entry.name}}</h3><p>{{new Date(entry.date).toLocaleString('zh-CN')}}</p></div><div class="coal-actions"><RouterLink class="coal-btn" :to="`${entry.path}?record=${entry.id}`">恢复输入并复算 →</RouterLink><button class="coal-delete" @click="remove(entry)">移除</button></div></article></div></section></CoalToolShell></template>
