import { describe, expect, it } from 'vitest';
import { buildYouTubeEmbedUrl, getVideoPlayerAdapter, isSafeHttpsUrl, parseYouTubeVideoId, videoSourceResolver } from '../src/services/videoSource';

describe('YouTube source parsing', () => {
  it.each([
    ['abcdefghijk', 'abcdefghijk'],
    ['https://www.youtube.com/watch?v=abcdefghijk', 'abcdefghijk'],
    ['https://youtu.be/abcdefghijk?t=4', 'abcdefghijk'],
    ['https://youtube.com/embed/abcdefghijk', 'abcdefghijk'],
  ])('normalizes %s', (input, expected) => expect(parseYouTubeVideoId(input)).toBe(expected));

  it.each(['javascript:alert(1)', 'data:text/html,bad', '<iframe src="https://youtu.be/abcdefghijk">', 'https://youtube.example/watch?v=abcdefghijk', 'http://youtu.be/abcdefghijk', 'too-short'])('rejects unsafe input %s', (input) => expect(parseYouTubeVideoId(input)).toBeNull());
  it('only builds an embed URL from a validated ID', () => {
    expect(buildYouTubeEmbedUrl('abcdefghijk')).toBe('https://www.youtube.com/embed/abcdefghijk?fs=0&rel=0');
    expect(buildYouTubeEmbedUrl('javascript:')).toBeNull();
  });
});

describe('provider-neutral resolver and adapter', () => {
  it('resolves YouTube without exposing raw iframe HTML', () => {
    const session = videoSourceResolver.resolve({ provider: 'youtube', sourceId: 'abcdefghijk', sourceType: 'unlisted' });
    const adapter = getVideoPlayerAdapter(session, 'Lesson');
    expect(adapter).toMatchObject({ kind: 'iframe', provider: 'youtube', src: 'https://www.youtube.com/embed/abcdefghijk?fs=0&rel=0' });
    expect(JSON.stringify(adapter)).not.toContain('<iframe');
  });
  it('keeps future signed providers compatible with the same player adapter', () => {
    expect(getVideoPlayerAdapter({ provider: 'mux', playbackUrl: 'https://stream.example/signed.m3u8', expiresAt: Date.now() + 1000 }, 'Mux')).toMatchObject({ kind: 'signed', provider: 'mux' });
    expect(isSafeHttpsUrl('data:text/html,bad')).toBe(false);
  });
  it('returns a safe unavailable state for unset or malformed sources', () => {
    expect(getVideoPlayerAdapter({ provider: 'unset', reason: 'Video chưa được cấu hình' }, 'Video')).toEqual({ kind: 'unavailable', reason: 'Video chưa được cấu hình' });
    expect(videoSourceResolver.resolve({ provider: 'youtube', sourceId: 'bad', sourceType: 'unlisted' })).toMatchObject({ provider: 'unset' });
  });
});
