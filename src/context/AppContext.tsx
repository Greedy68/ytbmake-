import React, { createContext, useContext, useState } from 'react';
import type { User, VideoLesson, Comment, PaymentOrder, UserRole } from '../types/app';
import { landingData } from '../data/landingData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  
  // Videos & Lessons
  lessons: VideoLesson[];
  addLesson: (lesson: Omit<VideoLesson, 'id'>) => void;
  deleteLesson: (id: string) => void;
  
  // Comments
  comments: Comment[];
  addComment: (lessonId: string, content: string) => void;
  approveComment: (commentId: string) => void;
  rejectComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  
  // Payments & Access
  purchasedLessonIds: string[];
  orders: PaymentOrder[];
  processPayPalPayment: (lesson: VideoLesson) => Promise<boolean>;
  hasAccessToLesson: (lesson: VideoLesson) => boolean;

  // Active Modals & Selected Lesson
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminDashboardOpen: boolean;
  setIsAdminDashboardOpen: (open: boolean) => void;
  activeLesson: VideoLesson | null;
  setActiveLesson: (lesson: VideoLesson | null) => void;
  activePayPalLesson: VideoLesson | null;
  setActivePayPalLesson: (lesson: VideoLesson | null) => void;
}

// Convert initial landingData modules into VideoLesson format
const initialLessons: VideoLesson[] = landingData.courseModules.modules.flatMap((mod) =>
  mod.lessons.map((les, index) => ({
    id: les.id,
    moduleId: mod.id,
    moduleTitle: mod.title,
    title: les.title,
    duration: les.duration,
    thumbnailUrl: les.thumbnailUrl,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    isFreePreview: index === 0, // First lesson in module is free preview
    price: 19.99,
  }))
);

const DEMO_USER: User = {
  id: 'usr_001',
  name: 'Alex Student',
  email: 'alex@example.com',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  purchasedLessonIds: [],
};

const DEMO_ADMIN: User = {
  id: 'adm_001',
  name: 'Midas Admin',
  email: 'admin@midas.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  purchasedLessonIds: initialLessons.map((l) => l.id), // Admin has access to all
};

const initialComments: Comment[] = [
  {
    id: 'cmt_1',
    lessonId: initialLessons[0]?.id || 'mod1_les1',
    userId: 'usr_999',
    userName: 'Minh Tuấn',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    content: 'Bài học rất hay và trực quan! Đã áp dụng được ngay vào workflow.',
    createdAt: '2026-08-10 14:30',
    status: 'approved',
  },
  {
    id: 'cmt_2',
    lessonId: initialLessons[0]?.id || 'mod1_les1',
    userId: 'usr_888',
    userName: 'Thanh Hương',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    content: 'Admin hỗ trợ giải đáp giúp em ở phút 05:20 với ạ!',
    createdAt: '2026-08-11 09:15',
    status: 'pending',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USER);
  const [lessons, setLessons] = useState<VideoLesson[]>(initialLessons);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [purchasedLessonIds, setPurchasedLessonIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [activeLesson, setActiveLesson] = useState<VideoLesson | null>(null);
  const [activePayPalLesson, setActivePayPalLesson] = useState<VideoLesson | null>(null);

  const loginAsRole = (role: UserRole) => {
    if (role === 'admin') {
      setCurrentUser(DEMO_ADMIN);
    } else if (role === 'user') {
      setCurrentUser(DEMO_USER);
    } else {
      setCurrentUser(null);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addLesson = (newLessonData: Omit<VideoLesson, 'id'>) => {
    const newLesson: VideoLesson = {
      ...newLessonData,
      id: `les_${Date.now()}`,
    };
    setLessons((prev) => [newLesson, ...prev]);
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const addComment = (lessonId: string, content: string) => {
    if (!currentUser) return;
    const newCmt: Comment = {
      id: `cmt_${Date.now()}`,
      lessonId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: currentUser.role === 'admin' ? 'approved' : 'pending', // Admin comments auto-approved
    };
    setComments((prev) => [newCmt, ...prev]);
  };

  const approveComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: 'approved' } : c))
    );
  };

  const rejectComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: 'rejected' } : c))
    );
  };

  const deleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const processPayPalPayment = async (lesson: VideoLesson): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order: PaymentOrder = {
          orderId: `PAYPAL_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          userId: currentUser?.id || 'guest_user',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          amount: lesson.price,
          currency: 'USD',
          status: 'COMPLETED',
          paidAt: new Date().toLocaleString(),
        };

        setOrders((prev) => [order, ...prev]);
        setPurchasedLessonIds((prev) => [...prev, lesson.id]);
        
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            purchasedLessonIds: [...currentUser.purchasedLessonIds, lesson.id],
          });
        }
        
        resolve(true);
      }, 1200);
    });
  };

  const hasAccessToLesson = (lesson: VideoLesson): boolean => {
    if (lesson.isFreePreview) return true;
    if (currentUser?.role === 'admin') return true;
    if (purchasedLessonIds.includes(lesson.id)) return true;
    if (currentUser?.purchasedLessonIds.includes(lesson.id)) return true;
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAsRole,
        logout,
        lessons,
        addLesson,
        deleteLesson,
        comments,
        addComment,
        approveComment,
        rejectComment,
        deleteComment,
        purchasedLessonIds,
        orders,
        processPayPalPayment,
        hasAccessToLesson,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAdminDashboardOpen,
        setIsAdminDashboardOpen,
        activeLesson,
        setActiveLesson,
        activePayPalLesson,
        setActivePayPalLesson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
