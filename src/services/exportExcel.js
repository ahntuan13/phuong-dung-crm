// Xuất toàn bộ dữ liệu ra file Excel nhiều sheet (thư viện SheetJS / xlsx).
import * as XLSX from 'xlsx';
import { S, byId } from '../data/store.js';
import { fdate, todayISO } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { STAFF_STATUS, staffName } from '../domain/staff.js';
import { sortMeds } from '../domain/catalog.js';
import { custSpend, stepsDone, medCost, trTotal, trDebt, voucherLabel, voucherValid } from '../domain/calc.js';

const cname = (id) => byId('customers', id)?.name || '';

export function exportExcel() {
  const wb = XLSX.utils.book_new();
  const add = (name, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), name);

  add('Khách hàng', S.customers.map((c) => ({
    'Xưng hô': c.title || '', 'Họ tên': c.name, 'SĐT': c.phone, 'Email': c.email || '', 'Ngày sinh': fdate(c.dob),
    'Địa chỉ': c.address || '', 'Nguồn': c.source || '', 'Ghi chú': c.note || '', 'Tổng chi tiêu': custSpend(c.id),
  })));

  add('Liệu trình', S.treatments.map((t) => ({
    'Khách hàng': cname(t.customerId), 'Dịch vụ': t.serviceName, 'Bắt đầu': fdate(t.startDate), 'Kết thúc': fdate(t.endDate), 'Bác sĩ': staffName(t.doctorId) || t.staff || '', 'Điều dưỡng / Y tá': staffName(t.nurseId), 'Tiến độ': `${stepsDone(t)}/${(t.steps || []).length}`,
    'Giá DV': +t.price || 0, 'Tiền thuốc': medCost(t), 'Giảm voucher': +t.discount || 0, 'Tổng': trTotal(t), 'Đã thu': +t.paid || 0,
    'Còn nợ': trDebt(t),
  })));

  const steps = [];
  S.treatments.forEach((t) => (t.steps || []).forEach((s, i) => {
    const meds = s.meds?.length ? s.meds : [{}];
    meds.forEach((m) => steps.push({
      'Khách hàng': cname(t.customerId), 'Dịch vụ': t.serviceName, 'Buổi': s.title || 'Buổi ' + (i + 1), 'Ngày hẹn': fdate(s.planned),
      'Đã làm': s.done ? 'Có' : 'Chưa', 'Ngày làm': fdate(s.doneDate), 'Nhân viên': s.staff || '', 'Thuốc': m.name || '',
      'Liều lượng': m.qty ?? '', 'Đơn vị': m.unit || '', 'Đơn giá': m.price ?? '', 'Thành tiền': m.name ? (m.qty || 0) * (m.price || 0) : '', 'Ghi chú': s.note || '',
    }));
  }));
  add('Chi tiết buổi', steps);

  add('Danh sách thuốc', sortMeds(S.medicines).map((m) => ({ 'Nhóm': m.group || '', 'Tên thuốc': m.name, 'Đơn vị': m.unit || '', 'Đơn giá': +m.price || 0, 'Ghi chú': m.note || '' })));
  add('Dịch vụ', S.services.map((s) => ({ 'Dịch vụ': s.name, 'Giá': +s.price || 0, 'Số buổi': s.sessions || 1, 'Cách nhau (ngày)': s.interval ?? '', 'Mô tả': s.desc || '' })));
  add('Chăm sóc', S.careLogs.map((l) => ({
    'Ngày': fdate(l.date), 'Khách hàng': cname(l.customerId), 'Loại': l.kind === 'birthday' ? 'Chúc sinh nhật' : 'Hỏi thăm',
    'Hình thức': l.channel || '', 'Điều dưỡng / Y tá': staffName(l.nurseId) || l.staff || '', 'Số sao': l.rating || '', 'Nội dung': l.content || '', 'Hẹn gọi lại': fdate(l.followUp), 'Hẹn tái khám': fdate(l.revisit),
  })));
  add('Voucher', S.vouchers.map((v) => ({
    'Mã': v.code, 'Chương trình': v.title || '', 'Khách': cname(v.customerId), 'Dịch vụ áp dụng': byId('services', v.serviceId)?.name || 'Mọi dịch vụ',
    'Mức giảm': voucherLabel(v), 'HSD': fdate(v.expiry), 'Trạng thái': v.status === 'used' ? 'Đã dùng' : voucherValid(v) ? 'Còn hiệu lực' : 'Hết hạn',
  })));

  add('Nhân sự', S.staff.map((p) => ({
    'Mã nhân viên': p.code, 'Họ tên': p.name, 'Chức vụ': p.position || '', 'Bộ phận': p.department || '', 'Số điện thoại': p.phone || '',
    'Email': p.email || '', 'Ngày vào làm': fdate(p.startDate), 'Trạng thái': STAFF_STATUS[p.status]?.label || '',
  })));

  try { XLSX.writeFile(wb, `PhuongDung_KhachHang_${todayISO()}.xlsx`); toast('Đã xuất file Excel'); }
  catch { toast('Không xuất được file Excel'); }
}
