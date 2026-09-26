// Adapter lưu dữ liệu vào localStorage của trình duyệt (dùng khi test / chạy offline).
import { uid } from '../../utils/format.js';

const KEY = 'pd-crm-v1';

export function createLocalAdapter() {
  let data = {};
  let emit = () => {};
  const persist = () => localStorage.setItem(KEY, JSON.stringify(data));

  return {
    label: 'Chế độ cục bộ: dữ liệu chỉ lưu trên trình duyệt này.',

    async init(cols, onData) {
      emit = onData;
      try { data = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { data = {}; }
      cols.forEach((c) => { data[c] = data[c] || []; emit(c, [...data[c]]); });
    },

    async save(col, id, body) {
      const nid = id || uid();
      const rec = { ...body, id: nid };
      const i = data[col].findIndex((x) => x.id === nid);
      if (i >= 0) data[col][i] = rec; else data[col].push(rec);
      persist();
      emit(col, [...data[col]]);
      return nid;
    },

    async remove(col, id) {
      data[col] = data[col].filter((x) => x.id !== id);
      persist();
      emit(col, [...data[col]]);
    },
  };
}
