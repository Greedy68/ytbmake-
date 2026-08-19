import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { Timestamp, collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';

let env: RulesTestEnvironment; const now = Timestamp.now();
const user = (role = 'user', status = 'active') => ({ email: `${role}@example.com`, displayName: role, photoURL: null, role, status, createdAt: now, updatedAt: now });
const media = (visibility = 'enrolled', status = 'published', courseId = 'course-a') => ({ type: 'video', title: 'Valid video', description: '', thumbnailUrl: '', courseId, lessonId: 'lesson-1', provider: 'youtube', visibility, status, durationSeconds: 120, order: 1, createdBy: 'admin', createdAt: now, updatedAt: now, publishedAt: status === 'published' ? now : null, sourceConfigured: true });
const source = (provider = 'youtube') => provider === 'youtube'
  ? { provider, sourceId: 'abcdefghijk', sourceType: 'unlisted', updatedAt: now, updatedBy: 'admin' }
  : { provider, assetId: 'asset-1', playbackId: 'playback-1', playbackPolicy: 'signed', updatedAt: now, updatedBy: 'admin' };
const enrollment = (uid: string, courseId: string, status = 'active', expiresAt: Timestamp | null = null) => ({ uid, courseId, status, startsAt: now, expiresAt, createdAt: now, updatedAt: now });

beforeAll(async () => { env = await initializeTestEnvironment({ projectId: 'demo-ymm-academy', firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 } }); });
afterEach(async () => env.clearFirestore()); afterAll(async () => env.cleanup());

async function seed() { await env.withSecurityRulesDisabled(async (context) => { const db = context.firestore();
  await setDoc(doc(db, 'users/admin'), user('admin')); await setDoc(doc(db, 'users/operator'), { ...user('admin'), email: 'operator@example.com' }); await setDoc(doc(db, 'users/member'), user()); await setDoc(doc(db, 'users/inactive'), user('user', 'disabled'));
  await setDoc(doc(db, 'system/security'), { rootAdminUid: 'admin', updatedAt: now });
  await setDoc(doc(db, 'media/enrolled'), media()); await setDoc(doc(db, 'media/other'), media('enrolled', 'published', 'course-b')); await setDoc(doc(db, 'media/public'), media('public')); await setDoc(doc(db, 'media/authenticated'), media('authenticated')); await setDoc(doc(db, 'media/draft'), media('enrolled', 'draft')); await setDoc(doc(db, 'media/archived'), media('enrolled', 'archived'));
  for (const id of ['enrolled', 'other', 'public', 'authenticated', 'draft', 'archived']) await setDoc(doc(db, `mediaSources/${id}`), source());
  await setDoc(doc(db, 'enrollments/member_course-a'), enrollment('member', 'course-a'));
}); }

describe('users rules', () => {
  it('protects profiles and blocks escalation', async () => { await seed(); const guest = env.unauthenticatedContext().firestore(); const member = env.authenticatedContext('member', { email: 'user@example.com' }).firestore();
    await assertFails(getDoc(doc(guest, 'users/member'))); await assertSucceeds(getDoc(doc(member, 'users/member'))); await assertFails(updateDoc(doc(member, 'users/member'), { role: 'admin', updatedAt: serverTimestamp() }));
  });
  it('allows an admin to manage others but protects the root admin', async () => { await seed(); const root = env.authenticatedContext('admin').firestore(); const operator = env.authenticatedContext('operator').firestore();
    await assertSucceeds(updateDoc(doc(root, 'users/member'), { role: 'admin', updatedAt: serverTimestamp() })); await assertFails(updateDoc(doc(operator, 'users/admin'), { role: 'user', updatedAt: serverTimestamp() }));
  });
});

