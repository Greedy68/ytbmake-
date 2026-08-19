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

export type VideoProvider = 'youtube' | 'cloudflare_stream' | 'mux' | 'unset';
export type MediaVisibility = 'public' | 'authenticated' | 'enrolled';
export type MediaStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'active' | 'expired' | 'revoked';

export interface VideoLesson {
  id: string;
  type: 'video';
  title: string;
  description: string;
  thumbnailUrl: string;
  courseId: string;
  lessonId: string;
  provider: VideoProvider;
  visibility: MediaVisibility;
  status: MediaStatus;
  durationSeconds: number;
  order: number;
  sourceConfigured: boolean;
  createdBy?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  publishedAt?: Timestamp | null;
  // Presentation-only compatibility fields; never persisted as source metadata.
  moduleId: string;
  moduleTitle: string;
  duration: string;
  isFreePreview: boolean;
  price: number;
}

export interface YouTubeSourceDescriptor {
  provider: 'youtube';
  sourceId: string;
  sourceType: 'unlisted';
}

export interface FutureSourceDescriptor {
  provider: 'cloudflare_stream' | 'mux';
  assetId: string;
  playbackId?: string;
  playbackPolicy: 'signed';
}

export type VideoSourceDescriptor = YouTubeSourceDescriptor | FutureSourceDescriptor;

export type VideoPlaybackSession =
  | { provider: 'youtube'; videoId: string }
  | { provider: 'cloudflare_stream' | 'mux'; playbackUrl: string; expiresAt: number }
  | { provider: 'unset'; reason: string };

export interface MediaSourceInput {
  provider: VideoProvider;
  youtubeInput?: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';
export interface Comment { id: string; lessonId: string; userId: string; userName: string; userAvatar: string; content: string; createdAt: string; status: CommentStatus; }
export interface PaymentOrder { orderId: string; userId: string; lessonId: string; lessonTitle: string; amount: number; currency: string; status: 'COMPLETED'; paidAt: string; }
