// Thêm / sửa / xóa hồ sơ nhân sự.
import { S, save, del } from '../data/store.js';
import { esc, digits, todayISO } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { openForm, confirmBox, formError } from '../components/dialog.js';
import { POSITIONS, DEPARTMENTS, DEFAULT_DEPARTMENT, STAFF_STATUS, nextStaffCode } from '../domain/staff.js';

export function staffForm(p = {}) {
  const isNew = !p.id;
  // hồ sơ cũ có chức vụ ngoài danh sách vẫn hiển thị đúng
  const posList = POSITIONS.includes(p.position) || !p.position ? POSITIONS : [...POSITIONS, p.position];
  const depList = DEPARTMENTS.includes(p.department) || !p.department ? DEPARTMENTS : [...DEPARTMENTS, p.department];

  openForm({
    title: isNew ? 'Thêm nhân sự' : `Sửa hồ sơ ${esc(p.code)}`,
    fields: [
      { k: 'code', label: 'Mã nhân viên *', value: p.code || nextStaffCode(), required: true },
      { k: 'name', label: 'Họ tên *', value: p.name, required: true },
      { k: 'position', label: 'Chức vụ *', type: 'select', value: p.position || 'Bác sĩ', required: true, options: posList.map((x) => [x, x]) },
      { k: 'department', label: 'Bộ phận', type: 'select', value: p.department || DEFAULT_DEPARTMENT[p.position || 'Bác sĩ'], options: depList.map((x) => [x, x]) },
      { k: 'phone', label: 'Số điện thoại', type: 'tel', value: p.phone, ph: '090xxxxxxx' },
      { k: 'email', label: 'Email', type: 'email', value: p.email, ph: 'abc@clinic.vn' },
      { k: 'startDate', label: 'Ngày vào làm', type: 'date', value: p.startDate || todayISO() },
      { k: 'status', label: 'Trạng thái', type: 'select', value: p.status || 'active', options: Object.entries(STAFF_STATUS).map(([k, s]) => [k, s.label]) },
      { k: 'note', label: 'Ghi chú (chứng chỉ hành nghề, chuyên khoa…)', type: 'textarea', value: p.note, full: true },
    ],
    after: (f) => {
      if (!isNew) return;
      f.elements.position.addEventListener('change', () => {
        const dep = DEFAULT_DEPARTMENT[f.elements.position.value];
        if (dep) f.elements.department.value = dep;
      });
    },
    onSave: async (v) => {
      v.code = v.code.toUpperCase();
      if (S.staff.some((x) => x.id !== p.id && (x.code || '').toUpperCase() === v.code)) { formError(`Mã ${v.code} đã được dùng.`); return false; }
      if (v.phone && S.staff.some((x) => x.id !== p.id && digits(x.phone) === digits(v.phone))) { formError('Số điện thoại này đã có trong hồ sơ nhân sự khác.'); return false; }
      if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) { formError('Email chưa đúng định dạng.'); return false; }
      const rec = { ...p, ...v };
      delete rec.role; // bỏ trường role cũ
      await save('staff', rec);
      toast(isNew ? `Đã thêm ${v.code}` : 'Đã lưu hồ sơ');
    },
  });
}

export function deleteStaff(p) {
  confirmBox(`Xóa hồ sơ ${esc(p.code)} – ${esc(p.name)}? Nếu nhân sự chỉ nghỉ việc, nên đổi trạng thái thay vì xóa để giữ lịch sử.`, async () => {
    await del('staff', p.id);
    toast('Đã xóa hồ sơ');
  });
}
