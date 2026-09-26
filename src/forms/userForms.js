// Form thêm / sửa tài khoản và đổi mật khẩu (chế độ đám mây).
import { esc } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { openForm, formError } from '../components/dialog.js';
import { ROLES, session } from '../services/session.js';
import { usersState } from '../services/usersState.js';

const api = () => import('../services/users.js');
const msg = async (e) => (await import('../components/login.js')).authMessage(e);
const roleOpts = Object.entries(ROLES).map(([k, r]) => [k, `${r.label} – ${r.desc}`]);

export function userForm(id) {
  const u = id ? usersState.list.find((x) => x.id === id) : null;
  openForm({
    title: u ? `Sửa tài khoản ${esc(u.email)}` : 'Thêm tài khoản',
    fields: u ? [
      { k: 'name', label: 'Họ tên *', value: u.name, required: true, full: true },
      { k: 'role', label: 'Vai trò', type: 'select', value: u.role, options: roleOpts, full: true },
      { k: 'active', label: 'Đang hoạt động (bỏ tick để khoá tài khoản)', type: 'checkbox', value: u.active, full: true },
    ] : [
      { k: 'email', label: 'Email *', type: 'email', required: true, full: true },
      { k: 'name', label: 'Họ tên *', required: true, full: true },
      { k: 'password', label: 'Mật khẩu ban đầu * (tối thiểu 6 ký tự)', type: 'text', required: true },
      { k: 'role', label: 'Vai trò', type: 'select', value: 'member', options: roleOpts },
      { type: 'hint', label: 'Gửi email + mật khẩu ban đầu cho nhân viên. Họ có thể tự đổi mật khẩu trong app (menu “Đổi mật khẩu”).' },
    ],
    onSave: async (v) => {
      try {
        const { createUser, updateUser } = await api();
        if (u) {
          if (u.id === session.uid && (!v.active || v.role !== 'admin')) { formError('Không thể tự khoá hoặc hạ quyền tài khoản đang đăng nhập.'); return false; }
          await updateUser(u.id, v);
        } else {
          if (v.password.length < 6) { formError('Mật khẩu tối thiểu 6 ký tự.'); return false; }
          await createUser(v);
        }
        toast('Đã lưu tài khoản');
      } catch (e) { formError(await msg(e)); return false; }
    },
  });
}

export async function resetUserPassword(id) {
  const u = usersState.list.find((x) => x.id === id);
  if (!u) return;
  try { await (await api()).sendReset(u.email); toast('Đã gửi email đặt lại mật khẩu tới ' + u.email); }
  catch (e) { toast(await msg(e)); }
}

export function changePasswordForm() {
  openForm({
    title: 'Đổi mật khẩu',
    fields: [
      { k: 'old', label: 'Mật khẩu hiện tại *', type: 'password', required: true, full: true },
      { k: 'n1', label: 'Mật khẩu mới * (tối thiểu 6 ký tự)', type: 'password', required: true },
      { k: 'n2', label: 'Nhập lại mật khẩu mới *', type: 'password', required: true },
    ],
    onSave: async (v) => {
      if (v.n1 !== v.n2) { formError('Hai mật khẩu mới không khớp.'); return false; }
      try { await (await api()).changeOwnPassword(v.old, v.n1); toast('Đã đổi mật khẩu'); }
      catch (e) { formError(await msg(e)); return false; }
    },
  });
}
