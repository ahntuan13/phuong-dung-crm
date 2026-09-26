// Điểm khởi động: nạp giao diện, kết nối dữ liệu, gắn sự kiện.
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/features.css';
import './styles/responsive.css';

import { initStore, onChange, byId, save, del } from './data/store.js';
import { createLocalAdapter } from './data/adapters/local.js';
// import { createRestAdapter } from './data/adapters/rest.js';
import { isCloudMode } from './config/env.js';
import { todayISO } from './utils/format.js';
import { toast, copyText } from './utils/ui.js';
import { dlg, confirmBox } from './components/dialog.js';
import { SPRITE, LOGO, SPRIG, ICONS } from './assets/illustrations.js';
import { VIEWS } from './views/index.js';
import { registerViews, render, go, UI } from './router.js';

import { customerForm, deleteCustomer } from './forms/customerForm.js';
import { medForm, svcForm, loadSampleCatalog } from './forms/catalogForms.js';
import { treatmentForm } from './forms/treatmentForm.js';
import { stepForm } from './forms/stepForm.js';
import { careForm } from './forms/careForm.js';
import { voucherForm } from './forms/voucherForm.js';
import { wishFlow, templateForm } from './forms/birthday.js';
import { backup, restoreFromFile } from './services/backup.js';
import { backupState } from './services/backupState.js';
import { downloadBlob } from './utils/ui.js';
import { esc } from './utils/format.js';
import { session, setSession, can, ROLES } from './services/session.js';
import { userForm, resetUserPassword, changePasswordForm } from './forms/userForms.js';
import { staffForm, deleteStaff } from './forms/staffForm.js';

/* ---------- Khung giao diện tĩnh ---------- */
document.getElementById('sprite').innerHTML = SPRITE;
document.getElementById('brand').innerHTML = `${LOGO}<div><b id="clinicName">Phương Dung</b><span>Beauty & Care</span></div>`;
document.getElementById('sprig').innerHTML = SPRIG;
document.querySelectorAll('[data-icon]').forEach((b) => b.insertAdjacentHTML('afterbegin', ICONS[b.dataset.icon] || ''));

/* ---------- Hành động theo data-act ---------- */
const WRITE_ACTS = /^(cust-|med-|svc-|tr-|step$|care-(add|edit|del)|follow-done|voucher-add|v-(use|del)|wish$|tpl$|seed-catalog|restore$|staff-)/;
const ACTIONS = {
  'cust-add': () => customerForm(),
  'cust-edit': (d) => customerForm(byId('customers', d.id)),
  'cust-del': (d) => deleteCustomer(byId('customers', d.id)),

  'med-add': () => medForm(),
  'med-edit': (d) => medForm(byId('medicines', d.id)),
  'med-del': (d) => confirmBox('Xóa thuốc này khỏi danh mục? Lịch sử các buổi đã ghi vẫn giữ nguyên.', () => del('medicines', d.id)),
  'seed-catalog': () => loadSampleCatalog(),
  'svc-add': () => svcForm(),
  'svc-edit': (d) => svcForm(byId('services', d.id)),
  'svc-del': (d) => confirmBox('Xóa dịch vụ này khỏi danh mục?', () => del('services', d.id)),

  'tr-add': (d) => treatmentForm({}, d.cid),
  'tr-edit': (d) => treatmentForm(byId('treatments', d.id)),
  'step': (d) => stepForm(d.tr, +d.i),

  'care-add': (d) => careForm({}, d.cid, d.close),
  'care-edit': (d) => careForm(byId('careLogs', d.id)),
  'care-del': (d) => confirmBox('Xóa ghi nhận này?', () => del('careLogs', d.id)),
  'follow-done': async (d) => { await save('careLogs', { ...byId('careLogs', d.id), followDone: true }); toast('Đã đánh dấu gọi lại'); },

  'voucher-add': (d) => voucherForm(d.cid),
  'v-use': async (d) => { await save('vouchers', { ...byId('vouchers', d.id), status: 'used', usedAt: todayISO() }); toast('Đã đánh dấu dùng voucher'); },
  'v-del': (d) => confirmBox('Xóa voucher này?', () => del('vouchers', d.id)),

  'staff-add': () => staffForm(),
  'staff-edit': (d) => staffForm(byId('staff', d.id)),
  'staff-del': (d) => deleteStaff(byId('staff', d.id)),

  'wish': (d) => wishFlow(d.id),
  'tpl': () => templateForm(),
  'copy': (d) => copyText(d.text),

  // thư viện Excel chỉ tải khi bấm xuất
  'export-xlsx': async () => { toast('Đang tạo file Excel…'); (await import('./services/exportExcel.js')).exportExcel(); },
  'backup': () => backup(),
  'restore': () => document.getElementById('restoreFile').click(),
  'logout': () => logout(),
  'chpw': () => changePasswordForm(),
  'user-add': () => userForm(),
  'user-edit': (d) => userForm(d.id),
  'user-reset': (d) => resetUserPassword(d.id),
};

