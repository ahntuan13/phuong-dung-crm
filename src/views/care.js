// Chăm sóc khách: sinh nhật theo tháng + đánh giá sau cuộc gọi hỏi thăm.
import { S } from '../data/store.js';
import { esc, todayISO } from '../utils/format.js';
import { avgRating } from '../domain/calc.js';
import { logItem, empty } from '../components/cards.js';
import { UI } from '../router.js';

export function careView() {
  const bd = UI.careTab === 'bday';
  const reviews = S.careLogs.filter((l) => l.kind !== 'birthday').length;
  return `<div class="head"><div><h1>Chăm sóc khách hàng</h1><p class="sub">Chúc mừng sinh nhật và ghi nhận đánh giá sau khi gọi hỏi thăm.</p></div>
      ${bd ? `<button class="btn" data-act="tpl">Sửa lời chúc mẫu</button>` : `<button class="btn pri" data-act="care-add">+ Ghi hỏi thăm</button>`}</div>
    <div class="tabs"><button class="${bd ? 'on' : ''}" data-tab="careTab:bday">Sinh nhật</button>
      <button class="${!bd ? 'on' : ''}" data-tab="careTab:rate">Đánh giá & hỏi thăm (${reviews})</button></div>
    ${bd ? birthdayTab() : ratingTab()}`;
}

function birthdayTab() {
  const t = todayISO();
  const m = UI.bMonth || t.slice(5, 7);
  const list = S.customers.filter((c) => c.dob && c.dob.slice(5, 7) === m).sort((a, b) => a.dob.slice(8).localeCompare(b.dob.slice(8)));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  const table = `<div class="panel tablewrap" style="padding:6px 8px"><table>
    <thead><tr><th>Ngày</th><th>Khách hàng</th><th>Điện thoại</th><th>Trạng thái</th><th></th></tr></thead>
    <tbody>${list.map((c) => {
      const isToday = c.dob.slice(5) === t.slice(5);
      const w = (c.wishedYears || []).includes(t.slice(0, 4));
      return `<tr class="${isToday ? 'bday-today' : ''}"><td><b>${c.dob.slice(8)}/${m}</b>${isToday ? ' <span class="chip rose">Hôm nay</span>' : ''}</td>
        <td><a href="#" data-open="${c.id}">${esc(c.name)}</a></td><td>${esc(c.phone || '')}</td>
        <td>${w ? '<span class="chip ok">Đã chúc năm nay</span>' : '<span class="chip">Chưa chúc</span>'}</td>
        <td class="num"><button class="btn sm ${w ? '' : 'rose'}" data-act="wish" data-id="${c.id}">${w ? 'Chúc lại' : 'Gửi lời chúc'}</button></td></tr>`;
    }).join('')}</tbody></table></div>`;

  return `<div class="row" style="margin-bottom:14px"><label class="f" style="flex-direction:row;align-items:center;gap:8px">Tháng
      <select data-change="bMonth" style="padding:7px 12px;border:1px solid var(--line);border-radius:999px;background:var(--surface)">
      ${months.map((x) => `<option value="${x}" ${x === m ? 'selected' : ''}>Tháng ${+x}</option>`).join('')}</select></label>
      <span class="muted small">${list.length} khách có sinh nhật</span></div>
    ${list.length ? table : empty('Không có khách nào sinh trong tháng này. Hãy nhập ngày sinh trong hồ sơ khách.')}`;
}

function ratingTab() {
  const f = UI.rateFilter;
  let logs = S.careLogs.filter((l) => l.kind !== 'birthday');
  if (f === 'low') logs = logs.filter((l) => l.rating && +l.rating <= 3);
  if (f === 'follow') logs = logs.filter((l) => l.followUp && !l.followDone);
  logs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const { avg, count, list } = avgRating();
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: list.filter((l) => +l.rating === n).length }));
  const filters = [['all', 'Tất cả'], ['low', 'Chưa hài lòng (≤3 sao)'], ['follow', 'Cần gọi lại']];

  const items = logs.map((l) => logItem(l, `<div class="row" style="margin-top:6px">
    ${l.followUp && !l.followDone ? `<button class="btn sm" data-act="follow-done" data-id="${l.id}">Đã gọi lại</button>` : ''}
    <button class="btn sm ghost" data-act="care-edit" data-id="${l.id}">Sửa</button>
    <button class="btn sm ghost danger" data-act="care-del" data-id="${l.id}">Xóa</button></div>`)).join('');

  return `<div class="grid cols-rate">
    <section><div class="row" style="margin-bottom:12px">${filters.map(([k, l]) => `<button class="btn sm ${f === k ? 'pri' : ''}" data-tab="rateFilter:${k}">${l}</button>`).join('')}</div>
      ${logs.length ? `<div class="panel"><ul class="list">${items}</ul></div>` : empty('Chưa có ghi nhận nào.')}</section>
    <aside class="panel"><h2>Mức hài lòng</h2>
      <p style="margin:0 0 10px"><b style="font:600 34px var(--serif);color:var(--brand-deep)">${avg ? avg.toFixed(1) : '—'}</b> <span class="muted">/ 5 · ${count} lượt</span></p>
      ${dist.map((d) => `<div class="row small" style="gap:8px;margin-bottom:4px"><span style="width:28px">${d.n}★</span>
        <div class="progress" style="flex:1;margin:0"><i style="width:${count ? (d.c / count) * 100 : 0}%;background:var(--gold)"></i></div>
        <span style="width:22px;text-align:right">${d.c}</span></div>`).join('')}</aside>
  </div>`;
}
