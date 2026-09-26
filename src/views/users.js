// Tài khoản & phân quyền (chỉ quản trị viên ở chế độ đám mây).
import { esc } from '../utils/format.js';
import { empty } from '../components/cards.js';
import { ROLES, session, can } from '../services/session.js';
import { usersState } from '../services/usersState.js';

export function usersView() {
  if (!session.cloud) return `<h1>Tài khoản & phân quyền</h1>${empty('Chỉ dùng khi app chạy chế độ đám mây (Firebase).')}`;
  if (!can('admin')) return `<h1>Tài khoản & phân quyền</h1>${empty('Chỉ quản trị viên xem được mục này.')}`;
  const list = usersState.list;
  const table = `<div class="panel tablewrap" style="padding:6px 8px"><table>
    <thead><tr><th>Email</th><th>Họ tên</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead>
    <tbody>${list.map((u) => `<tr>
      <td><b>${esc(u.email)}</b>${u.id === session.uid ? ' <span class="chip">Bạn</span>' : ''}</td>
      <td>${esc(u.name || '')}</td>
      <td><span class="chip ${ROLES[u.role]?.chip || ''}">${esc(ROLES[u.role]?.label || u.role)}</span></td>
      <td>${u.active ? '<span class="chip ok">Đang hoạt động</span>' : '<span class="chip warn">Đã khoá</span>'}</td>
      <td class="num" style="white-space:nowrap"><button class="btn sm ghost" data-act="user-edit" data-id="${u.id}">Sửa</button>
        <button class="btn sm ghost" data-act="user-reset" data-id="${u.id}">Gửi email đặt lại mật khẩu</button></td></tr>`).join('')}</tbody></table></div>`;

  return `<div class="head"><div><h1>Tài khoản & phân quyền</h1><p class="sub">Tài khoản đăng nhập app. Mỗi nhân viên dùng một email riêng.</p></div>
      <button class="btn pri" data-act="user-add">+ Thêm tài khoản</button></div>
    ${list.length ? table : empty('Đang tải danh sách…')}
    <div class="panel" style="margin-top:16px"><h2>Vai trò</h2><ul class="list">
      ${Object.values(ROLES).map((r) => `<li><span><span class="chip ${r.chip}">${r.label}</span></span><span class="small muted">${r.desc}</span></li>`).join('')}
    </ul></div>
    <p class="fhint" style="margin-top:12px">Nhân viên nghỉ việc: bấm Sửa → bỏ tick “Đang hoạt động” để khoá, không cần xoá. Muốn xoá hẳn email khỏi hệ thống: Firebase Console → Security → Authentication → Users.</p>`;
}
