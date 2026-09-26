// Quản lý tài khoản đăng nhập (chỉ quản trị viên) – lưu hồ sơ ở collection "users/{uid}".
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail,
  EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { initFirebase } from '../config/firebase.js';
import { firebaseConfig } from '../config/env.js';

import { usersState } from './usersState.js';
export { usersState };
let unsub = null;

/** Admin: nghe danh sách tài khoản realtime */
export function watchUsers(onChange) {
  const { db } = initFirebase();
  unsub?.();
  unsub = onSnapshot(collection(db, 'users'), (s) => {
    usersState.list = s.docs.map((d) => ({ id: d.id, ...d.data(), active: d.data().active !== false }))
      .sort((a, b) => (a.email || '').localeCompare(b.email || ''));
    onChange();
  }, (e) => console.warn('users', e));
}

/** Tạo tài khoản mới bằng một Firebase app phụ để admin không bị đăng xuất */
async function createAuthUser(email, password) {
  const sec = getApps().find((a) => a.name === 'sec') || initializeApp(firebaseConfig, 'sec');
  const auth = getAuth(sec);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await signOut(auth);
  return cred.user.uid;
}

export async function createUser({ email, password, name, role }) {
  const { db } = initFirebase();
  email = email.trim().toLowerCase();
  const uid = await createAuthUser(email, password);
  await setDoc(doc(db, 'users', uid), { email, name: name.trim(), role, active: true, createdAt: new Date().toISOString() });
}

export async function updateUser(uid, { name, role, active }) {
  const { db } = initFirebase();
  await updateDoc(doc(db, 'users', uid), { name: name.trim(), role, active: !!active });
}

export async function sendReset(email) {
  await sendPasswordResetEmail(initFirebase().auth, email);
}

export async function changeOwnPassword(oldPw, newPw) {
  const u = initFirebase().auth.currentUser;
  await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, oldPw));
  await updatePassword(u, newPw);
}
