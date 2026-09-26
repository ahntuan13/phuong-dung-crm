// Hồ sơ nhân sự: bác sĩ, y tá, lễ tân, kỹ thuật viên, tư vấn viên.
import { S } from '../data/store.js';
import { esc, fdate, norm, digits, initials } from '../utils/format.js';
import { POSITIONS, STAFF_STATUS } from '../domain/staff.js';
import { empty } from '../components/cards.js';
import { UI } from '../router.js';

export function staffView() {
  const q = norm(UI.staffQ);
  const d = digits(UI.staffQ);
  const rows = S.staff
    .filter((p) => UI.staffPos === 'all' || p.position === UI.staffPos)
    .filter((p) => UI.staffStatus === 'all' || (UI.staffStatus === 'active' ? p.status !== 'resigned' : p.status === 'resigned'))
    .filter((p) => !q || norm(p.name).includes(q) || norm(p.code).includes(q) || norm(p.email).includes(q) || (d.length >= 3 && digits(p.phone).includes(d)))
    .sort((a, b) => (a.code || '').localeCompare(b.code || ''));

  const working = S.staff.filter((p) => p.status === 'active');
  const tabs = [['all', `Tất cả (${S.staff.length})`], ...POSITIONS.map((k) => [k, `${k} (${S.staff.filter((p) => p.position === k).length})`])];

  const table = `<div class="panel tablewrap" style="padding:6px 8px"><table>
    <thead><tr><th>Mã NV</th><th>Họ tên</th><th>Chức vụ</th><th>Bộ phận</th><th>Liên hệ</th><th>Ngày vào làm</th><th>Trạng thái</th><th></th></tr></thead>
    <tbody>${rows.map((p) => {
      const st = STAFF_STATUS[p.status] || STAFF_STATUS.active;
      return `<tr>
        <td><b>${esc(p.code)}</b></td>
        <td><div class="row" style="flex-wrap:nowrap"><span class="avatar" style="width:34px;height:34px;font-size:15px;border-width:2px">${esc(initials(p.name))}</span><b>${esc(p.name)}</b></div></td>
        <td><span class="chip rose">${esc(p.position || '')}</span></td><td>${esc(p.department || '')}</td>
        <td class="small">${p.phone ? `<a href="tel:${digits(p.phone)}">${esc(p.phone)}</a>` : ''}${p.email ? `<div><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>` : ''}</td>
        <td>${fdate(p.startDate)}</td>
        <td><span class="chip ${st.chip}">${st.label}</span></td>
        <td class="num" style="white-space:nowrap"><button class="btn sm ghost" data-act="staff-edit" data-id="${p.id}">Sửa</button>
          <button class="btn sm ghost danger" data-act="staff-del" data-id="${p.id}">Xóa</button></td></tr>`;
    }).join('')}</tbody></table></div>`;

  return `<div class="head"><div><h1>Hồ sơ nhân sự</h1><p class="sub">Thông tin bác sĩ, y tá và nhân viên của thẩm mỹ viện.</p></div>
      <button class="btn pri" data-act="staff-add">+ Thêm nhân sự</button></div>
    <div class="stats"><div><b>${working.length}</b><span>Đang làm việc</span></div>
      ${POSITIONS.map((k) => `<div><b>${working.filter((p) => p.position === k).length}</b><span>${k}</span></div>`).join('')}</div>
    <div class="tabs">${tabs.map(([k, l]) => `<button class="${UI.staffPos === k ? 'on' : ''}" data-tab="staffPos:${k}">${l}</button>`).join('')}</div>
    <div class="row" style="margin-bottom:14px">
      <input id="staffQ" class="search" placeholder="Tìm theo mã, họ tên, SĐT hoặc email" value="${esc(UI.staffQ)}" data-input="staffQ">
      <select data-change="staffStatus" style="padding:10px 14px;border:1px solid var(--line);border-radius:999px;background:var(--surface)">
        ${[['active', 'Đang làm & tạm nghỉ'], ['resigned', 'Đã nghỉ việc'], ['all', 'Tất cả trạng thái']].map(([k, l]) => `<option value="${k}" ${UI.staffStatus === k ? 'selected' : ''}>${l}</option>`).join('')}
      </select></div>
    ${rows.length ? table : empty(S.staff.length ? 'Không có nhân sự phù hợp bộ lọc.' : 'Chưa có hồ sơ nhân sự. Bấm “Thêm nhân sự” để bắt đầu.')}`;
}
