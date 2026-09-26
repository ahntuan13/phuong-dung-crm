// Màn hình Tổng quan: việc cần làm trong ngày.
import { S, byId } from '../data/store.js';
import { esc, money, fdate, todayISO, addDays, daysBetween, greeting } from '../utils/format.js';
import { settings } from '../domain/settings.js';
import { nextBirthday, isComplete, trTotal, retentionList, wished, avgRating, visitStats, visitStatsByMonth } from '../domain/calc.js';
import { UI } from '../router.js';
import { empty } from '../components/cards.js';
import { HERO_ART } from '../assets/illustrations.js';

export function dashboardView() {
  const t = todayISO();
  const bdays = S.customers.map((c) => ({ c, nb: nextBirthday(c.dob) }))
    .filter((x) => x.nb && x.nb.days <= 7).sort((a, b) => a.nb.days - b.nb.days);
  const active = S.treatments.filter((x) => !isComplete(x));

  const upcoming = [];
  S.treatments.forEach((tr) => {
    const i = (tr.steps || []).findIndex((s) => !s.done);
    if (i >= 0) { const s = tr.steps[i]; if (s.planned && daysBetween(t, s.planned) <= 7) upcoming.push({ tr, s, i }); }
  });
  // hẹn tái khám từ ghi nhận chăm sóc
  S.careLogs.forEach((l) => {
    if (l.revisit && l.revisit >= t && daysBetween(t, l.revisit) <= 7) upcoming.push({ revisit: l, s: { planned: l.revisit } });
  });
  upcoming.sort((a, b) => a.s.planned.localeCompare(b.s.planned));

  const follow = S.careLogs.filter((l) => l.followUp && !l.followDone && l.followUp <= addDays(t, 3))
    .sort((a, b) => a.followUp.localeCompare(b.followUp));
  const retain = retentionList().slice(0, 6);
  const month = t.slice(0, 7);
  const rev = S.treatments.filter((x) => (x.startDate || '').startsWith(month)).reduce((a, x) => a + trTotal(x), 0);
  const { avg } = avgRating();

  const upcomingHtml = upcoming.length ? `<ul class="list">${upcoming.map(({ tr, s, i, revisit }) => {
    if (revisit) {
      const c = byId('customers', revisit.customerId);
      return `<li><div><b>${esc(c?.name || '?')}</b> <span class="muted small">${esc(c?.phone || '')}</span>
        <div class="small muted">Hẹn tái khám</div></div>
        <div class="row"><span class="chip rose">${fdate(s.planned)}</span><button class="btn sm" data-open="${revisit.customerId}">Hồ sơ</button></div></li>`;
    }
    const c = byId('customers', tr.customerId); const late = s.planned < t;
    return `<li><div><b>${esc(c?.name || '?')}</b> <span class="muted small">${esc(c?.phone || '')}</span>
      <div class="small muted">${esc(tr.serviceName)} · buổi ${i + 1}/${tr.steps.length}</div></div>
      <div class="row"><span class="chip ${late ? 'warn' : s.planned === t ? 'rose' : ''}">${late ? 'Trễ hẹn ' : ''}${fdate(s.planned)}</span>
      <button class="btn sm" data-act="step" data-tr="${tr.id}" data-i="${i}">Cập nhật</button></div></li>`;
  }).join('')}</ul>` : empty('Không có buổi hẹn nào trong 7 ngày tới.');

  const bdayHtml = bdays.length ? `<ul class="list">${bdays.map(({ c, nb }) =>
    `<li class="${nb.days === 0 ? 'bday-today' : ''}" style="${nb.days === 0 ? 'padding:10px;border-radius:12px' : ''}">
      <div><b>${esc(c.name)}</b><div class="small muted">${fdate(nb.date)} · ${nb.days === 0 ? 'Hôm nay' : 'còn ' + nb.days + ' ngày'}</div></div>
      ${wished(c) ? '<span class="chip ok">Đã chúc</span>' : `<button class="btn sm rose" data-act="wish" data-id="${c.id}">Gửi lời chúc</button>`}</li>`).join('')}</ul>`
    : empty('Không có sinh nhật nào trong tuần này.');

  const followHtml = follow.length ? `<ul class="list">${follow.map((l) => {
    const c = byId('customers', l.customerId);
    return `<li><div><b>${esc(c?.name || '?')}</b> <span class="small muted">${esc(c?.phone || '')}</span>
      <div class="small muted">${esc(l.content || '').slice(0, 80)}</div></div>
      <div class="row"><span class="chip ${l.followUp < t ? 'warn' : ''}">${fdate(l.followUp)}</span>
      <button class="btn sm" data-act="care-add" data-cid="${l.customerId}" data-close="${l.id}">Ghi cuộc gọi</button></div></li>`;
  }).join('')}</ul>` : empty('Không có cuộc gọi lại nào đến hạn.');

  const retainHtml = retain.length ? `<ul class="list">${retain.map((r) =>
    `<li><div><b>${esc(r.c.name)}</b><div class="small muted">${esc(r.reason)}</div></div>
      <button class="btn sm" data-act="voucher-add" data-cid="${r.c.id}">Tặng voucher</button></li>`).join('')}</ul>`
    : empty('Chưa có khách nào cần giữ chân.');

  return `
  <section class="hero"><div class="txt"><div class="hi">Chào buổi ${greeting()},</div><h1>${esc(settings().clinic)}</h1>
    <p>Hôm nay ${fdate(t)} · ${upcoming.filter((x) => x.s.planned === t).length} buổi hẹn · ${bdays.filter((x) => x.nb.days === 0).length} sinh nhật · ${follow.length} cuộc gọi lại</p></div>
    <div class="art">${HERO_ART}</div></section>
  <div class="stats"><div><b>${S.customers.length}</b><span>Khách hàng</span></div><div><b>${active.length}</b><span>Liệu trình đang chạy</span></div>
    <div><b>${money(rev)}</b><span>Doanh thu liệu trình tháng này</span></div><div><b>${avg ? avg.toFixed(1) : '—'}</b><span>Điểm hài lòng trung bình</span></div></div>
  ${visitsPanel(t)}
  <div class="grid g2 g4-wide">
    <section class="panel"><h2>Lịch hẹn 7 ngày tới</h2>${upcomingHtml}</section>
    <section class="panel"><h2>Sinh nhật sắp tới</h2>${bdayHtml}</section>
    <section class="panel"><h2>Cần gọi lại</h2>${followHtml}</section>
    <section class="panel"><h2>Khách nên tặng voucher giữ chân</h2>${retainHtml}</section>
  </div>`;
}

