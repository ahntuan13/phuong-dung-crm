// Màn hình Sao lưu đám mây: danh sách bản sao lưu, sao lưu ngay, khôi phục, tải về, xóa.
import { esc } from '../utils/format.js';
import { backupState } from '../services/backupState.js';
import { empty } from '../components/cards.js';

const LABELS = { customers: 'khách', treatments: 'liệu trình', careLogs: 'chăm sóc', vouchers: 'voucher', staff: 'nhân sự', medicines: 'thuốc', services: 'dịch vụ' };
const dt = (iso) => new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');

export function backupsView() {
  const st = backupState;
  if (!st.loader) return `<h1>Sao lưu đám mây</h1>${empty('Tính năng này chỉ có khi đăng nhập chế độ đám mây (Firebase). Ở chế độ cục bộ, hãy dùng “Sao lưu dữ liệu (.json)”.')}`;
  if (st.list === null && !st.loading) setTimeout(st.loader, 0);

  const list = st.list || [];
  const table = `<div class="panel tablewrap" style="padding:6px 8px"><table>
    <thead><tr><th>Thời gian</th><th>Loại</th><th>Người tạo</th><th>Nội dung</th><th class="num">Dung lượng</th><th></th></tr></thead>
    <tbody>${list.map((b) => `<tr>
      <td><b>${dt(b.createdAt)}</b>${b.note ? `<div class="small muted">${esc(b.note)}</div>` : ''}</td>
      <td><span class="chip ${b.auto ? 'ok' : 'rose'}">${b.auto ? 'Tự động' : 'Thủ công'}</span></td>
      <td class="small">${esc(b.createdBy || '')}</td>
      <td class="small muted">${Object.entries(LABELS).map(([k, l]) => `${b.counts?.[k] ?? 0} ${l}`).join(' · ')}</td>
      <td class="num">${kb(b.size || 0)}</td>
      <td class="num" style="white-space:nowrap">
        <button class="btn sm" data-act="bk-restore" data-id="${b.id}" ${st.busy ? 'disabled' : ''}>Khôi phục</button>
        <button class="btn sm ghost" data-act="bk-download" data-id="${b.id}">Tải về</button>
        <button class="btn sm ghost danger" data-act="bk-delete" data-id="${b.id}" ${st.busy ? 'disabled' : ''}>Xóa</button></td></tr>`).join('')}
    </tbody></table></div>`;

  return `<div class="head"><div><h1>Sao lưu đám mây</h1>
      <p class="sub">Tự động sao lưu mỗi ngày (giữ 30 bản gần nhất). Có thể khôi phục toàn bộ dữ liệu về một thời điểm bất kỳ.</p></div>
      <div class="row"><button class="btn" data-act="bk-refresh">Làm mới</button>
        <button class="btn pri" data-act="bk-create" ${st.busy ? 'disabled' : ''}>☁ Sao lưu ngay</button></div></div>
    ${st.busy ? `<div class="panel" style="margin-bottom:14px;background:var(--rose-soft)"><b>${esc(st.busy)}</b> <span class="muted small">Vui lòng không đóng trang.</span></div>` : ''}
    ${st.error ? `<div class="panel" style="margin-bottom:14px;color:var(--danger)">${esc(st.error)}</div>` : ''}
    ${st.loading && !st.list ? '<p class="muted">Đang tải danh sách…</p>' : list.length ? table : empty('Chưa có bản sao lưu nào. Bấm “Sao lưu ngay” để tạo bản đầu tiên.')}
    <p class="fhint" style="margin-top:12px">Khôi phục sẽ thay toàn bộ dữ liệu hiện tại bằng dữ liệu trong bản sao lưu. Trước khi khôi phục, app tự tạo thêm 1 bản sao lưu dữ liệu hiện tại để có thể quay lại.</p>`;
}
