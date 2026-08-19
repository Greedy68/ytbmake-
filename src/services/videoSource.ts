import type { VideoLesson, VideoSource } from '../types/app';

const HTTPS_URL = /^https:\/\//i;

export type VideoPlayerAdapter =
  | { kind: 'html5'; src: string }
  | { kind: 'iframe'; src: string; title: string }
  | { kind: 'unavailable'; reason: string };

export function isSafeHttpsUrl(value: string | null | undefined): value is string {
  if (!value || !HTTPS_URL.test(value)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function resolveVideoSource(media: Pick<VideoLesson, 'sourceType' | 'sourceUrl' | 'sourcePath'>): VideoSource {
  return { type: media.sourceType, url: media.sourceUrl, path: media.sourcePath };
}

function youtubeEmbed(url: string): string | null {
  const parsed = new URL(url);
  const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v');
  return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null;
}

function vimeoEmbed(url: string): string | null {
  const parsed = new URL(url);
  const id = parsed.pathname.split('/').filter(Boolean).at(-1);
  return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
}

export function getVideoPlayerAdapter(source: VideoSource, title: string): VideoPlayerAdapter {
  if (source.type === 'unset' || source.type === 'future_storage') {
    return { kind: 'unavailable', reason: 'Video chưa được cấu hình' };
  }
  if (!isSafeHttpsUrl(source.url)) {
    return { kind: 'unavailable', reason: 'Nguồn video không hợp lệ' };
  }
  if (source.type === 'external_url') return { kind: 'html5', src: source.url };
  const embed = source.type === 'youtube' ? youtubeEmbed(source.url) : vimeoEmbed(source.url);
  return embed
    ? { kind: 'iframe', src: embed, title }
    : { kind: 'unavailable', reason: 'Nguồn video không hợp lệ' };
}
