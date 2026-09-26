// Sao lưu dữ liệu lên chính Firestore (chạy được với gói miễn phí Spark).
// Cấu trúc:  backups/{id}            – thông tin bản sao lưu (tạo sau cùng → chỉ bản đầy đủ mới hiện)
//            backups/{id}/parts/{n}  – dữ liệu JSON cắt nhỏ (Firestore giới hạn 1 MiB/document)
//            config/backup           – thời điểm sao lưu tự động gần nhất
// Rules: ai có quyền nhập liệu được TẠO bản sao lưu; không ai sửa được bản đã tạo; chỉ admin xem / khôi phục / xoá.
import { collection, doc, getDoc, getDocs, query, orderBy, limit, writeBatch, setDoc } from 'firebase/firestore';
import { initFirebase } from '../config/firebase.js';
import { S, COLS } from '../data/store.js';
import { can } from './session.js';

const CHUNK_CHARS = 300_000;   // ~900 KB tối đa với tiếng Việt (UTF-8 tới 3 byte/ký tự)
const CHUNKS_PER_BATCH = 8;    // giữ mỗi lần ghi < 10 MiB
const OPS_PER_BATCH = 400;     // Firestore tối đa 500 thao tác/lần ghi
export const AUTO_KEEP = 30;   // giữ 30 bản tự động gần nhất
const AUTO_EVERY_HOURS = 20;

const fb = () => initFirebase();

export async function listBackups() {
  const { db } = fb();
  const snap = await getDocs(query(collection(db, 'backups'), orderBy('createdAt', 'desc'), limit(200)));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function createBackup({ auto = false, note = '' } = {}) {
  const { db, auth } = fb();
  const data = Object.fromEntries(COLS.map((c) => [c, S[c]]));
  const json = JSON.stringify({ app: 'phuong-dung-crm', version: 2, exportedAt: new Date().toISOString(), data });
  const chunks = [];
  for (let i = 0; i < json.length; i += CHUNK_CHARS) chunks.push(json.slice(i, i + CHUNK_CHARS));

  const ref = doc(collection(db, 'backups'));
  // 1) ghi các phần dữ liệu
  for (let i = 0; i < chunks.length; i += CHUNKS_PER_BATCH) {
    const batch = writeBatch(db);
    chunks.slice(i, i + CHUNKS_PER_BATCH).forEach((d, j) => batch.set(doc(ref, 'parts', String(i + j)), { i: i + j, data: d }));
    await batch.commit();
  }
  // 2) ghi thông tin sau cùng → bản dở dang không bao giờ xuất hiện trong danh sách
  const meta = {
    createdAt: new Date().toISOString(),
    createdBy: auth.currentUser?.email || '',
    auto, note,
    size: new Blob([json]).size,
    parts: chunks.length,
    counts: Object.fromEntries(COLS.map((c) => [c, S[c].length])),
  };
  await setDoc(ref, meta);
  return { ...meta, id: ref.id };
}

export async function loadBackup(id) {
  const { db } = fb();
  const snap = await getDocs(collection(db, 'backups', id, 'parts'));
  const json = snap.docs.map((d) => d.data()).sort((a, b) => a.i - b.i).map((c) => c.data).join('');
  return JSON.parse(json);
}

/** Thay toàn bộ dữ liệu hiện tại bằng bản sao lưu. Tự tạo 1 bản sao lưu an toàn trước khi thay. */
export async function restoreBackup(id, onProgress = () => {}) {
  const { db } = fb();
  onProgress('Đang tải bản sao lưu…');
  const { data } = await loadBackup(id);
  if (!data || !Array.isArray(data.customers)) throw new Error('Bản sao lưu bị lỗi');

  onProgress('Đang lưu dữ liệu hiện tại (phòng khi cần quay lại)…');
  await createBackup({ note: 'Tự động trước khi khôi phục' });

  const ops = [];
  for (const col of COLS) {
    const rows = data[col] || [];
    const keep = new Set(rows.map((r) => r.id));
    rows.forEach(({ id: rid, ...body }) => ops.push(['set', col, rid, body]));
    S[col].forEach((r) => { if (!keep.has(r.id)) ops.push(['del', col, r.id]); });
  }
  for (let i = 0; i < ops.length; i += OPS_PER_BATCH) {
    onProgress(`Đang khôi phục… ${Math.min(i + OPS_PER_BATCH, ops.length)}/${ops.length}`);
    const batch = writeBatch(db);
    ops.slice(i, i + OPS_PER_BATCH).forEach(([op, col, rid, body]) =>
      op === 'set' ? batch.set(doc(db, col, rid), body) : batch.delete(doc(db, col, rid)));
    await batch.commit();
  }
  return ops.length;
}

export async function deleteBackup(id) {
  const { db } = fb();
  const snap = await getDocs(collection(db, 'backups', id, 'parts'));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'backups', id));
  await batch.commit();
}

/** Gọi sau khi đăng nhập: chưa có bản tự động trong ~1 ngày → tạo. Admin còn dọn bớt bản tự động cũ. */
export async function autoBackupIfDue() {
  if (!can('write')) return null;
  const { db } = fb();
  const cfgRef = doc(db, 'config', 'backup');
  const last = (await getDoc(cfgRef)).data()?.lastAuto;
  let created = null;
  const hasData = S.customers.length || S.treatments.length;
  if (hasData && (!last || Date.now() - new Date(last).getTime() >= AUTO_EVERY_HOURS * 3600e3)) {
    created = await createBackup({ auto: true, note: 'Sao lưu tự động hằng ngày' });
    await setDoc(cfgRef, { lastAuto: created.createdAt, by: created.createdBy });
  }
  if (can('admin')) {
    const autos = (await listBackups()).filter((b) => b.auto);
    for (const old of autos.slice(AUTO_KEEP)) await deleteBackup(old.id);
  }
  return created;
}
