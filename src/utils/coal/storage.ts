export interface RecordEntry {
    id: string;
    name: string;
    date: string;
    path: string;
    input: unknown;
    output: unknown;
}
export const recordKey = 'kuang:coal:records:v1';
export function readLocal<T>(key: string, fallback: T): T { try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
}
catch {
    return fallback;
} }
export function writeLocal(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }
export function records(): RecordEntry[] { const data = readLocal<unknown>(recordKey, []); return Array.isArray(data) ? data.filter(x => x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.path === 'string' && typeof x.date === 'string') : []; }
export function saveRecord(entry: Omit<RecordEntry, 'id' | 'date'>) { writeLocal(recordKey, [{ ...entry, id: crypto.randomUUID(), date: new Date().toISOString() }, ...records()].slice(0, 100)); }
export function downloadCSV(name: string, rows: (string | number)[][]) { const csv = '\uFEFF' + rows.map(row => row.map(value => { let text = String(value); if (/^[=+@\-\t\r]/.test(text))
    text = "'" + text; return '"' + text.replaceAll('"', '""') + '"'; }).join(',')).join('\r\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export const format = (value: number | string, digits = 2) => typeof value === 'number' ? value.toLocaleString('zh-CN', { maximumFractionDigits: digits, minimumFractionDigits: digits }) : value;
