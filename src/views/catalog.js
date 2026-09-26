// Danh mục thuốc / vật tư (theo nhóm) & dịch vụ.
import { S } from '../data/store.js';
import { esc, money, norm } from '../utils/format.js';
import { MED_GROUPS, groupIcon, sortMeds } from '../domain/catalog.js';
import { empty } from '../components/cards.js';
import { UI } from '../router.js';

export function catalogView() {
  const med = UI.catTab === 'med';
  const svs = [...S.services].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const q = norm(UI.medQ);
  const meds = sortMeds(S.medicines)
    .filter((m) => UI.medGroup === 'all' || (m.group || 'Khác') === UI.medGroup)
    .filter((m) => !q || norm(m.name).includes(q));
  const usedGroups = MED_GROUPS.filter((g) => S.medicines.some((m) => (m.group || 'Khác') === g.name));

  const medTable = meds.length ? `<div class="panel tablewrap" style="padding:6px 8px"><table>
    <thead><tr><th style="width:44px"></th><th>Nhóm</th><th>Tên thuốc / sản phẩm</th><th>ĐVT</th><th class="num">Đơn giá</th><th>Ghi chú</th><th></th></tr></thead>
    <tbody>${meds.map((m) => `<tr>
      <td style="font-size:20px;text-align:center">${esc(m.icon || groupIcon(m.group))}</td>
      <td><span class="chip rose">${esc(m.group || 'Khác')}</span></td>
      <td><b>${esc(m.name)}</b></td><td>${esc(m.unit || '')}</td><td class="num">${money(m.price)}</td>
      <td class="small muted">${esc(m.note || '')}</td>
      <td class="num" style="white-space:nowrap"><button class="btn sm ghost" data-act="med-edit" data-id="${m.id}">Sửa</button>
      <button class="btn sm ghost danger" data-act="med-del" data-id="${m.id}">Xóa</button></td></tr>`).join('')}</tbody></table></div>`
    : empty(S.medicines.length ? 'Không có thuốc phù hợp bộ lọc.' : 'Chưa có thuốc nào. Bấm “Nạp danh mục mẫu” để thêm nhanh dữ liệu demo.');

  const medFilters = `<div class="row" style="margin-bottom:14px">
      <input id="medQ" class="search" placeholder="Tìm tên thuốc / sản phẩm" value="${esc(UI.medQ)}" data-input="medQ">
      <select data-change="medGroup" style="padding:10px 14px;border:1px solid var(--line);border-radius:999px;background:var(--surface)">
        <option value="all">Tất cả nhóm (${S.medicines.length})</option>
        ${usedGroups.map((g) => `<option value="${esc(g.name)}" ${UI.medGroup === g.name ? 'selected' : ''}>${g.icon} ${esc(g.name)} (${S.medicines.filter((m) => (m.group || 'Khác') === g.name).length})</option>`).join('')}
      </select></div>`;

  const svcTable = svs.length ? `<div class="panel tablewrap" style="padding:6px 8px"><table>
    <thead><tr><th>Dịch vụ</th><th>Số buổi</th><th>Cách nhau</th><th class="num">Giá niêm yết</th><th></th></tr></thead>
    <tbody>${svs.map((s) => `<tr><td><b>${esc(s.name)}</b><div class="small muted">${esc(s.desc || '')}</div></td>
      <td>${esc(s.sessions || 1)}</td><td>${s.interval ? esc(s.interval) + ' ngày' : '—'}</td><td class="num">${money(s.price)}</td>
      <td class="num" style="white-space:nowrap"><button class="btn sm ghost" data-act="svc-edit" data-id="${s.id}">Sửa</button>
      <button class="btn sm ghost danger" data-act="svc-del" data-id="${s.id}">Xóa</button></td></tr>`).join('')}</tbody></table></div>`
    : empty('Chưa có dịch vụ nào. Bấm “Nạp danh mục mẫu” để thêm nhanh dữ liệu demo.');

  return `<div class="head"><div><h1>Thuốc & dịch vụ</h1><p class="sub">Bảng giá niêm yết. Giá cho từng khách có thể điều chỉnh riêng khi ghi liệu trình.</p></div>
      <div class="row"><button class="btn" data-act="seed-catalog">Nạp danh mục mẫu</button>
        <button class="btn pri" data-act="${med ? 'med-add' : 'svc-add'}">+ ${med ? 'Thêm thuốc' : 'Thêm dịch vụ'}</button></div></div>
    <div class="tabs" role="tablist"><button class="${med ? 'on' : ''}" data-tab="catTab:med">Danh sách thuốc (${S.medicines.length})</button>
      <button class="${!med ? 'on' : ''}" data-tab="catTab:svc">Dịch vụ (${svs.length})</button></div>
    ${med ? medFilters + medTable : svcTable}`;
}
