// Chọn cấu hình Firebase: ưu tiên .env.local (nếu có, dùng khi test project khác), còn lại lấy firebase-config.js.
// Không nạp thư viện Firebase ở đây để bản cục bộ nhẹ.
import { FIREBASE_CONFIG } from './firebase-config.js';

const env = import.meta.env;
const filled = (v) => !!v && !/^DIEN_/i.test(v);

const fromEnv = filled(env.VITE_FIREBASE_API_KEY) && filled(env.VITE_FIREBASE_PROJECT_ID) ? {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
} : null;

export const firebaseConfig = fromEnv || FIREBASE_CONFIG || null;
export const isCloudMode = () => !!firebaseConfig?.apiKey;
