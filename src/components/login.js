// Màn hình đăng nhập + Thiết lập lần đầu (tạo quản trị viên đầu tiên). Chỉ dùng ở chế độ đám mây.
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { esc } from '../utils/format.js';
import { LOGO } from '../assets/illustrations.js';

const MESSAGES = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
  'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
  'auth/user-not-found': 'Email hoặc mật khẩu không đúng.',
  'auth/invalid-email': 'Email chưa đúng định dạng.',
  'auth/email-already-in-use': 'Email này đã có tài khoản.',
  'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự).',
  'auth/too-many-requests': 'Thử quá nhiều lần. Vui lòng đợi ít phút rồi thử lại.',
  'auth/network-request-failed': 'Không có kết nối mạng.',
  'auth/operation-not-allowed': 'Chưa bật đăng nhập Email/Password trong Firebase Authentication.',
  'auth/requires-recent-login': 'Vui lòng đăng nhập lại rồi thử lại.',
  'permission-denied': 'Không có quyền thực hiện (Firestore Rules). Kiểm tra lại file firestore.rules đã Publish chưa.',
  'no-profile': 'Tài khoản chưa được cấp quyền. Hãy liên hệ quản trị viên.',
  'locked': 'Tài khoản đã bị khoá. Hãy liên hệ quản trị viên.',
  'already-init': 'Hệ thống đã được thiết lập trước đó. Hãy nhờ quản trị viên tạo tài khoản cho bạn.',
};
export const authMessage = (e) => {
  const code = typeof e === 'string' ? e : e?.code;
  return MESSAGES[code] || e?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
};

let mode = 'login';
let initialized = null; // null = chưa biết, true = đã có quản trị viên → ẩn "Thiết lập lần đầu"

async function checkInitialized(fb) {
  try { initialized = (await getDoc(doc(fb.db, 'meta', 'init'))).exists(); }
  catch { initialized = null; } // rules cũ chưa cho đọc → vẫn hiện nút như trước
}

export function showLogin(fb, message = '', hooks = {}) {
  if (initialized === null && !showLogin.checking) {
    showLogin.checking = true;
    checkInitialized(fb).then(() => {
      if (initialized && !document.getElementById('login')?.hidden) {
        if (mode === 'setup') mode = 'login';
        document.querySelector('#login [data-mode]')?.remove();
      }
    });
  }
  if (initialized) mode = 'login';
  let el = document.getElementById('login');
  if (!el) { el = document.createElement('div'); el.id = 'login'; document.body.appendChild(el); }
  const setup = mode === 'setup';
  el.innerHTML = `
    <form class="login-card" novalidate>
      <div class="login-logo">${LOGO}</div>
      <h1>${setup ? 'Thiết lập lần đầu' : 'Phương Dung'}</h1>
      <p class="muted" style="margin:0 0 18px">${setup ? 'Tạo tài khoản quản trị viên đầu tiên' : 'Đăng nhập để quản lý & chăm sóc khách hàng'}</p>
      <label class="f">Email<input name="email" type="email" autocomplete="username" required></label>
      ${setup ? '<label class="f">Họ tên<input name="name" required></label>' : ''}
      <label class="f">Mật khẩu${setup ? ' (tối thiểu 6 ký tự)' : ''}<input name="password" type="password" autocomplete="${setup ? 'new-password' : 'current-password'}" required></label>
      ${setup ? '<label class="f">Nhập lại mật khẩu<input name="password2" type="password" autocomplete="new-password" required></label>' : ''}
      <p class="login-err" role="alert">${esc(message)}</p>
      <button class="btn pri" type="submit" style="width:100%;justify-content:center">${setup ? 'Tạo quản trị viên' : 'Đăng nhập'}</button>
      ${setup ? '<p class="fhint" style="text-align:left">Chỉ dùng lần đầu khi hệ thống chưa có ai. Nếu đã có quản trị viên, hãy nhờ họ tạo tài khoản cho bạn.</p>'
              : '<button class="btn ghost sm" type="button" data-forgot>Quên mật khẩu?</button>'}
      ${initialized ? '' : `<button class="btn ghost sm" type="button" data-mode>${setup ? '← Quay lại đăng nhập' : 'Thiết lập lần đầu (chưa có tài khoản quản trị)'}</button>`}
    </form>`;
  el.hidden = false;
  const form = el.querySelector('form');
  const err = el.querySelector('.login-err');
  form.email.focus();
  const modeBtn = el.querySelector('[data-mode]');
  if (modeBtn) modeBtn.onclick = () => { mode = setup ? 'login' : 'setup'; showLogin(fb, '', hooks); };

  form.onsubmit = async (e) => {
    e.preventDefault();
    err.textContent = '';
    const email = form.email.value.trim().toLowerCase();
    const pw = form.password.value;
    if (!email || !pw) { err.textContent = 'Nhập đủ email và mật khẩu.'; return; }
    const btn = form.querySelector('[type=submit]');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Đang xử lý…';
    try {
      if (!setup) { await signInWithEmailAndPassword(fb.auth, email, pw); return; }
      const name = form.name.value.trim();
      if (!name) throw { code: 'Nhập họ tên.' , message: 'Nhập họ tên.' };
      if (pw !== form.password2.value) throw { message: 'Hai mật khẩu không khớp.' };
      await setupFirstAdmin(fb, email, pw, name, hooks);
      mode = 'login'; initialized = true;
    } catch (ex) {
      err.textContent = authMessage(ex);
      btn.disabled = false; btn.textContent = label;
    }
  };
  const forgot = el.querySelector('[data-forgot]');
  if (forgot) forgot.onclick = async () => {
    const email = form.email.value.trim();
    if (!email) { err.textContent = 'Nhập email trước rồi bấm “Quên mật khẩu”.'; return; }
    try { await sendPasswordResetEmail(fb.auth, email); err.textContent = 'Đã gửi email đặt lại mật khẩu (nếu email có trong hệ thống).'; }
    catch (ex) { err.textContent = authMessage(ex); }
  };
}

/** Tạo tài khoản + hồ sơ admin + đánh dấu meta/init. Rules chỉ cho phép khi meta/init chưa tồn tại. */
async function setupFirstAdmin(fb, email, pw, name, hooks) {
  hooks.onSetupStart?.();
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(fb.auth, email, pw);
    const b = writeBatch(fb.db);
    b.set(doc(fb.db, 'users', cred.user.uid), { email, name, role: 'admin', active: true, createdAt: new Date().toISOString() });
    b.set(doc(fb.db, 'meta', 'init'), { by: cred.user.uid, at: new Date().toISOString() });
    try { await b.commit(); }
    catch {
      try { await cred.user.delete(); } catch { /* bỏ qua */ }
      try { await signOut(fb.auth); } catch { /* bỏ qua */ }
      throw { code: 'already-init' };
    }
  } finally {
    hooks.onSetupEnd?.(cred?.user);
  }
}

export function hideLogin() {
  const el = document.getElementById('login');
  if (el) el.hidden = true;
}
