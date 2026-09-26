// Phiên đăng nhập & phân quyền.
// Vai trò: admin (Quản trị) · member (Nhân viên – được nhập liệu) · viewer (Chỉ xem).
// Chế độ cục bộ: không đăng nhập, coi như admin.

export const ROLES = {
  admin:  { label: 'Quản trị',  desc: 'Toàn quyền, quản lý tài khoản, sao lưu & khôi phục', chip: 'rose' },
  member: { label: 'Nhân viên', desc: 'Xem và nhập liệu khách hàng, liệu trình, chăm sóc', chip: 'ok' },
  viewer: { label: 'Chỉ xem',   desc: 'Chỉ xem, không sửa được dữ liệu', chip: '' },
};

export const session = { cloud: false, uid: '', email: '', name: '', role: 'admin' };

export function setSession(s) {
  Object.assign(session, s);
  document.body.classList.toggle('ro', !can('write'));
  document.body.classList.toggle('not-admin', !can('admin'));
}

/** can('write') – được nhập liệu; can('admin') – quản trị */
export function can(what) {
  if (what === 'admin') return session.role === 'admin';
  if (what === 'write') return session.role === 'admin' || session.role === 'member';
  return true;
}
