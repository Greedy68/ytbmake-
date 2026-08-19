import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  createMedia,
  ensureUserProfile,
  listAdminMedia,
  listPublishedMedia,
  listUsers,
  removeMedia,
  updateMedia,
  updateUserAccess,
  type MediaInput,
} from '../services/firestore';
import type { Comment, PaymentOrder, User, UserRole, UserStatus, VideoLesson } from '../types/app';

interface AppContextType {
  currentUser: User | null;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  users: User[];
  loadUsers: () => Promise<void>;
  setUserAccess: (uid: string, role: UserRole, status: UserStatus) => Promise<void>;
  lessons: VideoLesson[];
  mediaLoading: boolean;
  mediaError: string | null;
  reloadMedia: () => Promise<void>;
  addLesson: (lesson: MediaInput) => Promise<void>;
  editLesson: (id: string, lesson: Partial<MediaInput>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  comments: Comment[];
  addComment: (lessonId: string, content: string) => void;
  approveComment: (commentId: string) => void;
  rejectComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  purchasedLessonIds: string[];
  orders: PaymentOrder[];
  processPayPalPayment: (lesson: VideoLesson) => Promise<boolean>;
  hasAccessToLesson: (lesson: VideoLesson) => boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminDashboardOpen: boolean;
  setIsAdminDashboardOpen: (open: boolean) => void;
  activeLesson: VideoLesson | null;
  setActiveLesson: (lesson: VideoLesson | null) => void;
  activePayPalLesson: VideoLesson | null;
  setActivePayPalLesson: (lesson: VideoLesson | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function friendlyError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/weak-password': 'Mật khẩu chưa đủ mạnh.',
    'auth/too-many-requests': 'Có quá nhiều yêu cầu. Vui lòng thử lại sau.',
  };
  return messages[code] ?? 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [purchasedLessonIds, setPurchasedLessonIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<VideoLesson | null>(null);
  const [activePayPalLesson, setActivePayPalLesson] = useState<VideoLesson | null>(null);

  const reloadMedia = useCallback(async () => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      const media = currentUser?.role === 'admin'
        ? await listAdminMedia()
        : await listPublishedMedia(Boolean(currentUser));
      setLessons(media);
    } catch {
      setLessons([]);
      setMediaError('Không thể tải danh sách video. Vui lòng thử lại.');
    } finally {
      setMediaLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        if (!firebaseUser) {
          if (active) setCurrentUser(null);
          return;
        }
        const profile = await ensureUserProfile(firebaseUser);
        if (profile.status === 'disabled') {
          await signOut(auth);
          throw new Error('ACCOUNT_DISABLED');
        }
        if (active) setCurrentUser(profile);
      } catch (error) {
        if (active) {
          setCurrentUser(null);
          setAuthError(error instanceof Error && error.message === 'ACCOUNT_DISABLED'
            ? 'Tài khoản đã bị vô hiệu hóa.'
            : 'Không thể tải hồ sơ tài khoản.');
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authLoading) void reloadMedia();
  }, [authLoading, reloadMedia]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      throw new Error(friendlyError(error));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    let accountCreated = false;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      accountCreated = true;
      await updateProfile(credential.user, { displayName: name.trim() });
      const profile = await ensureUserProfile(credential.user, name);
      setCurrentUser(profile);
    } catch (error) {
      if (accountCreated) {
        await signOut(auth);
        throw new Error('Tài khoản Firebase đã được tạo nhưng hồ sơ chưa lưu được. Hãy đăng nhập lại để hệ thống thử khôi phục hồ sơ.');
      }
      throw new Error(friendlyError(error));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUsers([]);
    setIsAdminDashboardOpen(false);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser?.email) throw new Error('Bạn cần đăng nhập để đổi mật khẩu.');
    try {
      await reauthenticateWithCredential(firebaseUser, EmailAuthProvider.credential(firebaseUser.email, currentPassword));
      await updatePassword(firebaseUser, newPassword);
    } catch (error) {
      throw new Error(friendlyError(error));
    }
  };

  const requestPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const loadUsers = useCallback(async () => setUsers(await listUsers()), []);
  const setUserAccess = async (uid: string, role: UserRole, status: UserStatus) => {
    await updateUserAccess(uid, role, status);
    await loadUsers();
  };

  const addLesson = async (lesson: MediaInput) => {
    if (!currentUser) throw new Error('Bạn cần đăng nhập.');
    await createMedia(lesson, currentUser.id);
    await reloadMedia();
  };
  const editLesson = async (id: string, lesson: Partial<MediaInput>) => {
    await updateMedia(id, lesson);
    await reloadMedia();
  };
  const deleteLesson = async (id: string) => {
    await removeMedia(id);
    await reloadMedia();
  };

  const addComment = (lessonId: string, content: string) => {
    if (!currentUser) return;
    setComments((previous) => [{
      id: crypto.randomUUID(), lessonId, userId: currentUser.id, userName: currentUser.name,
      userAvatar: currentUser.avatar, content, createdAt: new Date().toISOString(), status: 'pending',
    }, ...previous]);
  };
  const approveComment = (id: string) => setComments((items) => items.map((item) => item.id === id ? { ...item, status: 'approved' } : item));
  const rejectComment = (id: string) => setComments((items) => items.map((item) => item.id === id ? { ...item, status: 'rejected' } : item));
  const deleteComment = (id: string) => setComments((items) => items.filter((item) => item.id !== id));

  const processPayPalPayment = async (lesson: VideoLesson) => {
    const order: PaymentOrder = {
      orderId: crypto.randomUUID(), userId: currentUser?.id ?? 'guest', lessonId: lesson.id,
      lessonTitle: lesson.title, amount: lesson.price, currency: 'USD', status: 'COMPLETED', paidAt: new Date().toISOString(),
    };
    setOrders((items) => [order, ...items]);
    setPurchasedLessonIds((items) => [...items, lesson.id]);
    return true;
  };
  const hasAccessToLesson = (lesson: VideoLesson) => lesson.visibility === 'public'
    || lesson.isFreePreview || currentUser?.role === 'admin' || purchasedLessonIds.includes(lesson.id);

  return <AppContext.Provider value={{
    currentUser, authLoading, authError, login, register, logout, changePassword, requestPasswordReset,
    users, loadUsers, setUserAccess, lessons, mediaLoading, mediaError, reloadMedia, addLesson, editLesson, deleteLesson,
    comments, addComment, approveComment, rejectComment, deleteComment, purchasedLessonIds, orders,
    processPayPalPayment, hasAccessToLesson, isAuthModalOpen, setIsAuthModalOpen, isAdminDashboardOpen,
    setIsAdminDashboardOpen, activeLesson, setActiveLesson, activePayPalLesson, setActivePayPalLesson,
  }}>{children}</AppContext.Provider>;
};

// oxlint-disable-next-line react/only-export-components -- colocated hook is the public context API
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
