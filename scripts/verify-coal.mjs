import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const moduleFrom=async path=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64'))
const {tools,defaults,calculate}=await moduleFrom('../src/utils/coal/calculators.ts')
const {linearProgram,optimize,examples,targetFor,newCoal}=await moduleFrom('../src/utils/coal/blending.ts')
let checks=0
const near=(value,expected,tolerance=1e-6)=>{assert.ok(Math.abs(value-expected)<tolerance,`${value} ≠ ${expected}`);checks++}
const run=(id,overrides={})=>{const t=tools.find(t=>t.id===id);return calculate(t,{...defaults(t),...overrides})}
const first=(id,overrides)=>run(id,overrides)[0].value
assert.equal(tools.length,27);assert.equal(new Set(tools.map(t=>t.id)).size,27)
for(const t of tools){const result=calculate(t,defaults(t));assert.ok(result.length>0,t.id);assert.ok(result.every(r=>typeof r.value!=='number'||Number.isFinite(r.value)));checks++}
near(first('kajia'),780*1000/5500);near(first('daotuidunjia'),781)
near(first('rezhijia'),780*5300/5500);near(first('rezhijia',{mode:'按补差'}),750);near(first('rezhijia',{cap:700}),700)
near(first('danwei',{unit:'MJ/kg',Q:23.0274}),5500)
near(first('biaomei'),1000*5200/7000);near(first('biaomei',{direction:'标煤 → 实物煤',W:1000*5200/7000}),1000)
near(first('koufa'),695);near(first('koufa',{mode:'仅超出免赔部分'}),712)
near(first('daoan'),(780+112+15+8)/0.995*1.13)
near(first('hunpei'),50);near(first('hunpei',{mode:'三种煤'}),46)
near(first('shuifen',{mode:'直接录入',sample:1,change:0.0124}),1.24)
near(first('huifen',{mode:'直接录入',sample:1.0002,change:0.0981}),9.8080383923)
near(first('huifafen',{mode:'直接录入',sample:1,change:0.35,Mad:1.24,CO2:3}),30.76)
near(first('gudintan'),58.03);near(first('tanqing'),0.2729*0.5125/0.2001*100)
near(first('gaodiwei'),((29850-206*2.43)*(100-8.6)/(100-1.24)-23*8.6)/4.1868)
near(first('quanliu'),(0.1485-0.0012)*0.1374/1.001*100)
near(first('nianjie'),77);near(first('kemoli'),82);near(first('yang'),13.14);near(first('ganliu'),9.3)
near(first('co2'),0.0088/1.0006*100)
near(first('fuchen'),20.9232)
for(const [id,values] of [['kajia',{Q:0}],['kajia',{P:''}],['gudintan',{Mad:50,Aad:40,Vad:20}],['jizhun',{Mad:100}],['hunpei',{Qt:9000}],['kemoli',{mt:10}],['rewending',{m6:5}],['huifafen',{CO2:13}],['yang',{C:100}]]){assert.throws(()=>run(id,values),id);checks++}
const a=linearProgram([[1,1],[-1,-1],[1,0]],[1,-1,0.4],[2,1]);near(a[0],0.4);near(a[1],0.6)
assert.equal(linearProgram([[1],[-1]],[0,-1],[1]),null)
for(const line of ['dianmei','shuimeijiang','huagong','jiaomei','penchuimei']){
 const t=targetFor(line),cs=examples(line),result=optimize(line,cs,t)
 near(result.rows.reduce((s,r)=>s+r.ratio,0),1)
 near(result.rows.reduce((s,r)=>s+r.dryRatio,0),1)
 near(result.rows.reduce((s,r)=>s+r.tonnes,0),t.tonnes)
 assert.ok(result.a<=t.a+1e-6&&result.s<=t.s+1e-6,line)
 assert.ok(result.v>=t.vmin-1e-6&&result.v<=t.vmax+1e-6,line)
 if(line!=='shuimeijiang')assert.ok(result.m<=t.m+1e-6)
 if(t.q)assert.ok(result.q>=t.q-(line==='penchuimei'?0:t.tolerance)-1e-6)
 if(t.q&&line!=='penchuimei')assert.ok(result.q<=t.q+t.tolerance+1e-6)
 assert.ok(result.rows.every(r=>r.ratio*100<=r.coal.cap+1e-5))
 if(line==='jiaomei')assert.ok(result.g>=t.g-1e-6&&result.y>=t.y-1e-6)
 if(line==='penchuimei')assert.ok(result.hgi>=t.hgi-1e-6)
 checks++
}
// Analytic 50:50 thermal mix, with dry-basis sulfur balanced by dry masses.
let cs=[{...newCoal(),price:800,q:6000,m:5,a:10,s:0.4,v:30},{...newCoal(),price:400,q:4000,m:20,a:20,s:1,v:20}]
let t={...targetFor('dianmei'),q:5000,tolerance:0,m:0,a:0,s:0,vmin:0,vmax:0}
let mixed=optimize('dianmei',cs,t);near(mixed.rows[0].ratio,0.5);near(mixed.price,600);near(mixed.s,(0.95*0.4+0.8)/1.75)
const ar=cs.map(c=>({...c,a:c.a*(1-c.m/100),s:c.s*(1-c.m/100),basis:'ar'}))
near(optimize('dianmei',ar,t).a,mixed.a)
assert.throws(()=>optimize('dianmei',cs,{...t,q:9000}))
assert.throws(()=>optimize('dianmei',cs.map(c=>({...c,cap:20})),t))
assert.throws(()=>optimize('dianmei',cs,{...t,tonnes:0}))
assert.throws(()=>optimize('huagong',examples('huagong'),{...targetFor('huagong'),st:5000}))
const different=examples('huagong').map((c,i)=>({...c,size:['6～13mm','13～25mm','25～50mm'][i]}))
const gas=optimize('huagong',different,{...targetFor('huagong'),q:0,fc:0,a:0,s:0,vmin:0,vmax:0});assert.equal(new Set(gas.rows.map(r=>r.coal.size)).size,1)
// Dry-cost objective must not favor a cheaper wet tonne carrying more water.
cs=[{...newCoal(),name:'干煤较便宜',price:100,m:0,g:90,y:20},{...newCoal(),name:'湿吨便宜但干煤昂贵',price:90,m:30,g:90,y:20}]
t={...targetFor('jiaomei'),q:0,m:0,a:0,s:0,vmin:0,vmax:0,g:0,y:0,weak:0,strong:0}
const dry=optimize('jiaomei',cs,t);assert.equal(dry.rows[0].coal.name,'干煤较便宜');near(dry.dryPrice,100)
console.log(`PASS: ${checks} numerical and constraint checks; 27 calculators, 5 blending lines, invalid inputs, unit/basis conversion, infeasibility, and dry-cost objective.`)
// Independent two-variable vertex oracle exercises both simplex phases.
let seed=42
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32}
for(let sample=0;sample<40;sample++){
 const A=[[1,0],[0,1],[-1,0],[0,-1]],b=[1,1,0,0],c=[random()*4-2,random()*4-2]
 for(let i=0;i<4;i++){const a=[random()*4-2,random()*4-2];A.push(a);b.push(random()*2-0.4)}
 const vertices=[]
 for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){
  const determinant=A[i][0]*A[j][1]-A[i][1]*A[j][0];if(Math.abs(determinant)<1e-9)continue
  const x=(b[i]*A[j][1]-A[i][1]*b[j])/determinant,y=(A[i][0]*b[j]-b[i]*A[j][0])/determinant
  if(A.every((a,k)=>a[0]*x+a[1]*y<=b[k]+1e-7))vertices.push([x,y])
 }
 const result=linearProgram(A,b,c)
 if(!vertices.length)assert.equal(result,null)
 else {assert.ok(result);near(result[0]*c[0]+result[1]*c[1],Math.max(...vertices.map(v=>v[0]*c[0]+v[1]*c[1])),1e-6)}
}
near(first('shuifen',{mode:'直接录入',m0:'',m1:'',m2:'',sample:1,change:0.02}),2)
const cokeSources=examples('jiaomei');cokeSources[0].g=''
const coke=optimize('jiaomei',cokeSources,targetFor('jiaomei'))
assert.ok(coke.rows.every(r=>r.coal.g!==''));assert.ok(coke.warnings.some(w=>w.includes('缺少已设约束')))
console.log('PASS: 40 independent LP vertex-oracle cases, hidden-field switching, and missing constrained G exclusion.')
