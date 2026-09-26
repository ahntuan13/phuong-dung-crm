// Tạo voucher (giữ chân, sinh nhật, giới thiệu…). Trả về Promise với voucher vừa tạo.
import { S, save } from '../data/store.js';
import { todayISO, addDays } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { openForm, formError, customerOptions } from '../components/dialog.js';
import { custTreatments } from '../domain/calc.js';

export function genCode(prefix = 'PD') {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return `${prefix}-${s}`;
}

export function voucherForm(cid, preset = {}) {
  const used = new Set(custTreatments(cid).map((t) => t.serviceId));
  const svcOpts = [['', 'Mọi dịch vụ'], ...S.services.map((s) => [s.id, s.name + (cid && used.has(s.id) ? ' (đã dùng)' : '')])];

  return new Promise((resolve) => openForm({
    title: 'Tạo voucher',
    saveLabel: 'Tạo voucher',
    fields: [
      { k: 'code', label: 'Mã voucher *', value: genCode(), required: true },
      { k: 'title', label: 'Tên chương trình', value: preset.title || 'Ưu đãi quay lại', ph: 'Sinh nhật, Giữ chân, Giới thiệu bạn…' },
      { k: 'customerId', label: 'Tặng cho khách', type: 'select', options: customerOptions(S.customers, 'Không gán (dùng cho bất kỳ ai)'), value: cid || '', full: true },
      { k: 'serviceId', label: 'Áp dụng cho dịch vụ', type: 'select', options: svcOpts, value: '', full: true },
      { k: 'type', label: 'Loại giảm', type: 'select', value: 'percent', options: [['percent', 'Giảm theo %'], ['amount', 'Giảm số tiền']] },
      { k: 'value', label: 'Mức giảm *', type: 'number', min: 0, value: preset.value ?? 15, required: true },
      { k: 'expiry', label: 'Hạn sử dụng', type: 'date', value: addDays(todayISO(), preset.days ?? 60) },
      { k: 'note', label: 'Ghi chú', value: '' },
    ],
    onSave: async (v) => {
      if (S.vouchers.some((x) => x.code === v.code)) { formError('Mã này đã tồn tại.'); return false; }
      const id = await save('vouchers', { ...v, status: 'active' });
      toast('Đã tạo voucher ' + v.code);
      resolve({ ...v, id });
    },
  }));
}
