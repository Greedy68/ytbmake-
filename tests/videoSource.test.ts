import { describe, expect, it } from 'vitest';
import { getVideoPlayerAdapter, isSafeHttpsUrl } from '../src/services/videoSource';

describe('video source resolver', () => {
  it('accepts only safe HTTPS URLs', () => {
    expect(isSafeHttpsUrl('https://cdn.example.com/video.mp4')).toBe(true);
    expect(isSafeHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpsUrl('data:text/html,bad')).toBe(false);
    expect(isSafeHttpsUrl('http://example.com/video.mp4')).toBe(false);
  });

  it('returns a placeholder for an unset source', () => {
    expect(getVideoPlayerAdapter({ type: 'unset', url: null, path: null }, 'Video')).toEqual({
      kind: 'unavailable', reason: 'Video chưa được cấu hình',
    });
  });

  it('creates safe adapters for external, YouTube and Vimeo sources', () => {
    expect(getVideoPlayerAdapter({ type: 'external_url', url: 'https://cdn.example.com/a.mp4', path: null }, 'A').kind).toBe('html5');
    expect(getVideoPlayerAdapter({ type: 'youtube', url: 'https://youtu.be/abcdefghijk', path: null }, 'A')).toMatchObject({ kind: 'iframe', src: 'https://www.youtube.com/embed/abcdefghijk' });
    expect(getVideoPlayerAdapter({ type: 'vimeo', url: 'https://vimeo.com/123456', path: null }, 'A')).toMatchObject({ kind: 'iframe', src: 'https://player.vimeo.com/video/123456' });
  });
});
