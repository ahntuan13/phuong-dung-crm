// Thêm / sửa / xóa khách hàng.
import { S, save, del } from '../data/store.js';
import { esc, digits } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { openForm, confirmBox, formError } from '../components/dialog.js';
import { custTreatments } from '../domain/calc.js';
import { go } from '../router.js';

export function customerForm(c = {}) {
  openForm({
    title: c.id ? 'Sửa thông tin khách' : 'Thêm khách hàng',
    fields: [
      { k: 'title', label: 'Xưng hô', type: 'select', value: c.title || 'Chị', options: ['Chị', 'Anh', 'Cô', 'Chú', 'Bạn', 'Em'].map((x) => [x, x]) },
      { k: 'name', label: 'Họ và tên *', value: c.name, required: true },
      { k: 'phone', label: 'Số điện thoại *', type: 'tel', value: c.phone, required: true },
      { k: 'email', label: 'Email', type: 'email', value: c.email },
      { k: 'dob', label: 'Ngày sinh', type: 'date', value: c.dob },
      { k: 'source', label: 'Nguồn khách', type: 'select', value: c.source || '',
        options: ['', 'Facebook', 'Zalo', 'TikTok', 'Người quen giới thiệu', 'Khách vãng lai', 'Khác'].map((x) => [x, x]) },
      { k: 'address', label: 'Địa chỉ', value: c.address, full: true },
      { k: 'note', label: 'Ghi chú (dị ứng, bệnh nền, lưu ý…)', type: 'textarea', value: c.note, full: true },
    ],
    onSave: async (v) => {
      const dup = S.customers.find((x) => x.id !== c.id && digits(x.phone) && digits(x.phone) === digits(v.phone));
      if (dup) { formError(`Số điện thoại này đã thuộc khách “${dup.name}”.`); return false; }
      const id = await save('customers', { ...c, ...v });
      toast(c.id ? 'Đã lưu thông tin khách' : 'Đã thêm khách hàng');
      if (!c.id) go('customer', id);
    },
  });
}

export function deleteCustomer(c) {
  confirmBox(`Xóa khách “${esc(c.name)}”? Các liệu trình và ghi nhận chăm sóc của khách cũng sẽ bị xóa.`, async () => {
    for (const t of custTreatments(c.id)) await del('treatments', t.id);
    for (const l of S.careLogs.filter((x) => x.customerId === c.id)) await del('careLogs', l.id);
    await del('customers', c.id);
    go('customers');
    toast('Đã xóa khách');
  });
}
