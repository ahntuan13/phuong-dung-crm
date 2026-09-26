// Khởi tạo Firebase (Auth + Firestore). Cấu hình nằm trong src/config/firebase-config.js.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

import { firebaseConfig } from './env.js';

let cached = null;
export function initFirebase() {
  if (cached) return cached;
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  // Cache offline: mất mạng vẫn xem được, có mạng lại tự đồng bộ
  const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  cached = { app, auth, db };
  return cached;
}
