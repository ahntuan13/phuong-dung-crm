// Cấu hình của thẩm mỹ viện (lưu trong collection "settings", bản ghi id = "main").
import { byId } from '../data/store.js';

export const DEFAULT_SETTINGS = {
  clinic: 'Thẩm mỹ viện Phương Dung',
  bdayMsg:
    'Chúc mừng sinh nhật {xungho} {ten}! {clinic} chúc {xungho} tuổi mới luôn xinh đẹp, rạng rỡ và thật nhiều niềm vui. ' +
    'Nhân dịp này, {clinic} gửi tặng {xungho} {voucher}. Hẹn gặp {xungho} tại spa nhé!',
};

export const settings = () => ({ ...DEFAULT_SETTINGS, ...(byId('settings', 'main') || {}) });
