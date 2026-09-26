// Kho dữ liệu trung tâm. Giao diện chỉ đọc từ S và ghi qua save()/del().
// Muốn đổi nơi lưu (localStorage, REST API, Firebase…) chỉ cần đổi adapter.
import { createLocalAdapter } from './adapters/local.js';
import { toast } from '../utils/ui.js';

export const COLS = ['customers', 'medicines', 'services', 'treatments', 'careLogs', 'vouchers', 'staff', 'settings'];
export const S = Object.fromEntries(COLS.map((c) => [c, []]));

let adapter = null;
let ready = false;
const listeners = new Set();

export const isReady = () => ready;
export const onChange = (fn) => listeners.add(fn);
const emit = () => ready && listeners.forEach((fn) => fn());

export async function initStore(a = createLocalAdapter()) {
  adapter = a;
  await adapter.init(COLS, (col, rows) => { S[col] = rows; emit(); });
  ready = true;
  emit();
  return adapter.label;
}

export async function save(col, obj) {
  const { id, ...body } = obj;
  body.updatedAt = new Date().toISOString();
  if (!body.createdAt) body.createdAt = body.updatedAt;
  try {
    return await adapter.save(col, id, JSON.parse(JSON.stringify(body)));
  } catch (e) {
    toast('Không lưu được, vui lòng thử lại.');
    throw e;
  }
}

export async function del(col, id) {
  try { await adapter.remove(col, id); }
  catch (e) { toast('Không xóa được, vui lòng thử lại.'); throw e; }
}

export const byId = (col, id) => S[col].find((x) => x.id === id);
