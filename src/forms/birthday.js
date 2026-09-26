// Gửi lời chúc sinh nhật (Zalo / SMS / gọi) và sửa lời chúc mẫu.
import { byId, S, save } from '../data/store.js';
import { esc, fdate, digits, todayISO } from '../utils/format.js';
import { toast, copyText } from '../utils/ui.js';
import { dlg, dform, openForm } from '../components/dialog.js';
import { settings } from '../domain/settings.js';
import { voucherValid, voucherLabel } from '../domain/calc.js';
import { voucherForm } from './voucherForm.js';

export function buildBirthdayMessage(c, vc) {
  const st = settings();
  const voucherText = vc ? `voucher ${vc.code} (${voucherLabel(vc)}${vc.expiry ? ', HSD ' + fdate(vc.expiry) : ''})` : 'một phần quà nhỏ';
  return st.bdayMsg
    .replace(/\{ten\}/g, c.name.split(/\s+/).pop())
    .replace(/\{hoten\}/g, c.name)
    .replace(/\{xungho\}/g, c.title || 'Chị')
    .replace(/\{clinic\}/g, st.clinic)
    .replace(/\{voucher\}/g, voucherText);
}

export function wishFlow(cid) {
  const c = byId('customers', cid);
  if (!c) return;
  let vc = S.vouchers.find((v) => v.customerId === cid && voucherValid(v) && /sinh nhật/i.test(v.title || ''));

  const show = () => {
    const msg = buildBirthdayMessage(c, vc);
    const ph = digits(c.phone);
    dform.innerHTML = `
      <div class="dlg-h"><h2>Chúc mừng sinh nhật ${esc(c.name)}</h2><button type="button" class="btn ghost" data-close aria-label="Đóng">✕</button></div>
      <div class="dlg-b"><label class="f">Lời chúc (có thể sửa trước khi gửi)<textarea id="wishMsg" style="min-height:140px">${esc(msg)}</textarea></label>
        <div class="row" style="margin-top:12px">${vc ? `<span class="chip rose">Voucher: ${esc(vc.code)} – ${voucherLabel(vc)}</span>`
          : `<button type="button" class="btn sm" id="wishV">+ Kèm voucher sinh nhật</button>`}</div>
        <div class="row" style="margin-top:14px"><button type="button" class="btn" id="wCopy">Sao chép lời chúc</button>
          ${ph ? `<a class="btn" href="https://zalo.me/${ph}" target="_blank" rel="noopener">Mở Zalo</a>
          <a class="btn" id="wSms" href="sms:${ph}?body=${encodeURIComponent(msg)}">Gửi SMS</a>
          <a class="btn" href="tel:${ph}">Gọi điện</a>` : ''}</div></div>
      <div class="dlg-f"><button type="button" class="btn" data-close>Đóng</button><button type="submit" class="btn pri">Đánh dấu đã chúc</button></div>`;

    const ta = dform.querySelector('#wishMsg');
    dform.querySelector('#wCopy').onclick = () => copyText(ta.value);
    const sms = dform.querySelector('#wSms');
    if (sms) ta.addEventListener('input', () => { sms.href = `sms:${ph}?body=${encodeURIComponent(ta.value)}`; });
    const wv = dform.querySelector('#wishV');
    if (wv) wv.onclick = async () => {
      dlg.close();
      vc = await voucherForm(cid, { title: 'Quà sinh nhật', value: 20, days: 30 });
      show(); dlg.showModal();
    };
    dform.onsubmit = async (e) => {
      e.preventDefault();
      const years = new Set(c.wishedYears || []);
      years.add(todayISO().slice(0, 4));
      await save('customers', { ...c, wishedYears: [...years] });
      await save('careLogs', { customerId: cid, date: todayISO(), kind: 'birthday', channel: 'Chúc sinh nhật', content: ta.value.slice(0, 500), rating: 0 });
      dlg.close();
      toast('Đã ghi nhận lời chúc');
    };
  };
  show();
  dlg.showModal();
}

export function templateForm() {
  const st = settings();
  openForm({
    title: 'Lời chúc sinh nhật mẫu',
    fields: [
      { k: 'clinic', label: 'Tên thẩm mỹ viện', value: st.clinic, full: true },
      { k: 'bdayMsg', label: 'Nội dung mẫu', type: 'textarea', value: st.bdayMsg, full: true },
      { type: 'html', html: '<p class="small muted full" style="margin:0">Từ khóa tự thay: {xungho} = Chị/Anh…, {ten} = tên gọi, {hoten} = họ tên đầy đủ, {clinic} = tên thẩm mỹ viện, {voucher} = mã voucher kèm theo.</p>' },
    ],
    onSave: async (v) => { await save('settings', { ...(byId('settings', 'main') || {}), id: 'main', ...v }); toast('Đã lưu lời chúc mẫu'); },
  });
}
