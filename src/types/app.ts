import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  purchasedLessonIds: string[];
}

export type VideoSourceType = 'external_url' | 'youtube' | 'vimeo' | 'future_storage' | 'unset';
export type MediaVisibility = 'public' | 'authenticated' | 'private';
export type MediaStatus = 'draft' | 'published' | 'archived';

export interface VideoSource {
  type: VideoSourceType;
  url: string | null;
  path: string | null;
}

export interface VideoLesson {
  id: string;
  type: 'video';
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  sourceType: VideoSourceType;
  sourceUrl: string | null;
  sourcePath: string | null;
  visibility: MediaVisibility;
  status: MediaStatus;
  isFreePreview: boolean;
  price: number;
  createdBy?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  publishedAt?: Timestamp | null;
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
