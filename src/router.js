// Điều hướng giữa các màn hình + trạng thái giao diện (tab, ô tìm kiếm…).
import { isReady } from './data/store.js';
import { settings } from './domain/settings.js';

export const view = { name: 'dash', param: null };

/** Trạng thái UI không lưu vào dữ liệu */
export const UI = {
  custQ: '', lookQ: '',
  catTab: 'med', medGroup: 'all', medQ: '', careTab: 'bday', vTab: 'active',
  bMonth: null, rateFilter: 'all',
  staffQ: '', staffPos: 'all', staffStatus: 'active',
  visitPeriod: 'month',
};

const VIEWS = {};
export const registerViews = (map) => Object.assign(VIEWS, map);

export function go(name, param = null) {
  view.name = name;
  view.param = param;
  render();
  window.scrollTo(0, 0);
}

export function render() {
  if (!isReady()) return;
  const name = settings().clinic.replace(/^Thẩm mỹ viện\s*/i, '') || 'Phương Dung';
  const cn = document.getElementById('clinicName');
  if (cn) cn.textContent = name;

  // giữ con trỏ trong ô tìm kiếm khi màn hình vẽ lại
  const a = document.activeElement;
  const aid = a && a.id;
  const sel = a && a.selectionStart;

  document.getElementById('main').innerHTML = (VIEWS[view.name] || VIEWS.dash)(view.param);
  document.querySelectorAll('[data-nav]').forEach((b) =>
    b.classList.toggle('on', b.dataset.nav === view.name || (view.name === 'customer' && b.dataset.nav === 'customers')));

  if (aid) {
    const el = document.getElementById(aid);
    if (el) { el.focus(); try { el.setSelectionRange(sel, sel); } catch {} }
  }
}
