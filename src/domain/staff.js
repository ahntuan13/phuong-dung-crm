// Danh mục hồ sơ nhân sự + tiện ích chọn bác sĩ / y tá trong các form.
import { S, byId } from '../data/store.js';
import { esc } from '../utils/format.js';

export const POSITIONS = ['Bác sĩ', 'Y tá', 'Lễ tân', 'Kỹ thuật viên', 'Tư vấn viên'];
export const DEPARTMENTS = ['Hành chính', 'Kỹ thuật', 'Dịch vụ'];

/** Gợi ý bộ phận khi chọn chức vụ (vẫn sửa được) */
export const DEFAULT_DEPARTMENT = {
  'Bác sĩ': 'Kỹ thuật', 'Y tá': 'Kỹ thuật', 'Kỹ thuật viên': 'Kỹ thuật', 'Lễ tân': 'Hành chính', 'Tư vấn viên': 'Dịch vụ',
};

export const STAFF_STATUS = {
  active:   { label: 'Đang làm việc', chip: 'ok' },
  leave:    { label: 'Tạm nghỉ',      chip: 'warn' },
  resigned: { label: 'Đã nghỉ việc',  chip: '' },
};

/** Mã kế tiếp dạng NV0001, NV0002… */
export function nextStaffCode() {
  const max = S.staff.reduce((m, p) => {
    const n = /^NV(\d+)$/i.exec(p.code || '');
    return n ? Math.max(m, +n[1]) : m;
  }, 0);
  return 'NV' + String(max + 1).padStart(4, '0');
}

const KIND_MATCH = {
  doctor: (p) => p.position === 'Bác sĩ',
  nurse: (p) => /y tá|điều dưỡng/i.test(p.position || ''),
};

/** Danh sách chọn cho ô select: người đang làm đúng chức vụ + người đang được chọn (dù đã nghỉ) */
export function staffOptions(kind, currentId) {
  const list = S.staff
    .filter((p) => KIND_MATCH[kind](p) && (p.status !== 'resigned' || p.id === currentId))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const empty = list.length ? '— Chọn —' : '— Chưa có hồ sơ, thêm ở mục Hồ sơ —';
  return [['', empty], ...list.map((p) => [p.id, `${p.name} (${p.code})${p.status === 'resigned' ? ' – đã nghỉ' : ''}`])];
}

export const staffName = (id) => byId('staff', id)?.name || '';

export const staffTag = (label, id, fallback) => {
  const n = staffName(id) || fallback;
  return n ? `${label}: ${esc(n)}` : '';
};
