#!/usr/bin/env node
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'ymm-academy';
const uidIndex = args.indexOf('--uid');
const emailIndex = args.indexOf('--email');
const uidArg = uidIndex >= 0 ? args[uidIndex + 1] : null;
const emailArg = emailIndex >= 0 ? args[emailIndex + 1] : null;

if ((!uidArg && !emailArg) || (uidArg && emailArg)) {
  console.error('Usage: npm run bootstrap:admin -- (--uid UID | --email EMAIL) [--dry-run]');
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });
const auth = getAuth();
const db = getFirestore();

const account = uidArg ? await auth.getUser(uidArg) : await auth.getUserByEmail(emailArg);
const ref = db.doc(`users/${account.uid}`);
const snapshot = await ref.get();
if (!snapshot.exists) {
  console.error('Tài khoản Firebase tồn tại nhưng chưa có users/{uid}. Hãy đăng nhập ứng dụng một lần trước.');
  process.exit(1);
}

console.log(`Project: ${projectId}`);
console.log(`Target UID: ${account.uid}`);
console.log(`Target email: ${account.email ?? '(none)'}`);
console.log(`Current role: ${snapshot.data()?.role ?? '(missing)'}`);
if (dryRun) {
  console.log('Dry-run: không có dữ liệu nào được thay đổi.');
  process.exit(0);
}

const rl = createInterface({ input, output });
const answer = await rl.question('Nhập PROMOTE để xác nhận cấp quyền admin: ');
rl.close();
if (answer !== 'PROMOTE') {
  console.log('Đã hủy, không có dữ liệu nào được thay đổi.');
  process.exit(0);
}
await ref.update({ role: 'admin', status: 'active', updatedAt: FieldValue.serverTimestamp() });
console.log('Đã cấp quyền admin.');
