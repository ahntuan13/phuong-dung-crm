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
  config/firebase-config.js Cấu hình Firebase – file duy nhất cần sửa khi đổi project
  config/env.js             Chọn cấu hình (.env.local nếu có, không thì firebase-config.js)
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

Cấu hình Firebase nằm trong **một file duy nhất**: `src/config/firebase-config.js`.
Đổi thành `export const FIREBASE_CONFIG = null;` để chạy chế độ cục bộ (dữ liệu chỉ ở trình duyệt).
(`.env.local`, nếu có, sẽ được ưu tiên – dùng khi muốn thử với project Firebase khác.)

### Cài đặt 1 lần trong Firebase Console
1. **Security → Authentication → Sign-in method**: bật **Email/Password**.
2. **Databases & Storage → Firestore**: tạo database (Standard edition, vùng `asia-southeast1`).
3. **Firestore → Rules**: dán toàn bộ file `firestore.rules` → **Publish**.
4. Chạy app → màn hình đăng nhập → bấm **“Thiết lập lần đầu”** → tạo tài khoản quản trị đầu tiên.
   (Chỉ làm được 1 lần; sau đó rules tự khoá chức năng này.)

### Tài khoản & phân quyền (trong app, menu “👤 Tài khoản & phân quyền” – chỉ admin)
| Vai trò | Quyền |
|---|---|
| Quản trị | Toàn quyền: tài khoản, hồ sơ nhân sự, cài đặt, sao lưu & khôi phục |
| Nhân viên | Xem và nhập liệu khách hàng, liệu trình, chăm sóc, voucher, thuốc & dịch vụ |
| Chỉ xem | Chỉ xem, không sửa được gì |

- Thêm tài khoản: nhập email + mật khẩu ban đầu + vai trò. Không cần vào Firebase Console.
- Nhân viên nghỉ: bỏ tick “Đang hoạt động” để khoá tài khoản.
- Quên mật khẩu: nút “Gửi email đặt lại mật khẩu” hoặc “Quên mật khẩu?” ở màn hình đăng nhập.
- Mỗi người tự đổi mật khẩu ở menu “Đổi mật khẩu”.

Hồ sơ tài khoản lưu ở collection `users/{uid}` (email, name, role, active). Quyền được kiểm tra ở cả giao diện lẫn `firestore.rules` phía máy chủ.

### Đưa lên mạng
Thêm tên miền của web vào **Security → Authentication → Settings → Authorized domains**, nếu không sẽ không đăng nhập được.

## Sao lưu đám mây (chế độ Firebase)

Menu **☁ Sao lưu đám mây** (chỉ hiện khi đăng nhập chế độ đám mây):
- **Tự động**: lần đầu có người (Quản trị hoặc Nhân viên) đăng nhập mỗi ngày, app tự sao lưu toàn bộ dữ liệu lên Firestore. Giữ 30 bản tự động gần nhất.
- **Sao lưu ngay**: tạo bản sao lưu thủ công (nên bấm trước khi nhập/sửa hàng loạt). Bản thủ công không tự xóa.
- **Khôi phục**: thay toàn bộ dữ liệu bằng bản đã chọn. App tự sao lưu dữ liệu hiện tại trước khi khôi phục.
- **Tải về**: lưu bản sao lưu ra file .json trên máy (bản phòng hờ ngoài Firebase).

Dữ liệu sao lưu nằm ở `backups/{id}` và `backups/{id}/parts/{n}` (code: `src/services/cloudBackup.js`). Nhân viên được tạo bản sao lưu (tự động hằng ngày); **không ai sửa được** bản đã tạo; chỉ quản trị viên xem, khôi phục và xoá. Chạy được với gói miễn phí Spark.

Lớp bảo vệ cao hơn (tùy chọn, cần gói Blaze trả theo dung lượng): bật **Point-in-time recovery** và **Scheduled backups** của chính Firestore trong Firebase Console → Firestore → **Disaster recovery**.
