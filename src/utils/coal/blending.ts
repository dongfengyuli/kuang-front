export type Line = 'dianmei' | 'shuimeijiang' | 'huagong' | 'jiaomei' | 'penchuimei';
export interface Coal {
    id: string;
    name: string;
    enabled: boolean;
    price: number;
    cap: number;
    q: number;
    m: number;
    a: number;
    s: number;
    v: number;
    mad: number;
    g: number | '';
    y: number | '';
    hgi: number | '';
    st: number | '';
    ts: number | '';
    ss: number | '';
    size: string;
    basis: 'd' | 'ar';
}
export interface Target {
    q: number;
    tolerance: number;
    m: number;
    a: number;
    s: number;
    vmin: number;
    vmax: number;
    fc: number;
    g: number;
    y: number;
    weak: number;
    strong: number;
    hgi: number;
    st: number;
    ts: number;
    ss: number;
    size: string;
    concentration: number;
    tonnes: number;
}
export const lines: {
    id: Line;
    name: string;
    short: string;
    desc: string;
    tag: string;
}[] = [
    { id: 'dianmei', name: '电煤经济配煤', short: '电煤', desc: '热值、灰硫水与挥发分约束，求经济采购配比。', tag: '动力煤 · 电厂' },
    { id: 'shuimeijiang', name: '水煤浆掺配', short: '水煤浆', desc: '按干煤优化成本，核算浆体热值与加水量。', tag: '制浆 · 干煤口径' },
    { id: 'huagong', name: '化工气化用煤', short: '气化煤', desc: '同粒度配煤，灰熔点、热稳定性、强度逐煤筛选。', tag: '固定床 · 块煤' },
    { id: 'jiaomei', name: '焦煤炼焦配煤', short: '炼焦煤', desc: '干煤成本优化，结合粘结估算与强弱粘煤占比。', tag: 'G/Y 估算 · 结构约束' },
    { id: 'penchuimei', name: '高炉喷吹配煤', short: '喷吹煤', desc: '灰硫水、挥发分窗口与 HGI 估算联合校核。', tag: '高炉 · 干煤成本' },
];
export function targetFor(line: Line): Target {
    const t: Target = { q: 4800, tolerance: 50, m: 18, a: 24, s: 1, vmin: 20, vmax: 40, fc: 0, g: 0, y: 0, weak: 0, strong: 0, hgi: 0, st: 0, ts: 0, ss: 0, size: '自动', concentration: 62, tonnes: 1000 };
    if (line === 'shuimeijiang')
        Object.assign(t, { q: 6000, tolerance: 100, m: 0, a: 12, s: 0.8, vmin: 25, vmax: 40 });
    if (line === 'huagong')
        Object.assign(t, { q: 6200, m: 12, a: 18, vmin: 5, vmax: 15, fc: 75, st: 1250, ts: 60, ss: 65 });
    if (line === 'jiaomei')
        Object.assign(t, { q: 0, m: 10, a: 10.5, s: 1, vmin: 19, vmax: 28, g: 80, y: 15, weak: 15, strong: 50 });
    if (line === 'penchuimei')
        Object.assign(t, { q: 5600, m: 12, a: 10, s: 0.8, vmin: 12, vmax: 26, hgi: 55 });
    return t;
}
export function newCoal(): Coal { return { id: crypto.randomUUID(), name: '新煤源', enabled: true, price: 0, cap: 100, q: 5500, m: 10, a: 12, s: 0.6, v: 28, mad: 2, g: '', y: '', hgi: '', st: '', ts: '', ss: '', size: '13～25mm', basis: 'd' }; }
export function examples(line: Line): Coal[] {
    const data = line === 'jiaomei' ? [[1500, 6500, 7.5, 9, 0.8, 21, 82, 20], [1550, 6700, 8, 9.5, 0.6, 24, 90, 22], [1100, 6000, 9, 10, 0.7, 32, 68, 12], [850, 5700, 12, 12, 0.9, 34, 35, 4]] : line === 'shuimeijiang' ? [[560, 6300, 0, 8, 0.4, 36], [540, 6200, 0, 10, 0.6, 33], [820, 6600, 0, 6, 0.5, 32], [320, 5200, 0, 15, 0.8, 39]] : line === 'huagong' ? [[1080, 6800, 6, 12, 0.4, 7], [980, 6300, 7, 16, 0.8, 9], [820, 5800, 8, 18, 1.2, 14]] : line === 'penchuimei' ? [[1080, 6000, 7, 14, 0.35, 6], [980, 6100, 8, 9.5, 0.45, 15], [850, 5800, 10, 8, 0.5, 28], [720, 5400, 13, 6.5, 0.4, 34]] : [[620, 5500, 10, 16, 0.5, 30], [420, 4200, 16, 24, 0.9, 32], [510, 4900, 12, 19, 0.7, 28]];
    return data.map((d, i) => ({ ...newCoal(), name: `示例煤源 ${String.fromCharCode(65 + i)}`, price: d[0]!, q: d[1]!, m: d[2]!, a: d[3]!, s: d[4]!, v: d[5]!, g: d[6] ?? '', y: d[7] ?? '', hgi: [42, 82, 75, 62][i]!, st: 1380 - i * 30, ts: 85 - i * 3, ss: 78 - i * 2, mad: [4, 5, 2.5, 12][i]! }));
}
// Two-phase simplex: maximize c·x with A·x ≤ b and x ≥ 0.
export function linearProgram(A: number[][], b: number[], c: number[]): number[] | null {
    const m = b.length, n = c.length, eps = 1e-9, B = Array.from({ length: m }, (_, i) => n + i), N = Array.from({ length: n + 1 }, (_, i) => i === n ? -1 : i);
    const D = Array.from({ length: m + 2 }, () => Array(n + 2).fill(0) as number[]);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++)
            D[i]![j] = A[i]![j]!;
        D[i]![n] = -1;
        D[i]![n + 1] = b[i]!;
    }
    for (let j = 0; j < n; j++)
        D[m]![j] = -c[j]!;
    D[m + 1]![n] = 1;
    function pivot(r: number, s: number) { const inverse = 1 / D[r]![s]!; for (let i = 0; i < m + 2; i++)
        if (i !== r)
            for (let j = 0; j < n + 2; j++)
                if (j !== s)
                    D[i]![j] -= D[r]![j]! * D[i]![s]! * inverse; for (let j = 0; j < n + 2; j++)
        if (j !== s)
            D[r]![j] *= inverse; for (let i = 0; i < m + 2; i++)
        if (i !== r)
            D[i]![s] *= -inverse; D[r]![s] = inverse; const old = B[r]!; B[r] = N[s]!; N[s] = old; }
    function simplex(phase: number) { const row = phase === 1 ? m + 1 : m; for (let iteration = 0; iteration < 10000; iteration++) {
        let s = -1;
        for (let j = 0; j <= n; j++) {
            if (phase === 2 && N[j] === -1)
                continue;
            if (s === -1 || D[row]![j]! < D[row]![s]! - eps || Math.abs(D[row]![j]! - D[row]![s]!) < eps && N[j]! < N[s]!)
                s = j;
        }
        if (D[row]![s]! >= -eps)
            return true;
        let r = -1;
        for (let i = 0; i < m; i++)
            if (D[i]![s]! > eps) {
                if (r === -1 || D[i]![n + 1]! / D[i]![s]! < D[r]![n + 1]! / D[r]![s]! - eps || Math.abs(D[i]![n + 1]! / D[i]![s]! - D[r]![n + 1]! / D[r]![s]!) < eps && B[i]! < B[r]!)
                    r = i;
            }
        if (r === -1)
            return false;
        pivot(r, s);
    } throw new Error('求解迭代未收敛，请调整约束。'); }
    let row = 0;
    for (let i = 1; i < m; i++)
        if (D[i]![n + 1]! < D[row]![n + 1]!)
            row = i;
    if (D[row]![n + 1]! < -eps) {
        pivot(row, n);
        if (!simplex(1) || Math.abs(D[m + 1]![n + 1]!) > 1e-7)
            return null;
        for (let i = 0; i < m; i++)
            if (B[i] === -1) {
                let s = 0;
                for (let j = 1; j <= n; j++)
                    if (Math.abs(D[i]![j]!) > Math.abs(D[i]![s]!))
                        s = j;
                if (Math.abs(D[i]![s]!) > eps)
                    pivot(i, s);
            }
    }
    if (!simplex(2))
        return null;
    const x = Array(n).fill(0) as number[];
    for (let i = 0; i < m; i++)
        if (B[i]! < n)
            x[B[i]!] = D[i]![n + 1]!;
    return x;
}
export interface BlendResult {
    rows: {
        coal: Coal;
        ratio: number;
        dryRatio: number;
        tonnes: number;
    }[];
    price: number;
    dryPrice: number;
    q: number;
    m: number;
    a: number;
    s: number;
    v: number;
    fc: number;
    g: number | null;
    y: number | null;
    hgi: number | null;
    warnings: string[];
    size: string;
    concentration: number;
    total: number;
}
function validNumber(x: unknown, min = 0, max = Infinity) { return x !== '' && x !== null && Number.isFinite(Number(x)) && Number(x) >= min && Number(x) <= max; }
export function validateCoal(coal: Coal, line: Line) {
    if (!coal.name.trim())
        throw new Error('请填写煤源名称。');
    for (const key of ['price', 'cap', 'q', 'm', 'a', 's', 'v', 'mad'] as const)
        if (!validNumber(coal[key], 0, ['cap', 'm', 'a', 's', 'v', 'mad'].includes(key) ? 100 : Infinity))
            throw new Error(`${coal.name}：${key} 数据缺失或超出范围。`);
    if (coal.m >= 100 || coal.mad >= 100 || coal.a >= 100)
        throw new Error(`${coal.name}：水分、灰分须小于 100%。`);
    if (coal.basis !== 'd' && coal.basis !== 'ar')
        throw new Error(`${coal.name}：煤质基准无效。`);
    if (coal.basis === 'ar' && coal.a + coal.m >= 100)
        throw new Error(`${coal.name}：收到基水分与灰分之和须小于 100%。`);
    if (line === 'shuimeijiang' && coal.basis !== 'd')
        throw new Error(`${coal.name}：制浆请使用干基灰硫数据。`);
    for (const key of ['g', 'y', 'hgi', 'st', 'ts', 'ss'] as const)
        if (coal[key] !== '' && !validNumber(coal[key], 0, ['g', 'ts', 'ss'].includes(key) ? 100 : Infinity))
            throw new Error(`${coal.name}：${key} 数值无效。`);
}
export function optimize(line: Line, input: Coal[], t: Target): BlendResult {
    for (const [key, value] of Object.entries(t))
        if (key !== 'size' && !validNumber(value))
            throw new Error('请完整填写采购目标，未启用的约束填 0。');
    for (const key of ['m', 'a', 's', 'vmin', 'vmax', 'fc', 'weak', 'strong'] as const)
        if (t[key] > 100)
            throw new Error('百分比采购目标不能超过 100%。');
    if (t.vmax > 0 && t.vmin > t.vmax)
        throw new Error('挥发分下限不能高于上限。');
    if (t.tonnes <= 0)
        throw new Error('采购总量须大于 0。');
    if (line === 'shuimeijiang' && (t.concentration <= 0 || t.concentration >= 100))
        throw new Error('成浆浓度须介于 0 与 100%。');
    let coals = input.filter(c => c.enabled);
    if (!coals.length)
        throw new Error('请至少启用一个煤源。');
    coals.forEach(c => validateCoal(c, line));
    coals = coals.map(c => ({ ...c, a: c.basis === 'ar' ? c.a / (1 - c.m / 100) : c.a, s: c.basis === 'ar' ? c.s / (1 - c.m / 100) : c.s, basis: 'd' }));
    const warnings: string[] = [];
    if (line === 'huagong')
        coals = coals.filter(c => { const rejected = (['st', 'ts', 'ss'] as const).some(k => t[k] > 0 && c[k] !== '' && Number(c[k]) < t[k]); if (rejected)
            warnings.push(`${c.name}：逐煤门槛不合格，已排除。`); return !rejected; });
    if (line === 'jiaomei' || line === 'penchuimei')
        coals = coals.filter(c => {
            const keys = line === 'jiaomei' ? (['g', 'y'] as const) : (['hgi'] as const);
            const missing = keys.some(k => t[k] > 0 && c[k] === '');
            if (missing)
                warnings.push(`${c.name}：缺少已设约束的检测指标，未参与求解；补齐数值或将对应目标设为 0。`);
            return !missing;
        });
    const sizes = line === 'huagong' ? (t.size === '自动' ? [...new Set(coals.map(c => c.size).filter(Boolean))] : [t.size]) : ['全部'];
    let best: BlendResult | null = null;
    for (const size of sizes) {
        const cs = line === 'huagong' ? coals.filter(c => c.size === size) : coals;
        if (!cs.length)
            continue;
        const dryMode = line === 'jiaomei' || line === 'penchuimei', cws = line === 'shuimeijiang', d = cs.map(c => 1 - c.m / 100), w = cs.map((_, i) => dryMode ? 1 / d[i]! : 1), dry = cs.map((_, i) => cws || dryMode ? 1 : d[i]!), combustible = cs.map((c, i) => dry[i]! * (1 - c.a / 100));
        const A: number[][] = [], b: number[] = [];
        const add = (a: number[], rhs: number) => { const scale = Math.max(1, ...a.map(Math.abs), Math.abs(rhs)); A.push(a.map(x => x / scale)); b.push(rhs / scale); };
        add(cs.map(() => 1), 1);
        add(cs.map(() => -1), -1);
        cs.forEach((c, i) => add(cs.map((_, j) => (i === j ? w[j]! : 0) - c.cap / 100 * w[j]!), 0));
        const upper = (key: 'q' | 'm' | 'a' | 's', limit: number, weights: number[], lower = false) => { if (limit <= 0)
            return; add(cs.map((c, i) => (c[key] - limit) * weights[i]! * (lower ? -1 : 1)), 0); };
        if (t.q > 0) {
            upper('q', line === 'penchuimei' ? t.q : Math.max(0, t.q - t.tolerance), w, true);
            if (line !== 'penchuimei')
                upper('q', t.q + t.tolerance, w);
        }
        if (!cws)
            upper('m', t.m, w);
        upper('a', t.a, dry);
        upper('s', t.s, dry);
        if (t.vmin > 0)
            add(cs.map((c, i) => (t.vmin - c.v) * combustible[i]!), 0);
        if (t.vmax > 0)
            add(cs.map((c, i) => (c.v - t.vmax) * combustible[i]!), 0);
        if (line === 'huagong' && t.fc > 0)
            add(cs.map((c, i) => (t.fc - (100 - c.a - c.v * (1 - c.a / 100))) * dry[i]!), 0);
        const optional = (key: 'g' | 'y' | 'hgi', limit: number) => { if (limit > 0 && cs.every(c => c[key] !== ''))
            add(cs.map((c, i) => (limit - Number(c[key])) * w[i]!), 0); };
        if (line === 'jiaomei') {
            optional('g', t.g);
            optional('y', t.y);
            if (t.weak > 0)
                add(cs.map((c, i) => ((c.g === '' || c.g < 65 ? 1 : 0) - t.weak / 100) * w[i]!), 0);
            if (t.strong > 0)
                add(cs.map((c, i) => (t.strong / 100 - (c.g !== '' && c.g >= 75 ? 1 : 0)) * w[i]!), 0);
        }
        if (line === 'penchuimei')
            optional('hgi', t.hgi);
        const costs = cs.map((c, i) => dryMode ? c.price / d[i]! : c.price), x = linearProgram(A, b, costs.map(x => -x));
        if (!x || A.some((a, i) => a.reduce((sum, v, j) => sum + v * x[j]!, 0) > b[i]! + 1e-7))
            continue;
        const wetTotal = x.reduce((s, v, i) => s + v * w[i]!, 0), ratios = x.map((v, i) => Math.max(0, v * w[i]! / wetTotal)), dryTotal = ratios.reduce((s, v, i) => s + v * (cws ? 1 : d[i]!), 0);
        const weighted = (key: 'q' | 'm' | 'price') => cs.reduce((s, c, i) => s + ratios[i]! * c[key], 0);
        const dryValue = (key: 'a' | 's') => cs.reduce((s, c, i) => s + ratios[i]! * (cws ? 1 : d[i]!) * c[key], 0) / dryTotal;
        const combTotal = cs.reduce((s, c, i) => s + ratios[i]! * (cws ? 1 : d[i]!) * (1 - c.a / 100), 0);
        const v = cs.reduce((s, c, i) => s + ratios[i]! * (cws ? 1 : d[i]!) * (1 - c.a / 100) * c.v, 0) / combTotal;
        const used = cs.filter((_, i) => ratios[i]! > 1e-7), warn = [...warnings];
        if (line === 'huagong' && used.some(c => (['st', 'ts', 'ss'] as const).some(k => t[k] > 0 && c[k] === '')))
            warn.push('部分入选煤源缺少逐煤门槛检测值：方案未验证，不能判定准入合格。');
        const estimate = (key: 'g' | 'y' | 'hgi') => used.some(c => c[key] === '') ? null : cs.reduce((s, c, i) => s + (ratios[i]! > 1e-7 ? ratios[i]! * Number(c[key]) : 0), 0);
        if (line === 'jiaomei') {
            warn.push('G/Y 为未修正线性估算；CSR 待小焦炉或实验室验证。');
            if (cs.some(c => c.g === '' || c.y === ''))
                warn.push('候选煤源存在缺失 G/Y：相应目标约束未参与求解。缺失 G 按弱粘煤计，且不计入强粘煤。');
        }
        if (line === 'penchuimei') {
            warn.push('HGI 为未修正估算；燃烧率、置换比待试验验证。挥发分窗口不代表制粉安全评估。');
            if (cs.some(c => c.hgi === ''))
                warn.push('候选煤源缺少 HGI：HGI 目标约束未参与求解。');
        }
        if (cws)
            warn.push('成浆性、黏度与可达浓度需小样试验；粒度经验范围：粗粒 0.15～0.60mm、细粒＜0.075mm，粗细约 6:4～7:3。目标浓度并非预测可达浓度。');
        const result: BlendResult = { rows: cs.map((coal, i) => ({ coal, ratio: ratios[i]!, dryRatio: ratios[i]! * (cws ? 1 : d[i]!) / dryTotal, tonnes: ratios[i]! * t.tonnes })).filter(row => row.ratio > 1e-7), price: weighted('price'), dryPrice: weighted('price') / dryTotal, q: weighted('q'), m: cws ? 0 : weighted('m'), a: dryValue('a'), s: dryValue('s'), v, fc: (100 - dryValue('a')) * (1 - v / 100), g: estimate('g'), y: estimate('y'), hgi: estimate('hgi'), warnings: warn, size, concentration: t.concentration, total: t.tonnes };
        if (!best || (dryMode || cws ? result.dryPrice < best.dryPrice : result.price < best.price))
            best = result;
    }
    if (!best)
        throw new Error('当前煤源与约束下无可行方案。请检查热值区间、灰硫水限制、逐煤门槛、粒度档及掺入上限；不会输出超标配方。');
    return best;
}
