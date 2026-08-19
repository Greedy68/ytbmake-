import {
  collection, deleteDoc, doc, getDoc, getDocs, limit, query, runTransaction,
  serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { parseYouTubeVideoId, videoSourceResolver } from './videoSource';
import type {
  MediaSourceInput, MediaStatus, MediaVisibility, User, UserRole, UserStatus,
  VideoLesson, VideoPlaybackSession, VideoProvider, VideoSourceDescriptor, EnrollmentStatus,
} from '../types/app';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp';

function toUser(uid: string, data: Record<string, unknown>): User {
  return { id: uid, email: String(data.email ?? ''), name: String(data.displayName ?? 'Học viên'),
    role: data.role === 'admin' ? 'admin' : 'user', status: data.status === 'disabled' ? 'disabled' : 'active',
    avatar: typeof data.photoURL === 'string' && data.photoURL ? data.photoURL : DEFAULT_AVATAR, purchasedLessonIds: [] };
}

export async function ensureUserProfile(firebaseUser: FirebaseUser, displayName?: string): Promise<User> {
  const ref = doc(db, 'users', firebaseUser.uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) transaction.set(ref, { email: firebaseUser.email ?? '', displayName: displayName?.trim() || firebaseUser.displayName || 'Học viên', photoURL: firebaseUser.photoURL ?? null, role: 'user', status: 'active', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error('Không thể tạo hồ sơ người dùng.');
  return toUser(snapshot.id, snapshot.data());
}

export async function getUserProfile(uid: string): Promise<User | null> { const snapshot = await getDoc(doc(db, 'users', uid)); return snapshot.exists() ? toUser(snapshot.id, snapshot.data()) : null; }
export async function listUsers(): Promise<User[]> { const snapshot = await getDocs(query(collection(db, 'users'), limit(50))); return snapshot.docs.map((item) => toUser(item.id, item.data())); }
export async function updateUserAccess(uid: string, role: UserRole, status: UserStatus): Promise<void> { await updateDoc(doc(db, 'users', uid), { role, status, updatedAt: serverTimestamp() }); }

function durationLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60); const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function toLesson(id: string, data: Record<string, unknown>): VideoLesson {
  const durationSeconds = Number(data.durationSeconds ?? 0);
  const courseId = String(data.courseId ?? 'course-main');
  return { id, type: 'video', title: String(data.title ?? ''), description: String(data.description ?? ''), thumbnailUrl: String(data.thumbnailUrl ?? ''),
    courseId, lessonId: String(data.lessonId ?? id), provider: (data.provider ?? 'unset') as VideoProvider,
    visibility: (data.visibility ?? 'enrolled') as MediaVisibility, status: (data.status ?? 'draft') as MediaStatus,
    durationSeconds, order: Number(data.order ?? 0), sourceConfigured: Boolean(data.sourceConfigured),
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
    createdAt: data.createdAt as VideoLesson['createdAt'], updatedAt: data.updatedAt as VideoLesson['updatedAt'], publishedAt: data.publishedAt as VideoLesson['publishedAt'],
    moduleId: courseId, moduleTitle: courseId, duration: durationLabel(durationSeconds), isFreePreview: data.visibility === 'public', price: 0 };
}

export async function listPublishedMedia(authenticated: boolean): Promise<VideoLesson[]> {
  const visibilities: MediaVisibility[] = authenticated ? ['public', 'authenticated'] : ['public'];
  const requests = visibilities.map((visibility) => getDocs(query(collection(db, 'media'), where('status', '==', 'published'), where('visibility', '==', visibility), limit(25))));
  if (authenticated) {
    const enrollments = await getDocs(query(collection(db, 'enrollments'), where('uid', '==', auth.currentUser?.uid ?? ''), where('status', '==', 'active'), limit(25)));
    for (const enrollment of enrollments.docs) {
      const data = enrollment.data();
      if (data.expiresAt?.toMillis?.() < Date.now()) continue;
      requests.push(getDocs(query(collection(db, 'media'), where('status', '==', 'published'), where('visibility', '==', 'enrolled'), where('courseId', '==', String(data.courseId)), limit(25))));
    }
  }
  const snapshots = await Promise.all(requests);
  return snapshots.flatMap((snapshot) => snapshot.docs.map((item) => toLesson(item.id, item.data()))).sort((a, b) => a.order - b.order);
}

export async function listAdminMedia(): Promise<VideoLesson[]> { const snapshot = await getDocs(query(collection(db, 'media'), limit(50))); return snapshot.docs.map((item) => toLesson(item.id, item.data())).sort((a, b) => a.order - b.order); }

export interface MediaInput {
  type: 'video'; title: string; description: string; thumbnailUrl: string; courseId: string; lessonId: string;
  provider: VideoProvider; visibility: MediaVisibility; status: MediaStatus; durationSeconds: number; order: number;
}

function sourceData(input: MediaSourceInput, uid: string) {
  if (input.provider === 'unset') return null;
  if (input.provider !== 'youtube') throw new Error('Provider signed playback chưa được kích hoạt.');
  const sourceId = parseYouTubeVideoId(input.youtubeInput ?? '');
  if (!sourceId) throw new Error('Link hoặc Video ID YouTube không hợp lệ.');
  return { provider: 'youtube', sourceId, sourceType: 'unlisted', updatedAt: serverTimestamp(), updatedBy: uid };
}

export async function createMedia(input: MediaInput, sourceInput: MediaSourceInput, uid: string): Promise<string> {
  const mediaRef = doc(collection(db, 'media')); const source = sourceData(sourceInput, uid); const batch = writeBatch(db);
  batch.set(mediaRef, { ...input, sourceConfigured: Boolean(source), createdBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: input.status === 'published' ? serverTimestamp() : null });
  if (source) batch.set(doc(db, 'mediaSources', mediaRef.id), source);
  await batch.commit(); return mediaRef.id;
}

export async function updateMedia(id: string, input: MediaInput, sourceInput: MediaSourceInput, uid: string): Promise<void> {
  const source = sourceData(sourceInput, uid); const batch = writeBatch(db);
  batch.update(doc(db, 'media', id), { ...input, sourceConfigured: Boolean(source), updatedAt: serverTimestamp(), publishedAt: input.status === 'published' ? serverTimestamp() : null });
  const ref = doc(db, 'mediaSources', id);
  if (source) batch.set(ref, source); else batch.delete(ref);
  await batch.commit();
}

export async function removeMedia(id: string): Promise<void> { const batch = writeBatch(db); batch.delete(doc(db, 'media', id)); batch.delete(doc(db, 'mediaSources', id)); await batch.commit(); }

export async function getAdminMediaSourceInput(mediaId: string): Promise<string> {
  const snapshot = await getDoc(doc(db, 'mediaSources', mediaId));
  if (!snapshot.exists()) return '';
  return snapshot.data().provider === 'youtube' && typeof snapshot.data().sourceId === 'string' ? snapshot.data().sourceId : '';
}

export async function fetchPlaybackSession(mediaId: string): Promise<VideoPlaybackSession> {
  const snapshot = await getDoc(doc(db, 'mediaSources', mediaId));
  if (!snapshot.exists()) return { provider: 'unset', reason: 'Video chưa được cấu hình' };
  const data = snapshot.data();
  let descriptor: VideoSourceDescriptor;
  if (data.provider === 'youtube') descriptor = { provider: 'youtube', sourceId: String(data.sourceId ?? ''), sourceType: 'unlisted' };
  else if (data.provider === 'cloudflare_stream' || data.provider === 'mux') descriptor = { provider: data.provider, assetId: String(data.assetId ?? ''), playbackId: typeof data.playbackId === 'string' ? data.playbackId : undefined, playbackPolicy: 'signed' };
  else return { provider: 'unset', reason: 'Video chưa được cấu hình' };
  return videoSourceResolver.resolve(descriptor);
}

export function enrollmentDocumentId(uid: string, courseId: string): string { return `${uid}_${courseId}`; }
export async function setEnrollment(uid: string, courseId: string, status: EnrollmentStatus): Promise<void> {
  const ref = doc(db, 'enrollments', enrollmentDocumentId(uid, courseId));
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) transaction.update(ref, { status, updatedAt: serverTimestamp() });
    else transaction.set(ref, { uid, courseId, status, startsAt: serverTimestamp(), expiresAt: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
}
export async function removeEnrollment(uid: string, courseId: string): Promise<void> { await deleteDoc(doc(db, 'enrollments', enrollmentDocumentId(uid, courseId))); }
export async function updateOwnProfile(uid: string, displayName: string): Promise<void> { await setDoc(doc(db, 'users', uid), { displayName: displayName.trim(), updatedAt: serverTimestamp() }, { merge: true }); }
