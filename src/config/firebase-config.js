/* =====================================================================
   CẤU HÌNH FIREBASE – ĐÂY LÀ FILE DUY NHẤT BẠN CẦN SỬA KHI ĐỔI PROJECT
   - Lấy tại: Firebase Console → Project settings → Your apps → Config
   - Đổi thành:  export const FIREBASE_CONFIG = null;  để chạy chế độ cục bộ
     (dữ liệu chỉ lưu trên trình duyệt, không dùng chung).
   - apiKey của Firebase web được phép công khai; quyền truy cập do
     firestore.rules và danh sách tài khoản trong app kiểm soát.
   ===================================================================== */
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC3-KG6ZUh7zAvmcEHrTGU0GOVpq_dzwic',
  authDomain: 'phuongdung-d0f3f.firebaseapp.com',
  projectId: 'phuongdung-d0f3f',
  storageBucket: 'phuongdung-d0f3f.firebasestorage.app',
  messagingSenderId: '580797179677',
  appId: '1:580797179677:web:7d6e14546999b81fbbe3f4',
};