describe('metadata and protected sources', () => {
  it('allows public metadata but never anonymous source reads', async () => { await seed(); const guest = env.unauthenticatedContext().firestore(); const metadata = await assertSucceeds(getDoc(doc(guest, 'media/public')));
    if (metadata.exists() && Object.hasOwn(metadata.data(), 'sourceId')) throw new Error('public metadata leaked sourceId');
    await assertFails(getDoc(doc(guest, 'mediaSources/public')));
  });
  it('allows active authenticated visibility and denies inactive users', async () => { await seed(); await assertSucceeds(getDoc(doc(env.authenticatedContext('member').firestore(), 'mediaSources/authenticated'))); await assertFails(getDoc(doc(env.authenticatedContext('inactive').firestore(), 'mediaSources/authenticated'))); });
  it('allows only the active enrollment for the matching course', async () => { await seed(); const member = env.authenticatedContext('member').firestore();
    await assertSucceeds(getDoc(doc(member, 'mediaSources/enrolled'))); await assertFails(getDoc(doc(member, 'mediaSources/other')));
    await env.withSecurityRulesDisabled(async (context) => updateDoc(doc(context.firestore(), 'enrollments/member_course-a'), { status: 'revoked' })); await assertFails(getDoc(doc(member, 'mediaSources/enrolled')));
    await env.withSecurityRulesDisabled(async (context) => updateDoc(doc(context.firestore(), 'enrollments/member_course-a'), { status: 'active', expiresAt: Timestamp.fromMillis(Date.now() - 60_000) })); await assertFails(getDoc(doc(member, 'mediaSources/enrolled')));
  });
  it('denies user access to draft/archived sources and collection-wide source queries', async () => { await seed(); const member = env.authenticatedContext('member').firestore(); await assertFails(getDoc(doc(member, 'mediaSources/draft'))); await assertFails(getDoc(doc(member, 'mediaSources/archived'))); await assertFails(getDocs(query(collection(member, 'mediaSources'), limit(50)))); });
  it('allows admin source CRUD and denies ordinary writes', async () => { await seed(); const admin = env.authenticatedContext('admin').firestore(); const member = env.authenticatedContext('member').firestore();
    await assertSucceeds(getDoc(doc(admin, 'mediaSources/draft'))); await assertFails(setDoc(doc(member, 'mediaSources/enrolled'), source())); await assertFails(deleteDoc(doc(member, 'mediaSources/enrolled')));
    await assertSucceeds(updateDoc(doc(admin, 'mediaSources/enrolled'), { sourceId: '12345678901', updatedAt: serverTimestamp(), updatedBy: 'admin' }));
  });
  it('atomically creates matching metadata and source', async () => { await seed(); const admin = env.authenticatedContext('admin').firestore(); const batch = writeBatch(admin);
    batch.set(doc(admin, 'media/new'), { ...media(), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    batch.set(doc(admin, 'mediaSources/new'), { ...source(), updatedAt: serverTimestamp() });
    await assertSucceeds(batch.commit());
    await assertFails(setDoc(doc(admin, 'media/orphan'), { ...media(), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  });
  it('rejects malformed metadata, source provider and source type', async () => { await seed(); const admin = env.authenticatedContext('admin').firestore();
    await assertFails(setDoc(doc(admin, 'media/bad'), { ...media(), sourceId: 'abcdefghijk', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertFails(setDoc(doc(admin, 'mediaSources/enrolled'), { ...source(), sourceId: 'bad', updatedAt: serverTimestamp() }));
    await assertFails(setDoc(doc(admin, 'mediaSources/enrolled'), { ...source(), sourceType: 'public', updatedAt: serverTimestamp() }));
    await assertFails(setDoc(doc(admin, 'mediaSources/enrolled'), { ...source(), provider: 'unknown', updatedAt: serverTimestamp() }));
  });
});

describe('enrollment rules', () => {
  it('prevents users from creating or editing enrollment and allows admin management', async () => { await seed(); const member = env.authenticatedContext('member').firestore(); const admin = env.authenticatedContext('admin').firestore();
    await assertSucceeds(getDocs(query(collection(member, 'enrollments'), where('uid', '==', 'member'), where('status', '==', 'active'), limit(25))));
    await assertFails(setDoc(doc(member, 'enrollments/member_course-b'), enrollment('member', 'course-b')));
    await assertSucceeds(setDoc(doc(admin, 'enrollments/member_course-b'), { ...enrollment('member', 'course-b'), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(admin, 'enrollments/member_course-b'), { status: 'revoked', updatedAt: serverTimestamp() }));
  });
});
