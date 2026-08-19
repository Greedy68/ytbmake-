import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { Timestamp, collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';

let env: RulesTestEnvironment;
const now = Timestamp.now();
const user = (role = 'user') => ({ email: `${role}@example.com`, displayName: role, photoURL: null, role, status: 'active', createdAt: now, updatedAt: now });
const media = (visibility = 'public', status = 'published') => ({
  type: 'video', title: 'Valid video', description: '', sourceType: 'unset', sourceUrl: null, sourcePath: null,
  thumbnailUrl: '', visibility, status, createdBy: 'admin', createdAt: now, updatedAt: now,
  publishedAt: status === 'published' ? now : null, moduleId: 'mod', moduleTitle: 'Module', duration: '', isFreePreview: false, price: 0,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-ymm-academy', firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 } });
});
afterEach(async () => env.clearFirestore());
afterAll(async () => env.cleanup());

async function seed() {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/admin'), user('admin'));
    await setDoc(doc(context.firestore(), 'users/operator'), { ...user('admin'), email: 'operator@example.com' });
    await setDoc(doc(context.firestore(), 'users/member'), user());
    await setDoc(doc(context.firestore(), 'system/security'), { rootAdminUid: 'admin', updatedAt: now });
    await setDoc(doc(context.firestore(), 'media/public'), media());
    await setDoc(doc(context.firestore(), 'media/auth'), media('authenticated'));
    await setDoc(doc(context.firestore(), 'media/private'), media('private', 'draft'));
  });
}

describe('users rules', () => {
  it('denies unauthenticated profile reads and allows self read', async () => {
    await seed();
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'users/member')));
    await assertSucceeds(getDoc(doc(env.authenticatedContext('member', { email: 'user@example.com' }).firestore(), 'users/member')));
  });
  it('forces new profiles to user and blocks role escalation', async () => {
    const db = env.authenticatedContext('new', { email: 'new@example.com' }).firestore();
    await assertSucceeds(setDoc(doc(db, 'users/new'), { ...user(), email: 'new@example.com', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, 'users/new'), { role: 'admin', updatedAt: serverTimestamp() }));
  });
  it('allows admins to manage another user but not themselves', async () => {
    await seed(); const db = env.authenticatedContext('admin').firestore();
    await assertSucceeds(updateDoc(doc(db, 'users/member'), { role: 'admin', updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(db, 'users/admin'), { role: 'user', updatedAt: serverTimestamp() }));
    await assertSucceeds(getDocs(query(collection(db, 'users'), limit(50))));
  });
  it('prevents every other admin from changing root-admin access', async () => {
    await seed();
    const operator = env.authenticatedContext('operator').firestore();
    const root = env.authenticatedContext('admin').firestore();
    await assertFails(updateDoc(doc(operator, 'users/admin'), { role: 'user', updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(operator, 'users/admin'), { status: 'disabled', updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(root, 'users/operator'), { role: 'user', updatedAt: serverTimestamp() }));
  });
});

describe('media rules', () => {
  it('enforces media visibility', async () => {
    await seed(); const guest = env.unauthenticatedContext().firestore(); const member = env.authenticatedContext('member').firestore();
    await assertSucceeds(getDoc(doc(guest, 'media/public')));
    await assertFails(getDoc(doc(guest, 'media/auth')));
    await assertSucceeds(getDoc(doc(member, 'media/auth')));
    await assertFails(getDoc(doc(member, 'media/private')));
  });
  it('allows only admin CRUD and rejects malformed media', async () => {
    await seed(); const admin = env.authenticatedContext('admin').firestore(); const member = env.authenticatedContext('member').firestore();
    await assertFails(setDoc(doc(member, 'media/new'), media()));
    await assertSucceeds(setDoc(doc(admin, 'media/new'), { ...media('private', 'draft'), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertFails(setDoc(doc(admin, 'media/bad'), { ...media(), title: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(admin, 'media/public'), { title: 'Updated video', updatedAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(doc(admin, 'media/public')));
  });
});