document.addEventListener('click', (e) => {
  if (dlg.contains(e.target)) return; // nút trong hộp thoại tự xử lý
  const nav = e.target.closest('[data-nav]');
  if (nav) { e.preventDefault(); go(nav.dataset.nav); return; }
  const act = e.target.closest('[data-act]');
  const open = e.target.closest('[data-open]');
  if (open && !act) { e.preventDefault(); go('customer', open.dataset.open); return; }
  const tab = e.target.closest('[data-tab]');
  if (tab) { const [k, v] = tab.dataset.tab.split(':'); UI[k] = v; render(); return; }
  if (act) {
    const a = act.dataset.act;
    if (!can('write') && WRITE_ACTS.test(a)) { toast('Tài khoản “Chỉ xem” không sửa được dữ liệu.'); return; }
    ACTIONS[a]?.(act.dataset);
  }
});
document.addEventListener('input', (e) => { const k = e.target.dataset?.input; if (k) { UI[k] = e.target.value; render(); } });
document.addEventListener('change', (e) => { const k = e.target.dataset?.change; if (k) { UI[k] = e.target.value; render(); } });
document.addEventListener('keydown', (e) => { const r = e.target.closest?.('tr[data-open]'); if (r && e.key === 'Enter') go('customer', r.dataset.open); });
document.getElementById('restoreFile').addEventListener('change', (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (f) restoreFromFile(f);
});

/* ---------- Khởi động ---------- */
registerViews(VIEWS);
onChange(render);
const setMode = (t) => { document.getElementById('mode').textContent = t; };
let logout = () => {};

if (!isCloudMode()) {
  // Chưa cấu hình Firebase → lưu trên trình duyệt (dùng để test)
  initStore(createLocalAdapter()).then(setMode);
} else {
  startCloud();
}

/** Chế độ đám mây: đăng nhập Firebase → kiểm tra hồ sơ users/{uid} → nghe dữ liệu realtime */
async function startCloud() {
  // tải động để bản cục bộ không phải nạp thư viện Firebase
  const [{ initFirebase }, { onAuthStateChanged, signOut }, { doc, getDoc }, { createFirebaseAdapter }, login, users] = await Promise.all([
    import('./config/firebase.js'), import('firebase/auth'), import('firebase/firestore'),
    import('./data/adapters/firebase.js'), import('./components/login.js'), import('./services/users.js'),
  ]);
  const fb = initFirebase();
  logout = async () => { await signOut(fb.auth); location.reload(); };
  let started = false;
  let setupPending = false;
  const hooks = {
    onSetupStart: () => { setupPending = true; },
    onSetupEnd: (u) => { setupPending = false; if (u && fb.auth.currentUser) boot(u); },
  };
  const deny = async (code) => { await signOut(fb.auth); login.showLogin(fb, login.authMessage(code), hooks); };

  async function boot(user) {
    if (started) return;
    started = true;
    try {
      const snap = await getDoc(doc(fb.db, 'users', user.uid));
      if (!snap.exists()) { started = false; return deny('no-profile'); }
      const p = snap.data();
      if (p.active === false) { started = false; return deny('locked'); }
      setSession({ cloud: true, uid: user.uid, email: user.email, name: p.name || user.email, role: p.role || 'viewer' });
      login.hideLogin();
      buildAccountMenu();
      const label = await initStore(createFirebaseAdapter(fb.db, {
        onError: (e) => toast(e.code === 'permission-denied' ? 'Tài khoản đã bị khoá hoặc thu hồi quyền.' : 'Mất kết nối dữ liệu, đang thử lại…'),
      }));
      setMode(`${label} Vai trò của bạn: ${ROLES[session.role]?.label || session.role}.`);
      if (can('admin')) users.watchUsers(render);
      setupCloudBackup();
    } catch (e) {
      started = false;
      await signOut(fb.auth).catch(() => {});
      login.showLogin(fb, login.authMessage(e), hooks);
    }
  }

  onAuthStateChanged(fb.auth, (user) => {
    if (setupPending) return;
    if (!user) { started = false; login.showLogin(fb, '', hooks); return; }
    boot(user);
  });
}

