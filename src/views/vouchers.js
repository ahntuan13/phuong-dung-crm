// Quản lý voucher + gợi ý khách cần giữ chân.
import { S } from '../data/store.js';
import { esc } from '../utils/format.js';
import { voucherValid, retentionList } from '../domain/calc.js';
import { voucherCard, empty } from '../components/cards.js';
import { UI } from '../router.js';

export function vouchersView() {
  const tab = UI.vTab;
  let vs = [...S.vouchers].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  vs = tab === 'active' ? vs.filter((v) => voucherValid(v)) : vs.filter((v) => !voucherValid(v));
  const retain = retentionList();

  return `<div class="head"><div><h1>Voucher</h1><p class="sub">Tặng ưu đãi cho dịch vụ khác để khách quay lại.</p></div>
      <button class="btn pri" data-act="voucher-add">+ Tạo voucher</button></div>
    <div class="grid cols-voucher">
      <section><div class="tabs"><button class="${tab === 'active' ? 'on' : ''}" data-tab="vTab:active">Còn hiệu lực</button>
        <button class="${tab !== 'active' ? 'on' : ''}" data-tab="vTab:old">Đã dùng / hết hạn</button></div>
        ${vs.length ? vs.map(voucherCard).join('') : empty('Không có voucher nào.')}</section>
      <aside class="panel"><h2>Gợi ý giữ chân</h2><p class="small muted" style="margin-top:-6px">Khách đã hoàn thành liệu trình, chưa có voucher còn hạn.</p>
        ${retain.length ? `<ul class="list">${retain.map((r) => `<li><div><a href="#" data-open="${r.c.id}"><b>${esc(r.c.name)}</b></a>
          <div class="small muted">${esc(r.reason)}</div></div><button class="btn sm" data-act="voucher-add" data-cid="${r.c.id}">Tặng</button></li>`).join('')}</ul>`
          : empty('Chưa có gợi ý.')}</aside>
    </div>`;
}
