# Phương Dung CRM — Quản lý & chăm sóc khách hàng

Web app quản lý khách hàng, liệu trình và chăm sóc khách cho thẩm mỹ viện.
Viết bằng **JavaScript thuần (ES modules)**, đóng gói bằng **Vite**, xuất Excel bằng **SheetJS (xlsx)**.

## Chạy thử

Yêu cầu: Node.js 18 trở lên.

```bash
npm install
npm run dev        # mở http://localhost:5173, sửa code là trình duyệt tự cập nhật
```

Build để đưa lên hosting:

```bash
npm run build      # kết quả nằm trong thư mục dist/
npm run preview    # xem thử bản build tại http://localhost:4173
```

Thư mục `dist/` là web tĩnh, có thể đưa lên bất kỳ hosting nào (IIS, Nginx, Netlify, Vercel, GitHub Pages…).
Lưu ý: bản build cần chạy qua web server, không mở trực tiếp bằng cách nhấp đúp file `index.html`.

## Cấu trúc thư mục

```
index.html                  Khung trang (menu, vùng nội dung, hộp thoại)
public/                     File tĩnh (favicon)
src/
  config/env.js             Đọc cấu hình Firebase từ .env.local
  config/firebase.js        Khởi tạo Firebase Auth + Firestore
  main.js                   Điểm khởi động: nạp CSS, kết nối dữ liệu, gắn sự kiện (bảng ACTIONS)
  router.js                 Điều hướng màn hình + trạng thái giao diện (UI)
  styles/
    tokens.css              Bảng màu, font — đổi theme tại đây
    base.css                Reset, chữ, khung sidebar + main
    components.css          Nút, chip, bảng, tab, form, dialog, toast
    features.css            Hero, thống kê, hồ sơ khách, lộ trình, voucher
    responsive.css          Điện thoại / máy tính bảng
  assets/illustrations.js   Hình minh họa SVG (hoa, chân dung, icon menu)
  data/
    store.js                Kho dữ liệu trung tâm: S, save(), del(), byId()
    adapters/local.js       Lưu vào localStorage (mặc định, dùng để test)
    adapters/firebase.js    Lưu trên Cloud Firestore – nhiều người dùng, realtime
    adapters/rest.js        Mẫu kết nối backend REST API
    seed.js                 Danh mục mẫu (26 thuốc/vật tư, 8 dịch vụ, giá demo)
  domain/
    calc.js                 Nghiệp vụ: tính tiền, tiến độ, sinh nhật, voucher, giữ chân
    settings.js             Tên thẩm mỹ viện, lời chúc mẫu
    catalog.js              Nhóm thuốc / vật tư, đơn vị tính, sắp xếp theo nhóm
    staff.js                Chức vụ, bộ phận, trạng thái; sinh mã NV0001; danh sách chọn bác sĩ / y tá
  utils/
    format.js               Định dạng tiền, ngày, bỏ dấu tiếng Việt…
    ui.js                   Toast, sao chép, tải file
  components/
    login.js                Màn hình đăng nhập (chế độ đám mây)
    dialog.js               Hộp thoại form động + xác nhận
    cards.js                Thẻ liệu trình (lộ trình), ghi nhận chăm sóc, voucher
  views/                    Mỗi màn hình một file — khai báo trong views/index.js
    dashboard.js  customers.js  customerDetail.js  lookup.js  catalog.js  care.js  vouchers.js  staff.js
  forms/                    Form nhập liệu
    customerForm.js  catalogForms.js  treatmentForm.js  stepForm.js
    careForm.js  voucherForm.js  birthday.js  staffForm.js
  services/
    exportExcel.js          Xuất Excel 8 sheet
    backup.js               Sao lưu / khôi phục JSON
```

