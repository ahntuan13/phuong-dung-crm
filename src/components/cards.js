// Thẻ hiển thị dùng lại ở nhiều màn hình: liệu trình (lộ trình), ghi nhận chăm sóc, voucher.
import { byId } from '../data/store.js';
import { esc, money, fdate } from '../utils/format.js';
import { stars } from '../utils/ui.js';
import { stepsDone, isComplete, medCost, trTotal, trDebt, voucherValid, voucherLabel } from '../domain/calc.js';
import { view } from '../router.js';
import { staffTag } from '../domain/staff.js';

export function treatmentCard(t) {
  const steps = t.steps || [];
  const done = stepsDone(t);
  const nextI = steps.findIndex((s) => !s.done);
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  const stepsHtml = steps.map((s, i) => {
    const cls = s.done ? 'done' : i === nextI ? 'next' : '';
    const meds = (s.meds || []).length
      ? `<div class="meds">${s.meds.map((m) => `${esc(m.name)}: ${esc(m.qty)} ${esc(m.unit || '')} × ${money(m.price)}`).join(' · ')}</div>` : '';
    return `<li class="${cls}"><span class="dot">${s.done ? '✓' : i + 1}</span>
      <div class="step-line"><div><b>${esc(s.title || 'Buổi ' + (i + 1))}</b>
        <span class="small muted">${s.done ? 'Đã làm ' + fdate(s.doneDate) : 'Hẹn ' + fdate(s.planned)}${s.staff ? ' · ' + esc(s.staff) : ''}</span></div>
        <button class="btn sm" data-act="step" data-tr="${t.id}" data-i="${i}">${s.done ? 'Xem / sửa' : 'Cập nhật'}</button></div>
      ${meds}${s.note ? `<div class="meds">${esc(s.note)}</div>` : ''}</li>`;
  }).join('');

  return `<article class="tr">
    <div class="tr-top"><div><h3>${esc(t.serviceName)}</h3>
      <div class="small muted">${fdate(t.startDate)}${t.endDate ? ' → ' + fdate(t.endDate) : ''}${[staffTag('BS', t.doctorId, t.staff), staffTag('Y tá', t.nurseId)].filter(Boolean).map((x) => ' · ' + x).join('')}</div></div>
      <div class="row">${isComplete(t) ? '<span class="chip ok">Hoàn thành</span>' : `<span class="chip rose">Buổi ${done}/${steps.length}</span>`}
        <button class="btn sm ghost" data-act="tr-edit" data-id="${t.id}">Sửa</button></div></div>
    <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
    <ol class="steps">${stepsHtml}</ol>
    <div class="money"><span>Giá dịch vụ <b>${money(t.price)}</b></span><span>Thuốc <b>${money(medCost(t))}</b></span>
      ${+t.discount ? `<span>Voucher <b>−${money(t.discount)}</b></span>` : ''}
      <span>Tổng <b>${money(trTotal(t))}</b></span><span>Đã thu <b>${money(t.paid)}</b></span>
      ${trDebt(t) > 0 ? `<span class="chip warn">Còn nợ ${money(trDebt(t))}</span>` : ''}</div>
  </article>`;
}

export function logItem(l, extra = '') {
  const c = byId('customers', l.customerId);
  const badge = l.rating ? stars(l.rating) : l.kind === 'birthday' ? '<span class="chip rose">Chúc sinh nhật</span>' : '';
  return `<li style="display:block">
    <div class="row" style="justify-content:space-between"><span><b>${fdate(l.date)}</b>
      <span class="small muted">${esc(l.channel || '')}${staffTag('Y tá', l.nurseId, l.staff) ? ' · ' + staffTag('Y tá', l.nurseId, l.staff) : ''}</span></span>${badge}</div>
    ${view.name !== 'customer' && c ? `<div class="small"><a href="#" data-open="${c.id}">${esc(c.name)}</a> ${esc(c.phone || '')}</div>` : ''}
    <div class="small">${esc(l.content || '')}</div>
    ${l.revisit ? `<div class="small"><span class="chip rose">Tái khám ${fdate(l.revisit)}</span></div>` : ''}
    ${l.followUp ? `<div class="small muted">Gọi lại: ${fdate(l.followUp)} ${l.followDone ? '(đã gọi)' : ''}</div>` : ''}
    ${extra}</li>`;
}

export function voucherCard(v) {
  const ok = voucherValid(v);
  const c = v.customerId && byId('customers', v.customerId);
  const sv = v.serviceId && byId('services', v.serviceId);
  const status = v.status === 'used' ? 'Đã dùng' : !ok ? 'Hết hạn' : voucherLabel(v);
  return `<div class="voucher ${ok ? '' : 'used'}">
    <div><code>${esc(v.code)}</code> <span class="chip ${ok ? 'rose' : ''}">${status}</span>
      <div class="small muted">${esc(v.title || '')}${sv ? ' · Áp dụng: ' + esc(sv.name) : ' · Mọi dịch vụ'}${v.expiry ? ' · HSD ' + fdate(v.expiry) : ''}${c && view.name !== 'customer' ? ' · ' + esc(c.name) : ''}</div></div>
    <div class="row">${ok ? `<button class="btn sm" data-act="copy" data-text="${esc(v.code)}">Sao chép mã</button>
      <button class="btn sm" data-act="v-use" data-id="${v.id}">Đánh dấu đã dùng</button>` : ''}
      <button class="btn sm ghost danger" data-act="v-del" data-id="${v.id}">Xóa</button></div>
  </div>`;
}

export const empty = (text) => `<div class="empty">${text}</div>`;
