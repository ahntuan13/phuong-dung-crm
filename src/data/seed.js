// Dữ liệu mẫu cho bản demo (giá tham khảo, không phải giá thật).
// Nạp bằng nút “Nạp danh mục mẫu” ở màn hình Thuốc & dịch vụ — chỉ thêm mục chưa có (so theo tên).

export const SEED_MEDICINES = [
  { group: 'Thuốc gây tê', icon: '💉', name: 'Lidocaine 2%',                  unit: 'Hộp',     price: 120000 },
  { group: 'Thuốc gây tê', icon: '💉', name: 'EMLA Cream',                    unit: 'Tuýp',    price: 185000 },
  { group: 'Giảm đau',     icon: '💊', name: 'Paracetamol 500mg',             unit: 'Hộp',     price: 35000 },
  { group: 'Giảm đau',     icon: '💊', name: 'Ibuprofen 400mg',               unit: 'Hộp',     price: 60000 },
  { group: 'Kháng dị ứng', icon: '💊', name: 'Cetirizine 10mg',               unit: 'Hộp',     price: 45000 },
  { group: 'Kháng dị ứng', icon: '💊', name: 'Loratadine 10mg',               unit: 'Hộp',     price: 50000 },
  { group: 'Sát khuẩn',    icon: '🧴', name: 'Povidone Iodine 10%',           unit: 'Chai',    price: 45000 },
  { group: 'Sát khuẩn',    icon: '🧴', name: 'Cồn 70°',                       unit: 'Chai',    price: 25000 },
  { group: 'Sát khuẩn',    icon: '🧴', name: 'Chlorhexidine',                 unit: 'Chai',    price: 85000 },
  { group: 'Dịch truyền',  icon: '💧', name: 'NaCl 0.9% 500ml',               unit: 'Chai',    price: 15000 },
  { group: 'Vật tư tiêm',  icon: '💉', name: 'Kim tiêm 30G',                  unit: 'Hộp',     price: 150000 },
  { group: 'Vật tư tiêm',  icon: '💉', name: 'Syringe 1ml',                   unit: 'Hộp',     price: 120000 },
  { group: 'Vật tư tiêm',  icon: '💉', name: 'Syringe 5ml',                   unit: 'Hộp',     price: 110000 },
  { group: 'Vật tư',       icon: '🩹', name: 'Gạc vô trùng',                  unit: 'Gói',     price: 20000 },
  { group: 'Vật tư',       icon: '🩹', name: 'Băng cá nhân',                  unit: 'Hộp',     price: 30000 },
  { group: 'Vật tư',       icon: '🩹', name: 'Băng thun',                     unit: 'Cuộn',    price: 25000 },
  { group: 'Vật tư',       icon: '🧤', name: 'Găng tay y tế',                 unit: 'Hộp',     price: 90000 },
  { group: 'Vật tư',       icon: '😷', name: 'Khẩu trang y tế',               unit: 'Hộp',     price: 40000 },
  { group: 'Mỹ phẩm',      icon: '🧪', name: 'Serum Vitamin C',               unit: 'Chai',    price: 450000 },
  { group: 'Mỹ phẩm',      icon: '🧪', name: 'Hyaluronic Acid Serum',         unit: 'Chai',    price: 420000 },
  { group: 'Mỹ phẩm',      icon: '🧪', name: 'Kem phục hồi da',               unit: 'Tuýp',    price: 350000 },
  { group: 'Mỹ phẩm',      icon: '🧪', name: 'Kem chống nắng',                unit: 'Tuýp',    price: 380000 },
  { group: 'Botox/Filler', icon: '✨', name: 'Botulinum toxin – Demo',        unit: 'Lọ',      price: 4500000 },
  { group: 'Botox/Filler', icon: '✨', name: 'Hyaluronic Acid Filler – Demo', unit: 'Syringe', price: 5500000 },
  { group: 'Tiêu hao',     icon: '🧹', name: 'Khăn giấy y tế',                unit: 'Gói',     price: 15000 },
  { group: 'Tiêu hao',     icon: '🧹', name: 'Túi rác y tế',                  unit: 'Cuộn',    price: 35000 },
];

export const SEED_SERVICES = [
  { name: 'Trị nám Laser Pico',       price: 6000000, sessions: 5, interval: 14, desc: 'Laser Pico điều trị nám, tàn nhang' },
  { name: 'Căng da mặt Hifu',         price: 8000000, sessions: 2, interval: 30, desc: 'Nâng cơ, trẻ hóa không phẫu thuật' },
  { name: 'Tiêm Botox gọn hàm',       price: 4500000, sessions: 1, interval: 0,  desc: 'Thon gọn góc hàm' },
  { name: 'Tiêm Filler môi',          price: 6000000, sessions: 1, interval: 0,  desc: 'Tạo dáng môi bằng HA Filler' },
  { name: 'Meso căng bóng da',        price: 2500000, sessions: 5, interval: 14, desc: 'Cấp ẩm, căng bóng da' },
  { name: 'Trị mụn chuyên sâu',       price: 1800000, sessions: 6, interval: 7,  desc: 'Lấy nhân mụn, điện di, kháng viêm' },
  { name: 'Peel da sinh học',         price: 1200000, sessions: 4, interval: 14, desc: 'Tái tạo bề mặt da' },
  { name: 'Triệt lông nách Diode',    price: 2000000, sessions: 8, interval: 30, desc: 'Triệt lông bằng laser Diode' },
];
