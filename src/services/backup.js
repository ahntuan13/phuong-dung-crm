// Sao lưu toàn bộ dữ liệu ra file JSON và khôi phục lại.
import { S, COLS, save } from '../data/store.js';
import { todayISO } from '../utils/format.js';
import { toast, downloadBlob } from '../utils/ui.js';
import { confirmBox } from '../components/dialog.js';

export function backup() {
  const payload = { app: 'phuong-dung-crm', version: 1, exportedAt: new Date().toISOString(), data: S };
  downloadBlob(`PhuongDung_saoluu_${todayISO()}.json`, JSON.stringify(payload, null, 2), 'application/json');
  toast('Đã tải file sao lưu');
}

export async function restoreFromFile(file) {
  try {
    const json = JSON.parse(await file.text());
    const d = json.data || json;
    if (!Array.isArray(d.customers)) throw new Error('bad file');
    confirmBox(`Khôi phục ${d.customers.length} khách, ${(d.treatments || []).length} liệu trình? Dữ liệu hiện tại có cùng mã sẽ bị ghi đè.`, async () => {
      for (const c of COLS) for (const r of d[c] || []) await save(c, r);
      toast('Đã khôi phục dữ liệu');
    }, 'Khôi phục');
  } catch {
    toast('File không đúng định dạng sao lưu');
  }
}
