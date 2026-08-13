export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  purchasedLessonIds: string[];
}

export interface VideoLesson {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  isFreePreview: boolean;
  price: number; // In USD e.g. 19.99
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  status: CommentStatus;
}

export interface PaymentOrder {
  orderId: string;
  userId: string;
  lessonId: string;
  lessonTitle: string;
  amount: number;
  currency: string;
  status: 'COMPLETED';
  paidAt: string;
}
