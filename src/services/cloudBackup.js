// Sao lưu dữ liệu lên chính Firestore (chạy được với gói miễn phí Spark).
// Mỗi bản sao lưu = 1 document trong "backups" (thông tin) + các mảnh JSON trong "backupChunks".
// Firestore giới hạn 1 MiB/document nên dữ liệu được cắt nhỏ.
import { collection, doc, getDocs, query, orderBy, limit, where, writeBatch } from 'firebase/firestore';
import { initFirebase } from '../config/firebase.js';
import { S, COLS } from '../data/store.js';

const CHUNK_CHARS = 300_000;   // ~900 KB tối đa với tiếng Việt (UTF-8 tới 3 byte/ký tự)
const CHUNKS_PER_BATCH = 8;    // giữ mỗi lần ghi < 10 MiB
const OPS_PER_BATCH = 400;     // Firestore tối đa 500 thao tác/lần ghi
export const AUTO_KEEP = 30;   // giữ 30 bản tự động gần nhất
const AUTO_EVERY_HOURS = 20;

const fb = () => initFirebase();

export async function listBackups() {
  const { db } = fb();
  const snap = await getDocs(query(collection(db, 'backups'), orderBy('createdAt', 'desc'), limit(200)));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id })).filter((b) => b.complete);
}

export async function createBackup({ auto = false, note = '' } = {}) {
  const { db, auth } = fb();
  const data = Object.fromEntries(COLS.map((c) => [c, S[c]]));
  const json = JSON.stringify({ app: 'phuong-dung-crm', version: 1, exportedAt: new Date().toISOString(), data });
  const chunks = [];
  for (let i = 0; i < json.length; i += CHUNK_CHARS) chunks.push(json.slice(i, i + CHUNK_CHARS));

  const ref = doc(collection(db, 'backups'));
  const meta = {
    createdAt: new Date().toISOString(),
    createdBy: auth.currentUser?.email || '',
    auto, note,
    size: new Blob([json]).size,
    chunks: chunks.length,
    counts: Object.fromEntries(COLS.map((c) => [c, S[c].length])),
    complete: false,
  };

  // ghi các mảnh trước, đánh dấu "complete" sau cùng → không bao giờ dùng nhầm bản ghi dở
  for (let i = 0; i < chunks.length; i += CHUNKS_PER_BATCH) {
    const batch = writeBatch(db);
    if (i === 0) batch.set(ref, meta);
    chunks.slice(i, i + CHUNKS_PER_BATCH).forEach((d, j) =>
      batch.set(doc(db, 'backupChunks', `${ref.id}_${i + j}`), { backupId: ref.id, i: i + j, data: d }));
    await batch.commit();
  }
  const done = writeBatch(db);
  done.set(ref, { ...meta, complete: true });
  await done.commit();
  return { ...meta, complete: true, id: ref.id };
}

export async function loadBackup(id) {
  const { db } = fb();
  const snap = await getDocs(query(collection(db, 'backupChunks'), where('backupId', '==', id)));
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
  const snap = await getDocs(query(collection(db, 'backupChunks'), where('backupId', '==', id)));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'backups', id));
  await batch.commit();
}

/** Gọi sau khi đăng nhập: nếu chưa có bản tự động trong ~1 ngày → tạo; giữ tối đa AUTO_KEEP bản tự động */
export async function autoBackupIfDue() {
  const list = await listBackups();
  const autos = list.filter((b) => b.auto);
  const last = autos[0];
  if (last && Date.now() - new Date(last.createdAt).getTime() < AUTO_EVERY_HOURS * 3600e3) return null;
  if (!S.customers.length && !S.treatments.length) return null; // chưa có dữ liệu thì thôi
  const created = await createBackup({ auto: true, note: 'Sao lưu tự động hằng ngày' });
  for (const old of autos.slice(AUTO_KEEP - 1)) await deleteBackup(old.id);
  return created;
}
