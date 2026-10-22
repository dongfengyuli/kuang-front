<script setup lang="ts">
import { computed } from 'vue'
import type { Coal, Line } from '../utils/coal/blending'
const props=defineProps<{coals:Coal[];line:Line}>()
defineEmits<{remove:[id:string]}>()
const fields=computed(()=>[
 {key:'price',label:props.line==='shuimeijiang'?'干煤价':'到厂价',unit:'元/吨'}, {key:'cap',label:'掺入上限',unit:'%'},
 ...(props.line==='jiaomei'?[]:[{key:'q',label:props.line==='shuimeijiang'?'Qnet,d':'Qnet,ar',unit:'kcal/kg'}]),
 ...(props.line==='shuimeijiang'?[{key:'mad',label:'内在水分 Mad',unit:'%'}]:[{key:'m',label:'全水分 Mt',unit:'%'}]),
 {key:'a',label:'灰分 A',unit:'%'},{key:'s',label:'全硫 St',unit:'%'},{key:'v',label:'挥发分 Vdaf',unit:'%'},
 ...(props.line==='jiaomei'?[{key:'g',label:'粘结 G',unit:''},{key:'y',label:'胶质层 Y',unit:'mm'}]:[]),
 ...(props.line==='penchuimei'?[{key:'hgi',label:'可磨性 HGI',unit:''}]:[]),
 ...(props.line==='huagong'?[{key:'st',label:'灰熔点 ST',unit:'℃'},{key:'ts',label:'热稳 TS+6',unit:'%'},{key:'ss',label:'抗碎 SS',unit:'%'}]:[])
] as {key:keyof Coal;label:string;unit:string}[])
function update(coal:Coal,key:keyof Coal,event:Event){const value=(event.target as HTMLInputElement).value;(coal as unknown as Record<string,unknown>)[key]=value===''?'':Number(value)}
</script>
<template><div class="coal-table-scroll"><table class="coal-source-table"><thead><tr><th>启用</th><th>煤源名称</th><th v-if="line!=='shuimeijiang'">灰 / 硫基准</th><th v-if="line==='huagong'">粒度档</th><th v-for="f in fields" :key="f.key">{{f.label}}<small>{{f.unit}}</small></th><th>操作</th></tr></thead><tbody><tr v-for="(coal,i) in coals" :key="coal.id" :class="{disabled:!coal.enabled}"><td><input v-model="coal.enabled" type="checkbox" :aria-label="`启用煤源 ${i+1}`"></td><td><input v-model="coal.name" class="coal-name-input" :aria-label="`煤源 ${i+1} 名称`"></td><td v-if="line!=='shuimeijiang'"><select v-model="coal.basis" :aria-label="`煤源 ${i+1} 灰硫基准`"><option value="d">干基 d</option><option value="ar">收到基 ar</option></select></td><td v-if="line==='huagong'"><select v-model="coal.size" :aria-label="`煤源 ${i+1} 粒度档`"><option>6～13mm</option><option>13～25mm</option><option>25～50mm</option></select></td><td v-for="f in fields" :key="f.key"><input type="number" step="any" min="0" :value="coal[f.key]" :aria-label="`煤源 ${i+1} ${f.label}`" placeholder="未检测" @input="update(coal,f.key,$event)"></td><td><button class="coal-delete" :aria-label="`删除煤源 ${i+1}`" @click="$emit('remove',coal.id)">移除</button></td></tr></tbody></table></div><div v-if="!coals.length" class="coal-empty">暂无煤源，添加一条或载入示例后开始。</div></template>
