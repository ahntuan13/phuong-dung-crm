// Hồ sơ một khách: thông tin, lộ trình liệu trình, lịch sử chăm sóc, voucher.
import { S, byId } from '../data/store.js';
import { esc, money, fdate, initials } from '../utils/format.js';
import { custTreatments, custSpend, nextBirthday } from '../domain/calc.js';
import { treatmentCard, logItem, voucherCard, empty } from '../components/cards.js';

export function customerDetailView(id) {
  const c = byId('customers', id);
  if (!c) return `<div class="empty">Không tìm thấy khách hàng này. <button class="btn sm" data-nav="customers">Về danh sách</button></div>`;
  const trs = custTreatments(id);
  const logs = S.careLogs.filter((l) => l.customerId === id).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const vs = S.vouchers.filter((v) => v.customerId === id);
  const nb = nextBirthday(c.dob);

  return `<button class="btn ghost sm" data-nav="customers" style="margin-bottom:10px">‹ Danh sách khách hàng</button>
  <section class="panel" style="margin-bottom:18px">
    <div class="cust-head"><div class="avatar">${esc(initials(c.name))}</div>
      <div style="flex:1;min-width:200px"><h1 style="margin:0">${esc((c.title ? c.title + ' ' : '') + c.name)}</h1>
        <div class="muted">${esc(c.phone || '')}${c.email ? ' · ' + esc(c.email) : ''}</div></div>
      <div class="row"><button class="btn pri" data-act="tr-add" data-cid="${id}">+ Liệu trình</button>
        <button class="btn" data-act="care-add" data-cid="${id}">Ghi hỏi thăm</button>
        <button class="btn" data-act="voucher-add" data-cid="${id}">Tặng voucher</button>
        <button class="btn" data-act="cust-edit" data-id="${id}">Sửa</button></div></div>
    <dl class="info-grid">
      <div><dt>Ngày sinh</dt><dd>${fdate(c.dob)}${nb && nb.days <= 7 ? ` <span class="chip rose">${nb.days === 0 ? 'Sinh nhật hôm nay' : 'Sinh nhật còn ' + nb.days + ' ngày'}</span>` : ''}</dd></div>
      <div><dt>Địa chỉ</dt><dd>${esc(c.address || '—')}</dd></div>
      <div><dt>Nguồn khách</dt><dd>${esc(c.source || '—')}</dd></div>
      <div><dt>Tổng chi tiêu</dt><dd><b>${money(custSpend(id))}</b></dd></div>
      ${c.note ? `<div style="grid-column:1/-1"><dt>Ghi chú (dị ứng, lưu ý…)</dt><dd>${esc(c.note)}</dd></div>` : ''}
    </dl></section>
  <div class="grid cols-detail">
    <section><h2>Liệu trình & lộ trình</h2>${trs.length ? trs.map(treatmentCard).join('') : empty('Khách chưa có liệu trình nào.')}</section>
    <aside class="grid">
      <section class="panel"><h2>Chăm sóc & đánh giá</h2>${logs.length ? `<ul class="list">${logs.map((l) => logItem(l)).join('')}</ul>` : empty('Chưa có ghi nhận hỏi thăm.')}</section>
      <section class="panel"><h2>Voucher</h2>${vs.length ? vs.map(voucherCard).join('') : empty('Chưa có voucher.')}</section>
      <button class="btn danger sm" data-act="cust-del" data-id="${id}" style="justify-self:start">Xóa khách hàng</button>
    </aside>
  </div>`;
}
