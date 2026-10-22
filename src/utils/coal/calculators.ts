export type Values = Record<string, number | string>;
export interface Field {
    key: string;
    label: string;
    unit: string;
    value: number | string;
    min?: number;
    max?: number;
    options?: string[];
}
export interface Result {
    label: string;
    value: number | string;
    unit?: string;
}
export interface Tool {
    id: string;
    name: string;
    category: string;
    desc: string;
    formula: string;
    reference: string;
    note?: string;
    fields: Field[];
    calculate: (v: Record<string, number>, raw: Values) => Result[];
}
const f = (key: string, label: string, value: number, unit = '%', min = 0, max?: number): Field => ({ key, label, value, unit, min, max });
const pct = (key: string, label: string, value: number) => f(key, label, value, '%', 0, 100);
const positive = (key: string, label: string, value: number, unit = 'g') => f(key, label, value, unit, 0.0000001);
const select = (key: string, label: string, options: string[]): Field => ({ key, label, options, value: options[0]!, unit: '' });
const r = (label: string, value: number | string, unit = '%'): Result => ({ label, value, unit });
function requireThat(ok: boolean, message: string) { if (!ok)
    throw new Error(message); }
const tool = (id: string, name: string, category: string, desc: string, fields: Field[], formula: string, reference: string, calculate: Tool['calculate'], note?: string): Tool => ({ id, name, category, desc, fields, formula, reference, calculate, note });
const industrial = '工业分析', general = '通用计算', element = '元素分析', process = '工艺性能', other = '其他测定';
const weightFields = [select('mode', '录入方式', ['三次称量', '直接录入']), f('m0', '空容器质量', 20, 'g'), positive('m1', '处理前容器＋煤样', 21), positive('m2', '处理后容器＋残样', 20.98), positive('sample', '直接录入：煤样质量', 1), f('change', '直接录入：失重 / 灰质量', 0.02, 'g')];
function weighing(v: Record<string, number>, raw: Values, ash = false) {
    const sample = raw.mode === '直接录入' ? v.sample! : v.m1! - v.m0!;
    const change = raw.mode === '直接录入' ? v.change! : (ash ? v.m2! - v.m0! : v.m1! - v.m2!);
    requireThat(sample > 0 && change >= 0 && change <= sample, '请核对称量顺序：煤样质量须大于 0，失重或残渣须介于 0 与煤样质量之间。');
    return { sample, change, percent: change / sample * 100 };
}
export const tools: Tool[] = [
    tool('kajia', '卡价计算', general, '统一热值口径，比较每百万大卡采购成本。', [f('P', '煤价', 780, '元/吨'), positive('Q', '收到基低位热值 Qnet,ar', 5500, 'kcal/kg')], '卡价 = 煤价 × 1000 ÷ 热值；标煤单价 = 煤价 × 7000 ÷ 热值', '热值测定参考 GB/T 213；计价按合同约定', v => [r('卡价', v.P! * 1000 / v.Q!, '元/百万大卡'), r('折 7000 大卡吨价', v.P! * 7000 / v.Q!, '元/吨')]),
    tool('daotuidunjia', '倒推吨价', general, '由卡价与热值反算吨价、采购总额。', [f('P', '卡价', 142, '元/百万大卡'), positive('Q', '收到基低位热值', 5500, 'kcal/kg'), f('N', '采购数量', 1000, '吨')], '吨价 = 卡价 × 热值 ÷ 1000；总额 = 吨价 × 数量', '合同计价算术', v => [r('吨价', v.P! * v.Q! / 1000, '元/吨'), r('采购总额', v.P! * v.Q! * v.N! / 1000, '元'), r('折标煤吨价', v.P! * 7, '元/吨标煤')]),
    tool('rezhijia', '热值计价', general, '按比例或按热值补差结算，支持封顶。', [select('mode', '计价方式', ['按比例', '按补差']), f('P', '合同基准价', 780, '元/吨'), positive('Q0', '合同基准热值', 5500, 'kcal/kg'), positive('Q', '实际热值', 5300, 'kcal/kg'), f('k', '每大卡补差', 0.15, '元/吨/大卡'), f('cap', '封顶价（0 不封顶）', 0, '元/吨')], '比例：P × Q/Q₀；补差：P + (Q−Q₀) × k', '合同约定；验收方法参考 GB/T 18666', (v, raw) => { let p = raw.mode === '按比例' ? v.P! * v.Q! / v.Q0! : v.P! + (v.Q! - v.Q0!) * v.k!; if (v.cap! > 0)
        p = Math.min(p, v.cap!); requireThat(p >= 0, '补差后的结算价为负，请核对合同参数。'); return [r('结算价', p, '元/吨'), r('热值偏差', v.Q! - v.Q0!, 'kcal/kg'), r('价格变动', p - v.P!, '元/吨')]; }),
    tool('jizhun', '四基准换算', general, '灰、硫、挥发分、高位热值在 ar/ad/d/daf 间换算。', [select('basis', '输入基准', ['ad', 'ar', 'd']), pct('Mt', '收到基全水分 Mt', 10), pct('Mad', '空干基水分 Mad', 2), pct('A', '输入基准灰分 A', 12), pct('V', '输入基准挥发分 V', 28), pct('S', '输入基准全硫 St', 0.65), positive('Q', '输入基准高位热值 Qgr', 6200, 'kcal/kg')], '先换到 d；d→ar 乘 (100−Mt)/100；d→ad 乘 (100−Mad)/100；d→daf 乘 100/(100−Ad)', '基准换算参考 GB/T 483', (v, raw) => { const moisture = raw.basis === 'ar' ? v.Mt! : raw.basis === 'ad' ? v.Mad! : 0; requireThat(v.Mt! < 100 && v.Mad! < 100 && v.A! + moisture < 100, '水分或灰分合计须小于 100%。'); requireThat(v.A! + v.V! + moisture <= 100, '灰分、挥发分与对应水分之和不能大于 100%。'); const ad = v.A! * 100 / (100 - moisture); return ['A', 'V', 'S', 'Q'].flatMap(key => ['ar', 'ad', 'd', 'daf'].map(b => r(`${key === 'Q' ? 'Qgr' : key} · ${b}`, key === 'A' && b === 'daf' ? '不适用' : v[key]! * 100 / (100 - moisture) * (b === 'ar' ? (100 - v.Mt!) / 100 : b === 'ad' ? (100 - v.Mad!) / 100 : b === 'daf' ? 100 / (100 - ad) : 1), key === 'Q' ? 'kcal/kg' : '%'))); }, '只对高位热值 Qgr 使用系数法。低位热值请用“发热量计算”做氢和水分修正。灰分无 daf 值。'),
    tool('danwei', '发热量单位换算', general, '大卡、兆焦双向换算，附千焦与折标系数。', [select('unit', '输入单位', ['kcal/kg', 'MJ/kg']), positive('Q', '发热量', 5500, '所选单位')], '1 kcal = 4.1868 kJ；MJ/kg = kcal/kg × 0.0041868', '国际蒸汽表卡换算', (v, raw) => { const q = raw.unit === 'MJ/kg' ? v.Q! / 0.0041868 : v.Q!; return [r('大卡', q, 'kcal/kg'), r('兆焦', q * 0.0041868, 'MJ/kg'), r('千焦', q * 4.1868, 'kJ/kg'), r('折标系数', q / 7000, 'tce/t')]; }),
    tool('biaomei', '标准煤折算', general, '实际煤量与吨标准煤双向换算。', [select('direction', '折算方向', ['实物煤 → 标煤', '标煤 → 实物煤']), select('basis', '热值口径', ['7000 kcal/kg', '29307 kJ/kg']), f('W', '输入煤量', 1000, '吨 / tce'), positive('Q', '实测低位热值', 5200, 'kcal/kg 或 kJ/kg')], '标煤量 = 实物煤量 × 实测热值 ÷ 标准热值', '折算参考 GB/T 2589', (v, raw) => { const factor = v.Q! / (raw.basis === '29307 kJ/kg' ? 29307 : 7000); return [r('折算结果', raw.direction === '实物煤 → 标煤' ? v.W! * factor : v.W! / factor, raw.direction === '实物煤 → 标煤' ? 'tce' : '吨'), r('折标系数', factor, 'tce/t')]; }, '热值按所选口径录入：7000 对应 kcal/kg，29307 对应 kJ/kg。'),
    tool('koufa', '质量扣罚', general, '热值、硫、水分考核，免赔口径可选。', [f('P', '基准价', 780, '元/吨'), select('mode', '超免赔后的扣款口径', ['全偏差扣款', '仅超出免赔部分']), positive('Q0', '合同热值', 5500, 'kcal/kg'), f('Q', '实测热值', 5300, 'kcal/kg'), f('kq', '热值扣款单价', 0.15, '元/吨/大卡'), f('fq', '热值免赔幅度', 50, 'kcal/kg'), pct('S0', '合同硫分', 0.6), pct('S', '实测硫分', 0.85), f('ks', '硫分扣款单价', 1.5, '元/吨/0.01个百分点'), pct('fs', '硫分免赔幅度', 0.03), pct('M0', '合同全水', 8), pct('M', '实测全水', 11.5), f('km', '水分扣款单价', 5, '元/吨/百分点'), pct('fm', '水分免赔幅度', 1)], '未超免赔不扣；超出后按选择的全偏差或超免赔部分 × 单价', '合同考核算术；验收参考 GB/T 18666', (v, raw) => { const d = (a: number, b: number) => a <= b + 1e-10 ? 0 : raw.mode === '全偏差扣款' ? a : a - b; const q = d(v.Q0! - v.Q!, v.fq!) * v.kq!, s = d(v.S! - v.S0!, v.fs!) * 100 * v.ks!, m = d(v.M! - v.M0!, v.fm!) * v.km!; return [r('结算价', v.P! - q - s - m, '元/吨'), r('热值扣款', q, '元/吨'), r('硫分扣款', s, '元/吨'), r('水分扣款', m, '元/吨'), r('扣款合计', q + s + m, '元/吨')]; }, '免赔并无统一合同口径，务必按双方条款选择。结算价为负表示扣款超过基准价，须另行核对合同处置条款。'),
    tool('hunpei', '混配煤配比', general, '两煤或固定第三煤比例，按目标热值求解。', [select('mode', '混配方式', ['两种煤', '三种煤']), positive('Qt', '目标热值', 5300, 'kcal/kg'), pct('Sl', '硫分上限（0 不校核）', 0.7), ...['a', 'b', 'c'].flatMap((key, i) => [positive('Q' + key, `${'ABC'[i]} 煤热值`, [5800, 4800, 5000][i]!, 'kcal/kg'), pct('S' + key, `${'ABC'[i]} 煤硫分`, [0.4, 1.1, 0.8][i]!), f('P' + key, `${'ABC'[i]} 煤吨价`, [820, 640, 700][i]!, '元/吨')]), pct('Rc', 'C 煤固定比例', 20)], 'rA = [Qt−Qc×rC−Qb×(1−rC)]/(Qa−Qb)；rB = 1−rC−rA', '热值线性质量平衡；配煤参考 GB/T 25960', (v, raw) => { requireThat(v.Qa !== v.Qb, 'A/B 热值相同，无法唯一反算配比；请调整煤源。'); const c = raw.mode === '三种煤' ? v.Rc! / 100 : 0, a = (v.Qt! - v.Qc! * c - v.Qb! * (1 - c)) / (v.Qa! - v.Qb!), b = 1 - c - a; requireThat(a >= -1e-9 && b >= -1e-9, '目标热值超出当前煤源能实现的范围。'); const s = a * v.Sa! + b * v.Sb! + c * v.Sc!, p = a * v.Pa! + b * v.Pb! + c * v.Pc!; return [r('A 煤配比', a * 100), r('B 煤配比', b * 100), r('C 煤配比', c * 100), r('混煤硫分', s), r('混煤吨价', p, '元/吨'), r('折算卡价', p * 1000 / v.Qt!, '元/百万大卡'), r('硫分校核', v.Sl! > 0 && s > v.Sl! ? '超上限，请调整煤源' : '通过 / 未设置上限', '')]; }, '硫分必须采用同一质量基准。此工具只反算热值配比；多指标约束和成本优化请进入配煤专区。'),
    tool('daoan', '到岸价估算', general, '费用汇总、运输损耗反摊、含税价与运费占比。', [f('pit', '坑口不含税价', 780, '元/吨'), f('rate', '运价', 0.35, '元/吨·公里'), f('dist', '运距', 320, '公里'), f('station', '站台费', 15, '元/吨'), f('port', '港杂费', 0, '元/吨'), f('other', '其他费用', 8, '元/吨'), f('loss', '运输损耗率', 0.5, '%', 0, 99.99), pct('tax', '统一税率', 13)], '运费 = 运价 × 运距；不含税成本 = 各项不含税费用之和 ÷ (1−损耗率)；含税价 = 成本 × (1＋税率)', '采购成本估算（非税务结算模型）', v => { const freight = v.rate! * v.dist!, sum = v.pit! + freight + v.station! + v.port! + v.other!, cost = sum / (1 - v.loss! / 100); return [r('含税到岸价', cost * (1 + v.tax! / 100), '元/吨'), r('不含税到岸成本', cost, '元/吨'), r('运输费用', freight, '元/吨'), r('损耗反摊成本', cost - sum, '元/吨'), r('运费占比', cost ? freight / cost * 100 : 0)]; }, '各项费用须统一为不含税口径；此处按统一税率估算，实际货值与运费分税目核算。'),
    ...(['shuifen', 'huifen', 'huifafen'] as const).map((id, i) => tool(id, ['水分计算', '灰分计算', '挥发分计算'][i]!, industrial, ['干燥失重计算 Mad。', '灰化残渣计算 Aad。', '隔绝空气加热失重，扣水与碳酸盐修正。'][i]!, [...weightFields.map(x => ({ ...x })), ...(i === 2 ? [pct('Mad', '空干基水分 Mad', 1.24), pct('CO2', '碳酸盐 CO₂', 0)] : [])], ['Mad = 干燥失重 ÷ 煤样质量 × 100', 'Aad = 灰质量 ÷ 煤样质量 × 100', 'Vad = 失重占比 − Mad − CO₂修正（CO₂>2%时）'][i]!, '工业分析参考 GB/T 212', (v, raw) => { const w = weighing(v, raw, i === 1); if (i === 2)
        requireThat(v.CO2! <= 12, '碳酸盐 CO₂ 超过 12%，请按现行标准专用修正式处理。'); const value = w.percent - (i === 2 ? v.Mad! + (v.CO2! > 2 ? v.CO2! : 0) : 0); requireThat(value >= 0, '修正后指标为负，请核对称量和水分。'); return [r(['Mad', 'Aad', 'Vad'][i]!, value), r('称样质量', w.sample, 'g'), r(i === 1 ? '灰质量' : '失重', w.change, 'g')]; }, i === 2 ? 'CO₂ 超过 12% 时不代算；称量、温度与试验程序按现行标准执行。' : undefined)),
    tool('gudintan', '固定碳计算', industrial, '工业分析差减，同时输出干基和干燥无灰基。', [pct('Mad', '水分 Mad', 1.24), pct('Aad', '灰分 Aad', 9.81), pct('Vad', '挥发分 Vad', 30.92)], 'FCad = 100−Mad−Aad−Vad；FCd = FCad×100/(100−Mad)；FCdaf = FCad×100/(100−Mad−Aad)', '工业分析参考 GB/T 212', v => { requireThat(v.Mad! + v.Aad! + v.Vad! <= 100 && v.Mad! + v.Aad! < 100, '组分之和超限或无可燃体，无法计算。'); const fc = 100 - v.Mad! - v.Aad! - v.Vad!; return [r('FCad', fc), r('FCd', fc * 100 / (100 - v.Mad!)), r('FCdaf', fc * 100 / (100 - v.Mad! - v.Aad!)), r('燃料比', v.Vad! ? fc / v.Vad! : '挥发分为 0，不适用', '')]; }),
    tool('tanqing', '碳氢计算', element, '燃烧吸收法增重换算，氢扣除煤样水分。', [positive('m', '称样量', 0.2001), f('c', 'CO₂ 吸收管净增重', 0.5125, 'g'), f('h', '水吸收管净增重', 0.046, 'g'), pct('Mad', '水分 Mad', 1.24)], 'Cad = 0.2729×ΔCO₂/m×100；Had = 0.1119×(ΔH₂O/m×100−Mad)', '测定参考 GB/T 476', v => { const c = 0.2729 * v.c! / v.m! * 100, h = 0.1119 * (v.h! / v.m! * 100 - v.Mad!); requireThat(h >= 0 && c + h + v.Mad! <= 100, '碳、氢与水分结果异常，请核对吸收管净增重。'); return [r('碳 Cad', c), r('氢 Had', h)]; }, '请录入已扣除空白试验的净增重。'),
    tool('luojia', '罗加筛分占比', process, '记录三次转鼓筛上量，计算各次保留比例。', [positive('m', '焦渣总量', 5.86), f('m1', '第一次筛上量', 4.62, 'g'), f('m2', '第二次筛上量', 3.95, 'g'), f('m3', '第三次筛上量', 3.48, 'g')], '各次保留比例 = 筛上焦渣质量 ÷ 焦渣总量 × 100', '试验参考 GB/T 5449', v => { requireThat(v.m! >= v.m1! && v.m1! >= v.m2! && v.m2! >= v.m3!, '三次筛上质量须逐次不增且不超过焦渣总量。'); return [r('第一次保留比例', v.m1! / v.m! * 100), r('第二次保留比例', v.m2! / v.m! * 100), r('第三次保留比例', v.m3! / v.m! * 100)]; }, '此处仅为筛分占比，不能当作正式 R.I. 指数；参考站也未提供最终 R.I. 计算。'),
    tool('nianjie', '粘结指数 G', process, '5:5 配比两次转鼓计算；低值给出复检提示。', [positive('m', '焦渣总量', 4.5), f('m1', '第一次筛上量', 3.5, 'g'), f('m2', '第二次筛上量', 2.8, 'g')], 'G = 10＋(30×m₁＋70×m₂)/m', '测定参考 GB/T 5447', v => { requireThat(v.m! >= v.m1! && v.m1! >= v.m2!, '筛上质量须逐次不增且不超过总量。'); const g = 10 + (30 * v.m1! + 70 * v.m2!) / v.m!; requireThat(g <= 100, 'G 超过 100，请核对称量记录与试验配比。'); return [r('粘结指数 G', Math.round(g), ''), r('复检提示', g < 18 ? 'G<18，需按标准使用 3:15 配比复检' : '当前为 5:5 配比计算', '')]; }),
    tool('gaodiwei', '发热量计算', industrial, '高位转低位，含氢修正及水分汽化热修正。', [positive('Qgr', 'Qgr,ad', 29850, 'J/g'), pct('Had', '氢 Had', 2.43), f('Mad', '空干基水分', 1.24, '%', 0, 99.99), f('Mt', '全水分 Mt', 8.6, '%', 0, 99.99)], 'Qnet,v,ar = (Qgr,ad−206×Had)×(100−Mt)/(100−Mad)−23×Mt', '热值测定参考 GB/T 213', v => { const ad = v.Qgr! - 206 * v.Had! - 23 * v.Mad!, ar = (v.Qgr! - 206 * v.Had!) * (100 - v.Mt!) / (100 - v.Mad!) - 23 * v.Mt!; requireThat(ad > 0 && ar > 0, '修正后的热值不大于 0，请核对输入单位和煤质指标。'); return [r('Qnet,v,ar', ar / 4.1868, 'kcal/kg'), r('Qnet,v,ar', ar / 1000, 'MJ/kg'), r('Qnet,v,ad', ad / 1000, 'MJ/kg'), r('Qgr,d', v.Qgr! * 100 / (100 - v.Mad!) / 1000, 'MJ/kg')]; }),
    tool('quanliu', '全硫计算', element, '艾士卡法硫酸钡称量，扣除空白。', [positive('m', '称样量', 1.001), f('m1', '硫酸钡质量', 0.1485, 'g'), f('m0', '空白硫酸钡质量', 0.0012, 'g')], 'St,ad = (m₁−m₀)×0.1374/m×100', '测定参考 GB/T 214', v => { requireThat(v.m1! >= v.m0!, '试样硫酸钡质量不能小于空白。'); return [r('全硫 St,ad', (v.m1! - v.m0!) * 0.1374 / v.m! * 100)]; }),
    tool('kemoli', '可磨性 HGI', process, '标准煤样两点线性内插，工程近似。', [f('m1', '标准样 1 筛分量', 4, 'g'), f('H1', '标准样 1 HGI', 50, ''), f('m2', '标准样 2 筛分量', 8, 'g'), f('H2', '标准样 2 HGI', 110, ''), f('mt', '待测筛分量', 6.1, 'g')], 'HGI = H₁＋(mt−m₁)×(H₂−H₁)/(m₂−m₁)', '试验参考 GB/T 2565；此处为两点近似', v => { requireThat(v.m1 !== v.m2, '两校准点筛分质量不能相同。'); requireThat(v.mt! >= Math.min(v.m1!, v.m2!) && v.mt! <= Math.max(v.m1!, v.m2!), '待测值超出校准区间，不进行外推。'); return [r('HGI 近似值', Math.round(v.H1! + (v.mt! - v.m1!) * (v.H2! - v.H1!) / (v.m2! - v.m1!)), '')]; }, '正式报出请按仪器校准曲线和现行标准复核。'),
    tool('rewending', '热稳定性', process, '残焦三粒级质量占比，并校验质量守恒。', [positive('m', '残焦总量', 49.2), f('m6', '＞6mm', 45.6, 'g'), f('m3', '3～6mm', 2.5, 'g'), f('m0', '＜3mm', 1.1, 'g')], '各粒级 TS = 该粒级残焦质量/残焦总量×100', '测定参考 GB/T 1573', v => { requireThat(Math.abs(v.m6! + v.m3! + v.m0! - v.m!) <= Math.max(0.001, v.m! * 0.0001), '各粒级质量之和与总量不一致，请核对。'); return [r('TS+6', v.m6! / v.m! * 100), r('TS3～6', v.m3! / v.m! * 100), r('TS−3', v.m0! / v.m! * 100)]; }),
    ...[['jiezha', '结渣率', 'Clin', '＞6mm 渣块质量', 38.4, 9.8, 'GB/T 1572'], ['qiangdu', '机械强度', 'SS', '＞25mm 块煤质量', 25, 18.6, 'GB/T 15459']].map(x => tool(String(x[0]), String(x[1]), process, '按规定粒级残留质量计算占比。', [positive('m', '试样 / 灰渣总量', Number(x[4])), f('remain', String(x[3]), Number(x[5]), 'g')], `${x[2]} = 残留质量/总质量×100`, `测定参考 ${x[6]}`, v => { requireThat(v.remain! <= v.m!, '残留质量不能大于总量。'); return [r(String(x[2]), v.remain! / v.m! * 100)]; })),
    tool('dan', '氮计算', element, '半微量开氏法滴定，扣空白并换算氮量。', [f('V', '试样耗标准酸', 8.6, 'mL'), f('V0', '空白耗标准酸', 0.2, 'mL'), positive('c', '标准酸浓度（按等效 H⁺计）', 0.025, 'mol/L'), positive('m', '称样量', 0.201)], 'Nad = (V−V₀)×c×0.014/m×100', '测定参考 GB/T 19227', v => { requireThat(v.V! >= v.V0!, '试样耗酸量不能小于空白。'); return [r('氮 Nad', (v.V! - v.V0!) * v.c! * 0.014 / v.m! * 100)]; }, '酸浓度按氢离子等效浓度录入，不能把二元酸的分子浓度直接代入。'),
    tool('yang', '氧差减', element, '同一 ad 基准，100 减去其余组分。', [pct('M', 'Mad', 1.24), pct('A', 'Aad', 9.81), pct('C', 'Cad', 69.9), pct('H', 'Had', 2.43), pct('N', 'Nad', 1.46), pct('S', 'St,ad', 2.02), pct('CO2', '碳酸盐 CO₂,ad', 0)], 'Oad = 100−Mad−Aad−Cad−Had−Nad−St,ad−CO₂,ad', '基准及差减参考 GB/T 483', v => { const sum = Object.values(v).reduce((a, b) => a + b, 0); requireThat(sum <= 100, '各组分合计超过 100%，请统一基准并核对。'); return [r('氧 Oad', 100 - sum)]; }),
    tool('ganliu', '低温干馏', other, '由称量质量计算焦油、水、半焦及差减气损。', [positive('m', '煤样质量', 20), f('tar', '焦油质量', 1.86, 'g'), f('water', '热解水质量', 0.54, 'g'), f('char', '半焦质量', 13.4, 'g')], '产率 = 产物质量/煤样质量×100；气损 = 100−三项产率', '试验参考 GB/T 1341', v => { requireThat(v.tar! + v.water! + v.char! <= v.m!, '产物总质量不能大于煤样质量。'); return [r('焦油产率', v.tar! / v.m! * 100), r('热解水产率', v.water! / v.m! * 100), r('半焦产率', v.char! / v.m! * 100), r('差减气体与损失', (1 - (v.tar! + v.water! + v.char!) / v.m!) * 100)]; }),
    tool('co2', '碳酸盐二氧化碳', element, '吸收管前后称量或净增重，扣除空白。', [select('mode', '录入方式', ['前后称量', '直接净增重']), positive('m', '称样量', 1.0006), f('m1', '反应前吸收管', 42.1532, 'g'), f('m2', '反应后吸收管', 42.162, 'g'), f('gain', '直接录入净增重', 0.0088, 'g'), f('blank', '空白增重', 0, 'g')], 'CO₂,ad = (吸收管增重−空白)/煤样质量×100', '测定参考 GB/T 218', (v, raw) => { const gain = (raw.mode === '直接净增重' ? v.gain! : v.m2! - v.m1!) - v.blank!; requireThat(gain >= 0, '扣除空白后增重为负，请核对。'); return [r('CO₂,ad', gain / v.m! * 100)]; }),
    tool('fuchen', '浮沉试验', other, '六个密度级产率、加权灰分及累计浮物。', [...['＜1.30', '1.30～1.40', '1.40～1.50', '1.50～1.60', '1.60～1.80', '＞1.80'].flatMap((label, i) => [f('m' + i, `${label} 质量`, [28.5, 22, 15.2, 9.8, 8.9, 15.6][i]!, 'g'), pct('a' + i, `${label} 灰分`, [4.2, 8.6, 15.3, 24.5, 37.2, 62.8][i]!)])], 'γi = mi/Σm×100；加权灰分 = Σ(mi×Ai)/Σm', '试验参考 GB/T 478', v => { const mass = Array.from({ length: 6 }, (_, i) => v['m' + i]!), total = mass.reduce((a, b) => a + b, 0); requireThat(total > 0, '各密度级质量总和必须大于 0。'); let cumulative = 0; return [r('加权灰分 Ad', mass.reduce((s, w, i) => s + w * v['a' + i]!, 0) / total), r('样品总质量', total, 'g'), ...mass.flatMap((w, i) => { cumulative += w; return [r(`第 ${i + 1} 级产率`, w / total * 100), r(`累计至第 ${i + 1} 级浮物`, cumulative / total * 100)]; })]; })
];
export function defaults(t: Tool): Values { return Object.fromEntries(t.fields.map(f => [f.key, f.value])); }
export function activeFields(t: Tool, raw: Values): Field[] {
    return t.fields.filter(f => {
        if (['shuifen', 'huifen', 'huifafen'].includes(t.id)) {
            if (['m0', 'm1', 'm2'].includes(f.key))
                return raw.mode !== '直接录入';
            if (['sample', 'change'].includes(f.key))
                return raw.mode === '直接录入';
        }
        if (t.id === 'hunpei' && ['Qc', 'Sc', 'Pc', 'Rc'].includes(f.key))
            return raw.mode === '三种煤';
        if (t.id === 'rezhijia' && f.key === 'k')
            return raw.mode === '按补差';
        if (t.id === 'co2') {
            if (['m1', 'm2'].includes(f.key))
                return raw.mode !== '直接净增重';
            if (f.key === 'gain')
                return raw.mode === '直接净增重';
        }
        return true;
    });
}
export function calculate(t: Tool, raw: Values): Result[] {
    const values: Record<string, number> = Object.fromEntries(t.fields.filter(f => !f.options).map(f => [f.key, Number(f.value)]));
    for (const field of activeFields(t, raw)) {
        if (field.options) {
            requireThat(field.options.includes(String(raw[field.key])), `${field.label}选项无效`);
            continue;
        }
        const value = raw[field.key];
        requireThat(value !== '' && value !== undefined && value !== null, `请填写${field.label}`);
        const n = Number(value);
        requireThat(Number.isFinite(n), `${field.label}须为有效数值`);
        requireThat((field.min === undefined || n >= field.min) && (field.max === undefined || n <= field.max), `${field.label}超出允许范围${field.max !== undefined ? `（${field.min}～${field.max}）` : ''}`);
        values[field.key] = n;
    }
    const result = t.calculate(values, raw);
    requireThat(result.every(x => typeof x.value !== 'number' || Number.isFinite(x.value)), '结果无法计算，请检查分母和输入范围。');
    requireThat(result.every(x => x.unit !== '%' || typeof x.value !== 'number' || x.value >= -1e-8 && x.value <= 100 + 1e-8), '计算百分比超出 0～100%，请核对称量与输入数据。');
    return result;
}
