// Danh sách khách hàng + tìm kiếm.
import { S } from '../data/store.js';
import { esc, money, fdate, norm, digits } from '../utils/format.js';
import { custTreatments, isComplete, custSpend } from '../domain/calc.js';
import { empty } from '../components/cards.js';
import { UI } from '../router.js';

export function customersView() {
  const q = norm(UI.custQ);
  const d = digits(UI.custQ);
  const rows = S.customers
    .filter((c) => !q || norm(c.name).includes(q) || (d && digits(c.phone).includes(d)) || norm(c.email).includes(q))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const table = `<div class="panel tablewrap" style="padding:6px 8px"><table>
    <thead><tr><th>Khách hàng</th><th>Điện thoại</th><th>Sinh nhật</th><th>Liệu trình</th><th class="num">Tổng chi tiêu</th></tr></thead>
    <tbody>${rows.map((c) => {
      const trs = custTreatments(c.id); const run = trs.filter((x) => !isComplete(x)).length;
      return `<tr class="click" tabindex="0" data-open="${c.id}"><td><b>${esc(c.name)}</b><div class="small muted">${esc(c.email || '')}</div></td>
        <td>${esc(c.phone || '')}</td><td>${c.dob ? fdate(c.dob).slice(0, 5) : '—'}</td>
        <td>${trs.length ? `${trs.length} <span class="chip ${run ? 'rose' : 'ok'}">${run ? run + ' đang làm' : 'hoàn thành'}</span>` : '<span class="muted">—</span>'}</td>
        <td class="num">${money(custSpend(c.id))}</td></tr>`;
    }).join('')}</tbody></table></div>`;

  return `<div class="head"><div><h1>Khách hàng</h1><p class="sub">${S.customers.length} khách trong danh sách</p></div>
      <button class="btn pri" data-act="cust-add">+ Thêm khách hàng</button></div>
    <input id="custQ" class="search" placeholder="Tìm theo tên, số điện thoại hoặc email" value="${esc(UI.custQ)}" data-input="custQ" style="margin-bottom:14px">
    ${rows.length ? table : empty(S.customers.length ? 'Không tìm thấy khách phù hợp.' : 'Chưa có khách hàng nào. Bấm “Thêm khách hàng” để bắt đầu.')}`;
}
