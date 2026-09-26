// Đọc cấu hình từ biến môi trường (không nạp thư viện Firebase ở đây để bản cục bộ nhẹ).
const env = import.meta.env;

// Chưa điền (còn trống hoặc còn chữ DIEN_...) → chạy chế độ cục bộ
const filled = (v) => !!v && !/^DIEN_/i.test(v);

export const firebaseConfig = filled(env.VITE_FIREBASE_API_KEY) && filled(env.VITE_FIREBASE_PROJECT_ID) ? {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
} : null;

export const isCloudMode = () => !!firebaseConfig;

