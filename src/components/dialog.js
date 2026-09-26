// Hộp thoại dùng chung: form nhập liệu động và hộp xác nhận.
import { esc } from '../utils/format.js';

export const dlg = document.getElementById('dlg');
export const dform = document.getElementById('dlgForm');

dform.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) dlg.close(); });

export const formError = (msg) => { const el = document.getElementById('formErr'); if (el) el.textContent = msg; };

/**
 * Field: {k, label, type: text|number|date|tel|email|select|textarea|checkbox|html, value, options, required, full, min, step, ph, html}
 */
export function field(f) {
  const v = f.value ?? '';
  const req = f.required ? 'required' : '';
  const cls = 'f' + (f.full ? ' full' : f.w === 'third' ? ' third' : '');
  switch (f.type) {
    case 'select':
      return `<label class="${cls}">${f.label}<select name="${f.k}" ${req}>${f.options
        .map((o) => `<option value="${esc(o[0])}" ${String(o[0]) === String(v) ? 'selected' : ''}>${esc(o[1])}</option>`)
        .join('')}</select></label>`;
    case 'textarea':
      return `<label class="${cls}">${f.label}<textarea name="${f.k}">${esc(v)}</textarea></label>`;
    case 'checkbox':
      return `<label class="chk ${f.full ? 'full' : ''}"><input type="checkbox" name="${f.k}" ${v ? 'checked' : ''}> ${f.label}</label>`;
    case 'html':
      return f.html;
    case 'section':
      return `<div class="fsec">${f.label}</div>`;
    case 'hint':
      return `<p class="fhint">${f.label}</p>`;
    case 'readonly':
      return `<label class="${cls}">${f.label}<input id="${f.id}" class="ro ${f.hl ? 'hl' : ''}" readonly tabindex="-1" value="${esc(v)}"></label>`;
    default:
      return `<label class="${cls}">${f.label}<input name="${f.k}" type="${f.type || 'text'}" value="${esc(v)}" ${req}
        ${f.step ? `step="${f.step}"` : ''} ${f.min != null ? `min="${f.min}"` : ''} ${f.ph ? `placeholder="${esc(f.ph)}"` : ''}></label>`;
  }
}

/** onSave(values, form) — trả về false để giữ hộp thoại mở (ví dụ lỗi kiểm tra) */
export function openForm({ title, fields, onSave, saveLabel = 'Lưu', after }) {
  dform.innerHTML = `
    <div class="dlg-h"><h2>${title}</h2><button type="button" class="btn ghost" data-close aria-label="Đóng">✕</button></div>
    <div class="dlg-b"><div class="fgrid">${fields.map(field).join('')}</div>
      <p class="small" id="formErr" style="color:var(--danger);margin:10px 0 0"></p></div>
    <div class="dlg-f"><button type="button" class="btn" data-close>Hủy</button><button type="submit" class="btn pri">${saveLabel}</button></div>`;

  dform.onsubmit = async (e) => {
    e.preventDefault();
    const miss = [...dform.querySelectorAll('[required]')].find((el) => !el.value.trim());
    if (miss) { formError('Vui lòng điền đủ các ô bắt buộc (*).'); miss.focus(); return; }
    const vals = {};
    fields.forEach((f) => {
      if (!f.k) return;
      const el = dform.elements[f.k];
      if (!el) return;
      vals[f.k] = f.type === 'checkbox' ? el.checked : f.type === 'number' ? (el.value === '' ? '' : +el.value) : el.value.trim();
    });
    try { const r = await onSave(vals, dform); if (r !== false) dlg.close(); } catch { /* đã báo lỗi trong store */ }
  };

  dlg.showModal();
  if (after) after(dform);
  dform.querySelector('input:not([type=checkbox]),select,textarea')?.focus();
}

export function confirmBox(msg, fn, label = 'Xóa') {
  dform.innerHTML = `
    <div class="dlg-h"><h2>Xác nhận</h2></div>
    <div class="dlg-b"><p style="margin:0">${msg}</p></div>
    <div class="dlg-f"><button type="button" class="btn" data-close>Hủy</button>
      <button type="submit" class="btn pri" style="background:var(--danger);border-color:var(--danger)">${label}</button></div>`;
  dform.onsubmit = async (e) => { e.preventDefault(); dlg.close(); await fn(); };
  dlg.showModal();
}

/** Danh sách khách cho ô chọn */
export const customerOptions = (customers, emptyLabel = '— Chọn khách —') =>
  [['', emptyLabel], ...customers.map((c) => [c.id, `${c.name} · ${c.phone || ''}`])];
