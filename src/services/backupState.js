// Trạng thái màn hình Sao lưu đám mây (không nạp Firebase ở đây để bản cục bộ nhẹ).
export const backupState = {
  list: null,      // danh sách bản sao lưu (null = chưa tải)
  loading: false,
  busy: '',        // thông báo khi đang sao lưu / khôi phục
  error: '',
  loader: null,    // hàm tải danh sách, gán ở main.js khi chạy chế độ đám mây
};
