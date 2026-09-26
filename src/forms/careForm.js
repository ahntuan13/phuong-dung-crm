// Ghi nhận cuộc gọi hỏi thăm / đánh giá của khách + hẹn tái khám.
import { S, byId, save } from '../data/store.js';
import { todayISO } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { openForm, customerOptions } from '../components/dialog.js';
import { staffOptions, staffName } from '../domain/staff.js';

/** closeId: ghi nhận cũ có hẹn gọi lại → đánh dấu đã gọi khi lưu cuộc gọi mới */
export function careForm(l = {}, cid, closeId) {
  let rating = +l.rating || 0;
  openForm({
    title: l.id ? 'Sửa ghi nhận' : 'Ghi nhận hỏi thăm khách',
    fields: [
      { k: 'customerId', label: 'Khách hàng *', type: 'select', options: customerOptions(S.customers), value: cid || l.customerId || '', required: true, full: true },
      { k: 'date', label: 'Ngày gọi', type: 'date', value: l.date || todayISO() },
      { k: 'channel', label: 'Hình thức', type: 'select', value: l.channel || 'Điện thoại', options: ['Điện thoại', 'Zalo', 'Tại spa', 'Tin nhắn'].map((x) => [x, x]) },
      { k: 'nurseId', label: 'Điều dưỡng / Y tá', type: 'select', options: staffOptions('nurse', l.nurseId), value: l.nurseId || '', full: true },
      { k: 'followUp', label: 'Hẹn gọi lại (nếu cần)', type: 'date', value: l.followUp || '' },
      { k: 'revisit', label: 'Ngày hẹn tái khám', type: 'date', value: l.revisit || '' },
      { type: 'html', html: `<div class="full"><div class="small muted" style="font-weight:500;margin-bottom:4px">Mức độ hài lòng</div>
        <div class="rating-pick" id="rp">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-r="${n}" aria-label="${n} sao">★</button>`).join('')}</div></div>` },
      { k: 'content', label: 'Nội dung (khách phản hồi gì?)', type: 'textarea', value: l.content || '', full: true },
    ],
    after: (f) => {
      const rp = f.querySelector('#rp');
      const paint = () => rp.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.r <= rating));
      paint();
      rp.onclick = (e) => { const b = e.target.closest('[data-r]'); if (b) { rating = +b.dataset.r === rating ? 0 : +b.dataset.r; paint(); } };
    },
    onSave: async (v) => {
      await save('careLogs', { ...l, ...v, staff: staffName(v.nurseId) || l.staff || '', rating, kind: l.kind || 'review', followDone: l.followDone || false });
      if (closeId) { const o = byId('careLogs', closeId); if (o) await save('careLogs', { ...o, followDone: true }); }
      toast('Đã lưu ghi nhận');
    },
  });
}
