import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from '../config/firebase';
import type { MediaStatus, MediaVisibility, User, UserRole, UserStatus, VideoLesson } from '../types/app';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp';

function toUser(uid: string, data: Record<string, unknown>): User {
  return {
    id: uid,
    email: String(data.email ?? ''),
    name: String(data.displayName ?? 'Học viên'),
    role: data.role === 'admin' ? 'admin' : 'user',
    status: data.status === 'disabled' ? 'disabled' : 'active',
    avatar: DEFAULT_AVATAR,
    purchasedLessonIds: [],
  };
}

export async function ensureUserProfile(firebaseUser: FirebaseUser, displayName?: string): Promise<User> {
  const ref = doc(db, 'users', firebaseUser.uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) {
      transaction.set(ref, {
        email: firebaseUser.email ?? '',
        displayName: displayName?.trim() || firebaseUser.displayName || 'Học viên',
        role: 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error('Không thể tạo hồ sơ người dùng.');
  return toUser(snapshot.id, snapshot.data());
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? toUser(snapshot.id, snapshot.data()) : null;
}

export async function listUsers(): Promise<User[]> {
  const snapshot = await getDocs(query(collection(db, 'users'), limit(50)));
  return snapshot.docs.map((item) => toUser(item.id, item.data()));
}

export async function updateUserAccess(uid: string, role: UserRole, status: UserStatus): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role, status, updatedAt: serverTimestamp() });
}

function toLesson(id: string, data: Record<string, unknown>): VideoLesson {
  return {
    id,
    type: 'video',
    moduleId: String(data.moduleId ?? 'mod_custom'),
    moduleTitle: String(data.moduleTitle ?? 'Video'),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    duration: String(data.duration ?? ''),
    thumbnailUrl: String(data.thumbnailUrl ?? ''),
    sourceType: (data.sourceType ?? 'unset') as VideoLesson['sourceType'],
    sourceUrl: typeof data.sourceUrl === 'string' ? data.sourceUrl : null,
    sourcePath: typeof data.sourcePath === 'string' ? data.sourcePath : null,
    visibility: (data.visibility ?? 'private') as MediaVisibility,
    status: (data.status ?? 'draft') as MediaStatus,
    isFreePreview: Boolean(data.isFreePreview),
    price: Number(data.price ?? 0),
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
    createdAt: data.createdAt as VideoLesson['createdAt'],
    updatedAt: data.updatedAt as VideoLesson['updatedAt'],
    publishedAt: data.publishedAt as VideoLesson['publishedAt'],
  };
}

export async function listPublishedMedia(authenticated: boolean): Promise<VideoLesson[]> {
  const visibilities: MediaVisibility[] = authenticated ? ['public', 'authenticated'] : ['public'];
  const snapshots = await Promise.all(visibilities.map((visibility) => getDocs(query(
    collection(db, 'media'), where('status', '==', 'published'), where('visibility', '==', visibility), limit(25),
  ))));
  return snapshots.flatMap((snapshot) => snapshot.docs.map((item) => toLesson(item.id, item.data())));
}

export async function listAdminMedia(): Promise<VideoLesson[]> {
  const snapshot = await getDocs(query(collection(db, 'media'), limit(50)));
  return snapshot.docs.map((item) => toLesson(item.id, item.data()));
}

export type MediaInput = Omit<VideoLesson, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'publishedAt'>;

export async function createMedia(input: MediaInput, uid: string): Promise<string> {
  const ref = await addDoc(collection(db, 'media'), {
    ...input,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: input.status === 'published' ? serverTimestamp() : null,
  });
  return ref.id;
}

export async function updateMedia(id: string, input: Partial<MediaInput>): Promise<void> {
  await updateDoc(doc(db, 'media', id), { ...input, updatedAt: serverTimestamp() });
}

export async function removeMedia(id: string): Promise<void> {
  await deleteDoc(doc(db, 'media', id));
}

export async function updateOwnProfile(uid: string, displayName: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), { displayName: displayName.trim(), updatedAt: serverTimestamp() }, { merge: true });
}
