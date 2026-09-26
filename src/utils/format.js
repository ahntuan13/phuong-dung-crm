// Định dạng & xử lý chuỗi/ngày/tiền — không phụ thuộc module nào khác.

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const money = (n) => Math.round(+n || 0).toLocaleString('vi-VN') + ' ₫';

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const fdate = (s) => {
  if (!s) return '—';
  const [y, m, d] = s.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

export const addDays = (iso, n) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};

export const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);

/** Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu */
export const norm = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

export const digits = (s) => String(s || '').replace(/\D/g, '');

export const initials = (n) => {
  const p = String(n || '?').trim().split(/\s+/);
  return (p[p.length - 1] || '?')[0].toUpperCase();
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'sáng' : h < 18 ? 'chiều' : 'tối';
};
