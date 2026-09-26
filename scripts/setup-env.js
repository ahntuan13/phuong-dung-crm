// Tạo file .env.local từ đoạn firebaseConfig copy trong Firebase Console.
// Cách dùng:  npm run setup   → dán đoạn firebaseConfig → Enter 2 lần (hoặc dán tới dấu "}" là tự dừng)
import { createInterface } from 'node:readline';
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, '.env.local');

const KEYS = [
  ['apiKey', 'VITE_FIREBASE_API_KEY'],
  ['authDomain', 'VITE_FIREBASE_AUTH_DOMAIN'],
  ['projectId', 'VITE_FIREBASE_PROJECT_ID'],
  ['storageBucket', 'VITE_FIREBASE_STORAGE_BUCKET'],
  ['messagingSenderId', 'VITE_FIREBASE_MESSAGING_SENDER_ID'],
  ['appId', 'VITE_FIREBASE_APP_ID'],
];

console.log('\n🌸 Tạo file .env.local cho Phương Dung CRM');
console.log('Dán đoạn firebaseConfig từ Firebase Console (Project settings → Your apps), rồi nhấn Enter 2 lần:\n');

const rl = createInterface({ input: process.stdin });
const lines = [];
let blank = 0;

rl.on('line', (line) => {
  lines.push(line);
  blank = line.trim() === '' ? blank + 1 : 0;
  const text = lines.join('\n');
  // dừng khi gặp 2 dòng trống, hoặc đã đủ khối { ... }
  if (blank >= 2 || (/appId/.test(text) && /}\s*;?\s*$/.test(line.trim()))) rl.close();
});

rl.on('close', () => {
  const text = lines.join('\n');
  const values = {};
  const missing = [];
  for (const [key, env] of KEYS) {
    const m = text.match(new RegExp(`${key}\\s*[:=]\\s*["'\`]([^"'\`]+)["'\`]`));
    if (m) values[env] = m[1].trim(); else missing.push(key);
  }

  if (missing.length) {
    console.error(`\n❌ Không tìm thấy: ${missing.join(', ')}. Hãy copy đầy đủ cả khối firebaseConfig { ... } rồi chạy lại.`);
    process.exit(1);
  }
  if (!values.VITE_FIREBASE_API_KEY.startsWith('AIza')) console.warn('⚠️  apiKey thường bắt đầu bằng "AIza" — kiểm tra lại nếu đăng nhập lỗi.');

  const content = [
    '# Cấu hình Firebase cho Phương Dung CRM — tạo bởi npm run setup',
    '# Không đưa file này lên GitHub (đã có trong .gitignore).',
    ...KEYS.map(([, env]) => `${env}=${values[env]}`),
    '',
  ].join('\n');

  if (existsSync(target)) console.log('ℹ️  Đã có .env.local cũ — ghi đè bằng cấu hình mới.');
  writeFileSync(target, content, 'utf8');
  console.log(`\n✅ Đã tạo ${target}\n`);
  KEYS.forEach(([, env]) => console.log(`   ${env}=${env.endsWith('API_KEY') ? values[env].slice(0, 8) + '…' : values[env]}`));
  console.log('\n👉 Chạy lại:  npm run dev\n');
});
