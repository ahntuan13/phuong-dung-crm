// Màn hình đăng nhập (chỉ dùng ở chế độ đám mây).
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { esc } from '../utils/format.js';
import { LOGO } from '../assets/illustrations.js';

const MESSAGES = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
  'auth/invalid-email': 'Email chưa đúng định dạng.',
  'auth/too-many-requests': 'Đăng nhập sai nhiều lần, vui lòng thử lại sau ít phút.',
  'auth/network-request-failed': 'Không có kết nối mạng.',
  'permission-denied': 'Tài khoản này chưa được cấp quyền truy cập. Liên hệ quản trị viên.',
};
export const authMessage = (code) => MESSAGES[code] || 'Có lỗi xảy ra, vui lòng thử lại.';

export function showLogin(auth, message = '') {
  let el = document.getElementById('login');
  if (!el) { el = document.createElement('div'); el.id = 'login'; document.body.appendChild(el); }
  el.innerHTML = `
    <form class="login-card" novalidate>
      <div class="login-logo">${LOGO}</div>
      <h1>Phương Dung</h1>
      <p class="muted" style="margin:0 0 18px">Đăng nhập để quản lý & chăm sóc khách hàng</p>
      <label class="f">Email<input name="email" type="email" autocomplete="username" required></label>
      <label class="f">Mật khẩu<input name="password" type="password" autocomplete="current-password" required></label>
      <p class="login-err" role="alert">${esc(message)}</p>
      <button class="btn pri" type="submit" style="width:100%;justify-content:center">Đăng nhập</button>
      <button class="btn ghost sm" type="button" data-forgot style="margin-top:8px">Quên mật khẩu?</button>
    </form>`;
  el.hidden = false;
  const form = el.querySelector('form');
  const err = el.querySelector('.login-err');
  form.email.focus();

  form.onsubmit = async (e) => {
    e.preventDefault();
    err.textContent = '';
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true; btn.textContent = 'Đang đăng nhập…';
    try { await signInWithEmailAndPassword(auth, form.email.value.trim(), form.password.value); }
    catch (ex) { err.textContent = authMessage(ex.code); btn.disabled = false; btn.textContent = 'Đăng nhập'; }
  };
  el.querySelector('[data-forgot]').onclick = async () => {
    const email = form.email.value.trim();
    if (!email) { err.textContent = 'Nhập email trước rồi bấm “Quên mật khẩu”.'; return; }
    try { await sendPasswordResetEmail(auth, email); err.textContent = 'Đã gửi email đặt lại mật khẩu (nếu email có trong hệ thống).'; }
    catch (ex) { err.textContent = authMessage(ex.code); }
  };
}

export function hideLogin() {
  const el = document.getElementById('login');
  if (el) el.hidden = true;
}