Luồng hoạt động: **view** chỉ đọc dữ liệu từ `S` và trả về HTML → nút bấm có `data-act="..."` →
`main.js` gọi hàm tương ứng trong **forms/** → form gọi `save()` / `del()` của **store** →
store báo thay đổi → `router.render()` vẽ lại màn hình.

## Mô hình dữ liệu (collections)

| Collection  | Nội dung chính |
|-------------|----------------|
| customers   | title, name, phone, email, dob, address, source, note, wishedYears[] |
| medicines   | group (nhóm), icon, name, unit (ĐVT), price, note |
| services    | name, price, sessions, interval, desc |
| treatments  | customerId, serviceId, serviceName, doctorId, nurseId, startDate, endDate, price, voucherId, discount, paid, steps[] |
|   steps[]   | title, planned, done, doneDate, staff, note, meds[{medId, name, unit, qty, price}] |
| careLogs    | customerId, date, kind (review/birthday), channel, nurseId, rating, content, followUp, followDone, revisit (hẹn tái khám) |
| vouchers    | code, title, customerId, serviceId, type (percent/amount), value, expiry, status, usedAt |
| staff       | code (NV0001), name, position (Bác sĩ/Y tá/Lễ tân/Kỹ thuật viên/Tư vấn viên), department (Hành chính/Kỹ thuật/Dịch vụ), phone, email, startDate, status (active/leave/resigned), note |
| settings    | id = "main": clinic, bdayMsg |

Mọi bản ghi có `id`, `createdAt`, `updatedAt`.

## Kết nối backend thật

1. Làm API theo quy ước trong `src/data/adapters/rest.js` (GET/POST/PUT/DELETE theo từng collection).
2. Trong `src/main.js`, bỏ comment dòng import và đổi:
   ```js
   initStore(createRestAdapter({ baseUrl: '/api', token: '...' }))
   ```
Giao diện không cần sửa gì. Có thể viết thêm adapter khác (Firebase, Supabase…) miễn có đủ 3 hàm `init`, `save`, `remove`.

## Thêm màn hình mới

1. Tạo `src/views/tenManHinh.js` export một hàm trả về HTML.
2. Khai báo trong `src/views/index.js`.
3. Thêm nút `<button data-nav="tenManHinh" data-icon="...">` trong `index.html`.

## Thống kê lượt khách (trang Tổng quan)

Mỗi buổi liệu trình được đánh dấu "đã làm" tính là 1 lượt khách. **Khách mới** là khách có buổi đầu tiên rơi vào kỳ đang xem; **khách cũ** là khách đã từng làm trước kỳ đó và quay lại. Logic nằm trong `domain/calc.js` (`visitStats`, `visitStatsByMonth`).

## Dùng chung nhiều người (Firebase)

Không có file `.env.local` → app chạy **chế độ cục bộ** (dữ liệu chỉ ở trình duyệt đang dùng).
Có cấu hình Firebase → app chạy **chế độ đám mây**: phải đăng nhập, mọi người thấy cùng một dữ liệu và tự cập nhật khi có người sửa.

### 1. Tạo project Firebase (nên tạo project riêng cho app này)
1. Vào https://console.firebase.google.com → **Add project**.
2. **Build → Firestore Database → Create database** (chọn vùng `asia-southeast1` – Singapore).
3. **Build → Authentication → Get started → Email/Password → Enable**.
4. **Project settings → Your apps → Web (</>)** → đăng ký app → copy khối `firebaseConfig`.

### 2. Cấu hình app
Cách nhanh: chạy `npm run setup`, dán nguyên đoạn `firebaseConfig` copy từ Firebase Console → file `.env.local` được tạo tự động.

Cách tay: copy `.env.example` thành `.env.local` rồi điền từng giá trị. Xong chạy lại `npm run dev`.

### 3. Bảo mật – bắt buộc
- **Firestore → Rules**: dán nội dung file `firestore.rules` → **Publish**.
- **Authentication → Users → Add user**: tạo tài khoản cho từng nhân viên (email + mật khẩu).
- **Firestore → Data → Start collection** `allowedUsers` → mỗi nhân viên 1 document, **Document ID = email viết thường** (vd `lan@clinic.vn`), thêm field bất kỳ (vd `name`).
  Chỉ email có trong `allowedUsers` mới đọc/ghi được dữ liệu. Muốn thu hồi quyền: xóa document đó.

> Lý do cần `allowedUsers`: API key của Firebase là công khai trong web, nên luật bảo mật phải tự giới hạn ai được truy cập.

### 4. Chuyển dữ liệu đang test sang đám mây
1. Ở bản cục bộ bấm **Sao lưu dữ liệu (.json)**.
2. Chạy bản đã cấu hình Firebase, đăng nhập, bấm **Khôi phục từ file** và chọn file vừa tải.

### 5. Đưa lên mạng (ví dụ Cloudflare Pages)
- Build command: `npm run build` · Output directory: `dist`
- Thêm các biến `VITE_FIREBASE_*` trong **Settings → Environment variables**.
- **Quan trọng:** thêm tên miền của web vào **Firebase → Authentication → Settings → Authorized domains**, nếu không sẽ không đăng nhập được.

## Sao lưu đám mây (chế độ Firebase)

Menu **☁ Sao lưu đám mây** (chỉ hiện khi đăng nhập chế độ đám mây):
- **Tự động**: lần đầu có người đăng nhập mỗi ngày, app tự sao lưu toàn bộ dữ liệu lên Firestore. Giữ 30 bản tự động gần nhất.
- **Sao lưu ngay**: tạo bản sao lưu thủ công (nên bấm trước khi nhập/sửa hàng loạt). Bản thủ công không tự xóa.
- **Khôi phục**: thay toàn bộ dữ liệu bằng bản đã chọn. App tự sao lưu dữ liệu hiện tại trước khi khôi phục.
- **Tải về**: lưu bản sao lưu ra file .json trên máy (bản phòng hờ ngoài Firebase).

Dữ liệu sao lưu nằm trong collection `backups` và `backupChunks` (code: `src/services/cloudBackup.js`). Chạy được với gói miễn phí Spark.

Lớp bảo vệ cao hơn (tùy chọn, cần gói Blaze trả theo dung lượng): bật **Point-in-time recovery** và **Scheduled backups** của chính Firestore trong Firebase Console → Firestore → **Disaster recovery**.