/** Lượt khách trong tháng / năm: tổng lượt, số khách, khách mới, khách cũ */
function visitsPanel(t) {
  const year = t.slice(0, 4);
  const isYear = UI.visitPeriod === 'year';
  const from = isYear ? `${year}-01-01` : `${t.slice(0, 7)}-01`;
  const st = visitStats(from, t);
  const pctNew = st.customers ? Math.round((st.newC / st.customers) * 100) : 0;

  let chart = '';
  if (isYear) {
    const months = visitStatsByMonth(year);
    const max = Math.max(1, ...months.map((m) => m.customers));
    chart = `<div class="vchart" role="img" aria-label="Khách mới và khách cũ theo tháng năm ${year}">${months.map((m) => `
      <div class="vcol ${m.month === +t.slice(5, 7) ? 'cur' : ''}" title="Tháng ${m.month}: ${m.visits} lượt · ${m.newC} mới · ${m.oldC} cũ">
        <span class="vval">${m.customers || ''}</span>
        <div class="vbar"><i class="old" style="height:${(m.oldC / max) * 100}%"></i><i class="new" style="height:${(m.newC / max) * 100}%"></i></div>
        <span class="vlab">T${m.month}</span></div>`).join('')}</div>`;
  } else {
    chart = `<div class="vsplit"><i class="new" style="width:${pctNew}%"></i><i class="old" style="width:${st.customers ? 100 - pctNew : 0}%"></i></div>
      <p class="small muted" style="margin:6px 0 0">${st.customers ? `${pctNew}% khách mới · ${100 - pctNew}% khách cũ` : 'Chưa có buổi nào được ghi nhận trong tháng.'}</p>`;
  }

  return `<section class="panel visits" style="margin-bottom:18px">
    <div class="row" style="justify-content:space-between;margin-bottom:12px">
      <h2 style="margin:0">Lượt khách ${isYear ? 'năm ' + year : 'tháng ' + t.slice(5, 7) + '/' + year}</h2>
      <div class="tabs" style="margin:0"><button class="${!isYear ? 'on' : ''}" data-tab="visitPeriod:month">Tháng này</button>
        <button class="${isYear ? 'on' : ''}" data-tab="visitPeriod:year">Năm nay</button></div></div>
    <div class="vwrap">
      <div class="vnums">
        <div><b>${st.visits}</b><span>Lượt khách (buổi đã làm)</span></div>
        <div><b>${st.customers}</b><span>Số khách đến</span></div>
        <div><b class="c-new">${st.newC}</b><span><i class="lg new"></i>Khách mới</span></div>
        <div><b class="c-old">${st.oldC}</b><span><i class="lg old"></i>Khách cũ</span></div>
      </div>
      <div class="vgraph">${chart}</div>
    </div>
    <p class="fhint" style="margin-top:10px">Khách mới: lần đầu làm dịch vụ trong kỳ. Khách cũ: đã từng làm trước kỳ này và quay lại.</p>
  </section>`;
}
