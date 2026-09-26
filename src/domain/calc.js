// Nghiệp vụ: tính tiền liệu trình, tiến độ, sinh nhật, voucher, gợi ý giữ chân.
import { S, byId } from '../data/store.js';
import { todayISO, daysBetween, addDays, money } from '../utils/format.js';

export const custTreatments = (cid) =>
  S.treatments.filter((t) => t.customerId === cid).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));

export const stepsDone = (t) => (t.steps || []).filter((s) => s.done).length;
export const isComplete = (t) => (t.steps || []).length > 0 && stepsDone(t) === t.steps.length;

export const medCost = (t) =>
  (t.steps || []).reduce((a, s) => a + (s.meds || []).reduce((b, m) => b + (+m.qty || 0) * (+m.price || 0), 0), 0);

export const trTotal = (t) => (+t.price || 0) + medCost(t) - (+t.discount || 0);
export const trDebt = (t) => trTotal(t) - (+t.paid || 0);
export const custSpend = (cid) => custTreatments(cid).reduce((a, t) => a + trTotal(t), 0);

export function lastActivity(cid) {
  let d = '';
  custTreatments(cid).forEach((t) => (t.steps || []).forEach((s) => { if (s.done && s.doneDate > d) d = s.doneDate; }));
  S.careLogs.forEach((l) => { if (l.customerId === cid && l.date > d) d = l.date; });
  return d;
}

export function nextBirthday(dob) {
  if (!dob) return null;
  const t = todayISO();
  const y = +t.slice(0, 4);
  let nb = y + dob.slice(4, 10);
  if (nb < t) nb = y + 1 + dob.slice(4, 10);
  return { date: nb, days: daysBetween(t, nb) };
}

/** Đã chúc sinh nhật năm nay và sinh nhật đang trong tuần */
export const wished = (c) =>
  (c.wishedYears || []).includes(todayISO().slice(0, 4)) && nextBirthday(c.dob)?.days <= 7;

export function voucherValid(v, cid, sid) {
  if (v.status === 'used') return false;
  if (v.expiry && v.expiry < todayISO()) return false;
  if (v.customerId && cid && v.customerId !== cid) return false;
  if (v.serviceId && sid && v.serviceId !== sid) return false;
  return true;
}

export const voucherLabel = (v) => (v.type === 'percent' ? `giảm ${v.value}%` : `giảm ${money(v.value)}`);

export const voucherDiscount = (v, price) =>
  !v ? 0 : v.type === 'percent' ? Math.round((+price || 0) * v.value / 100) : Math.min(+v.value || 0, +price || 0);

/** Đơn giá thuốc theo từng khách: lấy giá lần gần nhất khách dùng, nếu chưa có thì lấy giá niêm yết */
export function lastMedPrice(cid, medId) {
  let best = null, bd = '';
  custTreatments(cid).forEach((t) => (t.steps || []).forEach((s) => (s.meds || []).forEach((m) => {
    if (m.medId === medId && (s.doneDate || '') >= bd) { bd = s.doneDate || ''; best = m.price; }
  })));
  if (best != null) return best;
  return byId('medicines', medId)?.price || 0;
}

/** Khách đã hoàn thành liệu trình, không có voucher còn hạn → nên tặng voucher giữ chân */
export function retentionList() {
  const t = todayISO();
  const out = [];
  S.customers.forEach((c) => {
    const trs = custTreatments(c.id);
    if (!trs.length) return;
    if (S.vouchers.some((v) => v.customerId === c.id && voucherValid(v, c.id))) return;
    const la = lastActivity(c.id);
    if (!trs.some((x) => !isComplete(x)) && la) {
      const d = daysBetween(la, t);
      out.push({ c, d, reason: `Đã xong liệu trình, ${d} ngày chưa quay lại` });
    }
  });
  return out.sort((a, b) => b.d - a.d);
}

export const avgRating = () => {
  const rs = S.careLogs.filter((l) => l.rating);
  return { count: rs.length, avg: rs.length ? rs.reduce((a, l) => a + +l.rating, 0) / rs.length : null, list: rs };
};

/** Chia đều ngày hẹn của n buổi trong khoảng [start, end] */
export function planDates(start, end, n) {
  if (n <= 1 || !end || end <= start) return Array.from({ length: n }, (_, i) => (i === 0 || !end ? start : end));
  const gap = daysBetween(start, end) / (n - 1);
  return Array.from({ length: n }, (_, i) => addDays(start, Math.round(i * gap)));
}

/** Điều chỉnh danh sách buổi khi đổi tổng số buổi / ngày bắt đầu–kết thúc. Buổi đã làm giữ nguyên. */
export function reconcileSteps(old, n, start, end) {
  let steps = old.map((s) => ({ ...s }));
  while (steps.length < n) steps.push({ done: false, meds: [] });
  while (steps.length > n) {
    let idx = -1;
    steps.forEach((s, i) => { if (!s.done) idx = i; });
    if (idx < 0) break;
    steps.splice(idx, 1);
  }
  const dates = planDates(start, end, steps.length);
  return steps.map((s, i) => ({
    ...s,
    title: !s.title || /^Buổi \d+$/.test(s.title) ? 'Buổi ' + (i + 1) : s.title,
    planned: s.done ? s.planned : dates[i],
  }));
}

/* ---------- Lượt khách: mỗi buổi đã làm = 1 lượt ---------- */
function visitLog() {
  const v = [];
  S.treatments.forEach((t) => (t.steps || []).forEach((s) => { if (s.done && s.doneDate) v.push({ cid: t.customerId, date: s.doneDate }); }));
  return v;
}

/** Thống kê lượt khách trong [from, to]. Khách mới = lần đầu làm dịch vụ rơi vào kỳ này. */
export function visitStats(from, to, log = visitLog()) {
  const first = {};
  log.forEach((x) => { if (!first[x.cid] || x.date < first[x.cid]) first[x.cid] = x.date; });
  const inRange = log.filter((x) => x.date >= from && x.date <= to);
  const custs = new Set(inRange.map((x) => x.cid));
  let newC = 0;
  custs.forEach((c) => { if (first[c] >= from) newC++; });
  return { visits: inRange.length, customers: custs.size, newC, oldC: custs.size - newC };
}

export function visitStatsByMonth(year) {
  const log = visitLog();
  return Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    return { month: i + 1, ...visitStats(`${year}-${m}-01`, `${year}-${m}-31`, log) };
  });
}
