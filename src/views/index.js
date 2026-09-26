// Bản đồ tên màn hình → hàm vẽ. Thêm màn hình mới: tạo file trong views/ rồi khai báo ở đây.
import { dashboardView } from './dashboard.js';
import { customersView } from './customers.js';
import { customerDetailView } from './customerDetail.js';
import { lookupView } from './lookup.js';
import { catalogView } from './catalog.js';
import { careView } from './care.js';
import { vouchersView } from './vouchers.js';
import { staffView } from './staff.js';
import { backupsView } from './backups.js';
import { usersView } from './users.js';

export const VIEWS = {
  dash: dashboardView,
  customers: customersView,
  customer: customerDetailView,
  lookup: lookupView,
  catalog: catalogView,
  care: careView,
  vouchers: vouchersView,
  staff: staffView,
  backups: backupsView,
  users: usersView,
};
