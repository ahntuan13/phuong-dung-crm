// Adapter Cloud Firestore: nhiều người dùng cùng lúc, cập nhật realtime.
// Mỗi collection (customers, treatments…) là một collection trên Firestore.
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

export function createFirebaseAdapter(db, { onError } = {}) {
  return {
    label: 'Dữ liệu dùng chung trên đám mây — mọi tài khoản được cấp quyền đều thấy, tự cập nhật khi người khác sửa.',

    /** Nghe thay đổi realtime; resolve khi tất cả collection đã tải lần đầu */
    init(cols, onData) {
      return new Promise((resolve, reject) => {
        const pending = new Set(cols);
        cols.forEach((c) => onSnapshot(collection(db, c),
          (snap) => {
            onData(c, snap.docs.map((d) => ({ ...d.data(), id: d.id })));
            if (pending.delete(c) && !pending.size) resolve();
          },
          (err) => { if (pending.size) reject(err); else onError?.(err); }));
      });
    },

    async save(col, id, body) {
      const ref = id ? doc(db, col, id) : doc(collection(db, col)); // id mới do Firestore tạo
      await setDoc(ref, body);
      return ref.id;
    },

    async remove(col, id) {
      await deleteDoc(doc(db, col, id));
    },
  };
}
