// Thêm / sửa thuốc và dịch vụ trong danh mục.
import { S, save } from '../data/store.js';
import { norm } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { openForm, confirmBox } from '../components/dialog.js';
import { MED_GROUPS, UNITS, groupIcon } from '../domain/catalog.js';
import { SEED_MEDICINES, SEED_SERVICES } from '../data/seed.js';

export function medForm(m = {}) {
  openForm({
    title: m.id ? 'Sửa thuốc' : 'Thêm thuốc / sản phẩm',
    fields: [
      { k: 'group', label: 'Nhóm *', type: 'select', value: m.group || 'Thuốc gây tê', required: true, options: MED_GROUPS.map((g) => [g.name, `${g.icon} ${g.name}`]) },
      { k: 'unit', label: 'Đơn vị tính (ĐVT)', type: 'select', value: m.unit || 'Hộp', options: (UNITS.includes(m.unit) || !m.unit ? UNITS : [...UNITS, m.unit]).map((x) => [x, x]) },
      { k: 'name', label: 'Tên thuốc / sản phẩm *', value: m.name, required: true, full: true },
      { k: 'price', label: 'Đơn giá (₫) *', type: 'number', min: 0, step: 1000, value: m.price, required: true },
      { k: 'note', label: 'Ghi chú (xuất xứ, hãng…)', type: 'textarea', value: m.note, full: true },
    ],
    onSave: async (v) => {
      // giữ biểu tượng riêng của sản phẩm nếu không đổi nhóm
      const icon = m.icon && m.group === v.group ? m.icon : groupIcon(v.group);
      await save('medicines', { ...m, ...v, icon });
      toast('Đã lưu thuốc');
    },
  });
}

export function svcForm(s = {}) {
  openForm({
    title: s.id ? 'Sửa dịch vụ' : 'Thêm dịch vụ',
    fields: [
      { k: 'name', label: 'Tên dịch vụ *', value: s.name, required: true, full: true },
      { k: 'price', label: 'Giá niêm yết (₫) *', type: 'number', min: 0, step: 1000, value: s.price, required: true },
      { k: 'sessions', label: 'Số buổi của liệu trình', type: 'number', min: 1, value: s.sessions || 1 },
      { k: 'interval', label: 'Mỗi buổi cách nhau (ngày)', type: 'number', min: 0, value: s.interval ?? 14 },
      { k: 'desc', label: 'Mô tả', type: 'textarea', value: s.desc, full: true },
    ],
    onSave: async (v) => { await save('services', { ...s, ...v }); toast('Đã lưu dịch vụ'); },
  });
}

/** Nạp danh mục mẫu cho demo: chỉ thêm mục chưa có (so theo tên, không phân biệt dấu) */
export function loadSampleCatalog() {
  const hasMed = new Set(S.medicines.map((m) => norm(m.name)));
  const hasSvc = new Set(S.services.map((s) => norm(s.name)));
  const meds = SEED_MEDICINES.filter((m) => !hasMed.has(norm(m.name)));
  const svcs = SEED_SERVICES.filter((s) => !hasSvc.has(norm(s.name)));
  if (!meds.length && !svcs.length) { toast('Danh mục mẫu đã có đủ'); return; }
  confirmBox(`Thêm ${meds.length} thuốc / vật tư và ${svcs.length} dịch vụ mẫu (giá demo)? Các mục đã có sẽ giữ nguyên.`, async () => {
    for (const m of meds) await save('medicines', { ...m, note: 'Dữ liệu demo' });
    for (const s of svcs) await save('services', { ...s });
    toast(`Đã thêm ${meds.length} thuốc và ${svcs.length} dịch vụ mẫu`);
  }, 'Nạp dữ liệu');
}
