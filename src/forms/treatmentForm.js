// Tạo / sửa liệu trình.
// Bố cục: Khách & dịch vụ → Bác sĩ / Y tá → Thời gian (bắt đầu, kết thúc, tổng số buổi) → Thanh toán.
import { S, byId, save, del } from '../data/store.js';
import { esc, money, todayISO, addDays } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { dlg, dform, openForm, confirmBox, formError, customerOptions } from '../components/dialog.js';
import { voucherValid, voucherLabel, voucherDiscount, reconcileSteps, stepsDone } from '../domain/calc.js';
import { staffOptions, staffName } from '../domain/staff.js';

export function treatmentForm(t = {}, cid) {
  const isNew = !t.id;
  cid = cid || t.customerId;
  const svcOpts = [['', '— Chọn dịch vụ —'], ...S.services.map((s) => [s.id, `${s.name} (${money(s.price)})`])];
  const vOpts = () => [['', 'Không dùng'], ...S.vouchers
    .filter((v) => voucherValid(v, dform.elements.customerId?.value, dform.elements.serviceId?.value) || v.id === t.voucherId)
    .map((v) => [v.id, `${v.code} – ${voucherLabel(v)}`])];

  const start = t.startDate || todayISO();
  const oldSteps = t.steps || [];
  const doneCount = stepsDone(t);

  openForm({
    title: isNew ? 'Thêm liệu trình' : 'Sửa liệu trình',
    fields: [
      { type: 'section', label: 'Khách hàng & dịch vụ' },
      { k: 'customerId', label: 'Khách hàng *', type: 'select', options: customerOptions(S.customers), value: cid || '', required: true },
      { k: 'serviceId', label: 'Dịch vụ *', type: 'select', options: svcOpts, value: t.serviceId || '', required: true },

      { type: 'section', label: 'Nhân sự thực hiện' },
      { k: 'doctorId', label: 'Bác sĩ phụ trách', type: 'select', options: staffOptions('doctor', t.doctorId), value: t.doctorId || '' },
      { k: 'nurseId', label: 'Điều dưỡng / Y tá', type: 'select', options: staffOptions('nurse', t.nurseId), value: t.nurseId || '' },

      { type: 'section', label: 'Thời gian liệu trình' },
      { k: 'startDate', label: 'Ngày bắt đầu *', type: 'date', value: start, required: true, w: 'third' },
      { k: 'endDate', label: 'Ngày kết thúc *', type: 'date', value: t.endDate || oldSteps[oldSteps.length - 1]?.planned || start, required: true, w: 'third' },
      { k: 'sessions', label: 'Tổng số buổi *', type: 'number', min: Math.max(1, doneCount), value: oldSteps.length || 1, required: true, w: 'third' },
      { type: 'hint', label: 'Ngày hẹn các buổi được chia đều từ ngày bắt đầu đến ngày kết thúc. Buổi đã làm giữ nguyên.' },

      { type: 'section', label: 'Thanh toán' },
      { k: 'price', label: 'Giá cho khách này (₫)', type: 'number', min: 0, step: 1000, value: t.price ?? '', w: 'third' },
      { k: 'voucherId', label: 'Voucher áp dụng', type: 'select', options: [['', 'Không dùng']], value: t.voucherId || '', w: 'third' },
      { type: 'readonly', id: 'roDiscount', label: 'Giảm từ voucher', w: 'third' },
      { type: 'readonly', id: 'roNet', label: 'Số tiền phải trả', w: 'third', hl: true },
      { k: 'paid', label: 'Đã thanh toán (₫)', type: 'number', min: 0, step: 1000, value: t.paid ?? 0, w: 'third' },
      { type: 'readonly', id: 'roDebt', label: 'Số tiền còn lại', w: 'third', hl: true },
      { type: 'hint', label: 'Tiền thuốc ghi ở từng buổi sẽ được cộng thêm vào tổng của liệu trình.' },

      { k: 'note', label: 'Ghi chú', type: 'textarea', value: t.note || '', full: true },
    ],
    after: (f) => {
      const el = f.elements;
      if (!S.services.length) formError('Chưa có dịch vụ nào — hãy thêm ở mục “Thuốc & dịch vụ” trước.');

      const refreshV = (keep) => {
        const cur = keep ?? el.voucherId.value;
        el.voucherId.innerHTML = vOpts().map((o) => `<option value="${esc(o[0])}" ${o[0] === cur ? 'selected' : ''}>${esc(o[1])}</option>`).join('');
      };
      const calcMoney = () => {
        const price = +el.price.value || 0;
        const disc = voucherDiscount(byId('vouchers', el.voucherId.value), price);
        const net = price - disc;
        f.querySelector('#roDiscount').value = disc ? '−' + money(disc) : money(0);
        f.querySelector('#roNet').value = money(net);
        f.querySelector('#roDebt').value = money(Math.max(0, net - (+el.paid.value || 0)));
      };
      refreshV(t.voucherId || '');
      calcMoney();

      el.serviceId.addEventListener('change', () => {
        const s = byId('services', el.serviceId.value);
        if (s) {
          el.price.value = s.price || 0;
          if (isNew) {
            el.sessions.value = s.sessions || 1;
            el.endDate.value = addDays(el.startDate.value || todayISO(), ((s.sessions || 1) - 1) * (s.interval ?? 14));
          }
        }
        refreshV(); calcMoney();
      });
      el.customerId.addEventListener('change', () => { refreshV(); calcMoney(); });
      el.startDate.addEventListener('change', () => { if (el.endDate.value < el.startDate.value) el.endDate.value = el.startDate.value; });
      [el.price, el.paid].forEach((x) => x.addEventListener('input', calcMoney));
      el.voucherId.addEventListener('change', calcMoney);
    },
    onSave: async (v) => {
      if (v.endDate < v.startDate) { formError('Ngày kết thúc phải sau ngày bắt đầu.'); return false; }
      const n = Math.max(1, +v.sessions || 1);
      if (n < doneCount) { formError(`Đã làm ${doneCount} buổi, tổng số buổi không thể ít hơn.`); return false; }

      const s = byId('services', v.serviceId);
      const rec = { ...t, ...v, sessions: undefined, serviceName: s ? s.name : t.serviceName || '' };
      delete rec.sessions;
      if (rec.price === '') rec.price = s ? s.price : 0;
      const vch = v.voucherId && byId('vouchers', v.voucherId);
      rec.discount = voucherDiscount(vch, rec.price);
      rec.staff = staffName(v.doctorId) || t.staff || ''; // tên hiển thị nhanh

      const timingChanged = isNew || n !== oldSteps.length || v.startDate !== t.startDate || v.endDate !== t.endDate;
      rec.steps = timingChanged ? reconcileSteps(oldSteps, n, v.startDate, v.endDate) : oldSteps;

      const id = await save('treatments', rec);
      if (vch && vch.status !== 'used' && t.voucherId !== vch.id)
        await save('vouchers', { ...vch, status: 'used', usedAt: todayISO(), treatmentId: id });
      if (t.voucherId && t.voucherId !== v.voucherId) {
        const old = byId('vouchers', t.voucherId);
        if (old) await save('vouchers', { ...old, status: 'active', usedAt: '', treatmentId: '' });
      }
      toast(isNew ? 'Đã tạo liệu trình' : 'Đã lưu liệu trình');
    },
  });

  if (!isNew) {
    const footer = dform.querySelector('.dlg-f');
    const delBtn = Object.assign(document.createElement('button'), { type: 'button', className: 'btn danger', textContent: 'Xóa liệu trình' });
    delBtn.style.marginRight = 'auto';
    delBtn.onclick = () => {
      dlg.close();
      confirmBox(`Xóa liệu trình “${esc(t.serviceName)}”? Toàn bộ lịch sử các buổi sẽ mất.`, () => del('treatments', t.id));
    };
    footer.prepend(delBtn);
  }
}
