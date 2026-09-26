// Tra cứu nhanh lộ trình theo SĐT hoặc tên.
import { S } from '../data/store.js';
import { esc, norm, digits, initials } from '../utils/format.js';
import { custTreatments } from '../domain/calc.js';
import { treatmentCard, empty } from '../components/cards.js';
import { UI } from '../router.js';

export function lookupView() {
  const q = UI.lookQ.trim();
  let res = [];
  if (q) {
    const n = norm(q), d = digits(q);
    res = S.customers.filter((c) => (d.length >= 3 && digits(c.phone).includes(d)) || (n.length >= 2 && norm(c.name).includes(n)));
  }
  const results = !q ? '' : res.length ? res.slice(0, 10).map((c) => {
    const trs = custTreatments(c.id);
    return `<section style="margin-bottom:28px">
      <div class="row" style="justify-content:space-between;margin-bottom:10px">
        <div class="row"><div class="avatar" style="width:44px;height:44px;font-size:18px">${esc(initials(c.name))}</div>
          <div><b style="font-size:16px">${esc(c.name)}</b><div class="small muted">${esc(c.phone || '')}</div></div></div>
        <button class="btn sm" data-open="${c.id}">Hồ sơ khách</button></div>
      ${trs.length ? trs.map(treatmentCard).join('') : empty('Khách chưa có liệu trình.')}</section>`;
  }).join('') : empty('Không tìm thấy khách hàng phù hợp.');

  return `<h1>Tra cứu lộ trình</h1><p class="sub">Nhập số điện thoại hoặc tên để xem khách đang ở bước nào của liệu trình.</p>
    <input id="lookQ" class="search big" placeholder="VD: 0909 123 456 hoặc Nguyễn Thị Lan" value="${esc(UI.lookQ)}" data-input="lookQ" autocomplete="off">
    <div style="margin-top:20px">${results}</div>`;
}
