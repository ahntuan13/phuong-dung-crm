// Cập nhật một buổi trong liệu trình: đã làm chưa, thuốc sử dụng (liều lượng + đơn giá theo khách), ghi chú.
import { S, byId, save } from '../data/store.js';
import { esc, money, todayISO } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { openForm } from '../components/dialog.js';
import { lastMedPrice } from '../domain/calc.js';
import { staffName } from '../domain/staff.js';
import { sortMeds } from '../domain/catalog.js';

export function stepForm(trId, i) {
  const t = byId('treatments', trId);
  if (!t) return;
  const s = { ...t.steps[i] };
  const c = byId('customers', t.customerId);

  // nhóm thuốc theo <optgroup> cho dễ chọn
  const medOpts = (sel) => {
    const groups = {};
    sortMeds(S.medicines).forEach((m) => { (groups[m.group || 'Khác'] ||= []).push(m); });
    return Object.entries(groups).map(([g, list]) => `<optgroup label="${esc(g)}">${list.map((m) =>
      `<option value="${m.id}" ${m.id === sel ? 'selected' : ''}>${esc(m.icon || '')} ${esc(m.name)}${m.unit ? ' (' + esc(m.unit) + ')' : ''}</option>`).join('')}</optgroup>`).join('');
  };
  const rowHtml = (m = {}) => `<div class="medrow">
    <select data-m="medId"><option value="">— Chọn thuốc —</option>${medOpts(m.medId)}</select>
    <input data-m="qty" type="number" step="any" min="0" placeholder="Liều lượng" value="${esc(m.qty ?? '')}">
    <input data-m="price" type="number" step="1000" min="0" placeholder="Đơn giá" value="${esc(m.price ?? '')}">
    <button type="button" class="btn sm ghost danger" data-rm aria-label="Bỏ dòng">✕</button></div>`;

  openForm({
    title: `${esc(c?.name || '')} · ${esc(t.serviceName)} · ${esc(s.title || 'Buổi ' + (i + 1))}`,
    fields: [
      { k: 'done', label: 'Đã thực hiện buổi này', type: 'checkbox', value: s.done, full: true },
      { k: 'title', label: 'Tên bước', value: s.title || 'Buổi ' + (i + 1) },
      { k: 'staff', label: 'Nhân viên thực hiện', value: s.staff || staffName(t.nurseId) || staffName(t.doctorId) || t.staff || '' },
      { k: 'planned', label: 'Ngày hẹn', type: 'date', value: s.planned || '' },
      { k: 'doneDate', label: 'Ngày thực hiện', type: 'date', value: s.doneDate || '' },
      { type: 'html', html: `<div class="full">
          <div class="small muted" style="font-weight:500;margin-bottom:6px">Thuốc sử dụng — liều lượng & đơn giá cho khách này</div>
          <div id="medRows">${(s.meds || []).map(rowHtml).join('')}</div>
          <button type="button" class="btn sm" id="addMed">+ Thêm thuốc</button>
          ${S.medicines.length ? '' : ' <span class="small muted">Chưa có thuốc trong danh mục.</span>'}
          <div class="small" style="margin-top:8px">Tiền thuốc buổi này: <b id="medSum">0 ₫</b></div></div>` },
      { k: 'note', label: 'Ghi chú buổi (phản ứng, tình trạng da…)', type: 'textarea', value: s.note || '', full: true },
    ],
    after: (f) => {
      const box = f.querySelector('#medRows');
      const sum = () => {
        let x = 0;
        box.querySelectorAll('.medrow').forEach((r) => { x += (+r.querySelector('[data-m=qty]').value || 0) * (+r.querySelector('[data-m=price]').value || 0); });
        f.querySelector('#medSum').textContent = money(x);
      };
      f.querySelector('#addMed').onclick = () => { box.insertAdjacentHTML('beforeend', rowHtml()); sum(); };
      box.addEventListener('click', (e) => { if (e.target.closest('[data-rm]')) { e.target.closest('.medrow').remove(); sum(); } });
      box.addEventListener('input', sum);
      box.addEventListener('change', (e) => {
        if (e.target.dataset.m === 'medId' && e.target.value) {
          e.target.closest('.medrow').querySelector('[data-m=price]').value = lastMedPrice(t.customerId, e.target.value);
          sum();
        }
      });
      f.elements.done.addEventListener('change', () => { if (f.elements.done.checked && !f.elements.doneDate.value) f.elements.doneDate.value = todayISO(); });
      sum();
    },
    onSave: async (v, f) => {
      const meds = [...f.querySelectorAll('#medRows .medrow')].map((r) => {
        const id = r.querySelector('[data-m=medId]').value;
        const md = byId('medicines', id);
        return { medId: id, name: md?.name || '', unit: md?.unit || '', qty: +r.querySelector('[data-m=qty]').value || 0, price: +r.querySelector('[data-m=price]').value || 0 };
      }).filter((m) => m.medId);
      if (v.done && !v.doneDate) v.doneDate = todayISO();
      const steps = [...t.steps];
      steps[i] = { ...s, ...v, meds };
      await save('treatments', { ...t, steps });
      toast('Đã cập nhật buổi');
      if (steps.every((x) => x.done) && !t.steps.every((x) => x.done))
        setTimeout(() => toast('Liệu trình hoàn thành — cân nhắc tặng voucher giữ chân khách'), 2800);
    },
  });
}
