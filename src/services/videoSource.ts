import type { VideoPlaybackSession, VideoProvider, VideoSourceDescriptor } from '../types/app';

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export interface VideoSourceResolver {
  resolve(descriptor: VideoSourceDescriptor): VideoPlaybackSession;
}

export type VideoPlayerAdapter =
  | { kind: 'iframe'; provider: 'youtube'; src: string; title: string }
  | { kind: 'signed'; provider: 'cloudflare_stream' | 'mux'; src: string }
  | { kind: 'unavailable'; reason: string };

export function isSafeHttpsUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export function parseYouTubeVideoId(input: string): string | null {
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;
  if (/[<>]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    let candidate: string | null = null;
    if (host === 'youtu.be') candidate = url.pathname.split('/').filter(Boolean)[0] ?? null;
    if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') candidate = url.searchParams.get('v');
      else if (url.pathname.startsWith('/embed/')) candidate = url.pathname.split('/')[2] ?? null;
    }
    return candidate && YOUTUBE_ID.test(candidate) ? candidate : null;
  } catch { return null; }
}

export function buildYouTubeEmbedUrl(videoId: string): string | null {
  return YOUTUBE_ID.test(videoId)
    ? `https://www.youtube.com/embed/${videoId}?fs=0&rel=0`
    : null;
}

export const videoSourceResolver: VideoSourceResolver = {
  resolve(descriptor) {
    if (descriptor.provider === 'youtube') {
      return YOUTUBE_ID.test(descriptor.sourceId)
        ? { provider: 'youtube', videoId: descriptor.sourceId }
        : { provider: 'unset', reason: 'Nguồn video không hợp lệ' };
    }
    return { provider: 'unset', reason: 'Provider signed playback chưa được kích hoạt' };
  },
};

export function getVideoPlayerAdapter(session: VideoPlaybackSession, title: string): VideoPlayerAdapter {
  if (session.provider === 'youtube') {
    const src = buildYouTubeEmbedUrl(session.videoId);
    return src ? { kind: 'iframe', provider: 'youtube', src, title } : { kind: 'unavailable', reason: 'Nguồn video không hợp lệ' };
  }
  if (session.provider === 'cloudflare_stream' || session.provider === 'mux') {
    return isSafeHttpsUrl(session.playbackUrl)
      ? { kind: 'signed', provider: session.provider, src: session.playbackUrl }
      : { kind: 'unavailable', reason: 'Phiên phát video không hợp lệ' };
  }
  return { kind: 'unavailable', reason: session.provider === 'unset' ? session.reason : 'Không thể phát video' };
}

export function supportsProvider(provider: VideoProvider): boolean {
  return provider === 'youtube' || provider === 'unset';
}