/** Menu tài khoản ở thanh bên (chế độ đám mây) */
function buildAccountMenu() {
  const tools = document.querySelector('.nav .tools');
  tools.querySelector('.acct')?.remove();
  tools.insertAdjacentHTML('beforeend', `<div class="acct">
    ${can('admin') ? '<button data-nav="backups">☁ Sao lưu đám mây</button><button data-nav="users">👤 Tài khoản & phân quyền</button>' : ''}
    <div class="user"><b>${esc(session.name)}</b><br>${esc(session.email)} · ${esc(ROLES[session.role]?.label || '')}</div>
    <button data-act="chpw">Đổi mật khẩu</button><button data-act="logout">Đăng xuất</button></div>`);
}

/* ---------- Sao lưu đám mây (chỉ chế độ Firebase) ---------- */
async function setupCloudBackup() {
  const cb = await import('./services/cloudBackup.js');
  const st = backupState;
  const refresh = async () => {
    st.loading = true; st.error = '';
    try { st.list = await cb.listBackups(); } catch (e) { st.error = 'Không tải được danh sách sao lưu: ' + (e.code || e.message); st.list = st.list || []; }
    st.loading = false; render();
  };
  const run = async (msg, fn) => {
    st.busy = msg; st.error = ''; render();
    try { await fn(); } catch (e) { st.error = 'Lỗi: ' + (e.code || e.message); }
    st.busy = ''; await refresh();
  };
  st.loader = refresh;

  Object.assign(ACTIONS, {
    'bk-refresh': () => refresh(),
    'bk-create': () => run('Đang sao lưu…', async () => { await cb.createBackup({ note: 'Sao lưu thủ công' }); toast('Đã sao lưu lên đám mây'); }),
    'bk-download': async (d) => {
      const data = await cb.loadBackup(d.id);
      downloadBlob(`PhuongDung_saoluu_${(data.exportedAt || '').slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
    },
    'bk-delete': (d) => confirmBox('Xóa vĩnh viễn bản sao lưu này?', () => run('Đang xóa…', () => cb.deleteBackup(d.id))),
    'bk-restore': (d) => {
      const b = (st.list || []).find((x) => x.id === d.id);
      const when = b ? new Date(b.createdAt).toLocaleString('vi-VN') : '';
      confirmBox(`Khôi phục toàn bộ dữ liệu về bản sao lưu lúc <b>${when}</b>?<br><br>Dữ liệu nhập sau thời điểm này sẽ bị thay thế. App sẽ tự sao lưu dữ liệu hiện tại trước để có thể quay lại.`,
        () => run('Đang khôi phục…', async () => {
          const n = await cb.restoreBackup(d.id, (m) => { st.busy = m; render(); });
          toast(`Đã khôi phục (${n} bản ghi)`);
        }), 'Khôi phục');
    },
  });

  // sao lưu tự động mỗi ngày (chạy ngầm khi có người đăng nhập)
  try { if (await cb.autoBackupIfDue() && can('admin')) { st.list = null; toast('Đã tự động sao lưu dữ liệu hôm nay'); } }
  catch (e) { console.warn('Auto backup failed', e); }
}
