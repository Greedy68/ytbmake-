import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VideoLesson } from '../src/types/app';

const mocks = vi.hoisted(() => ({ fetchSession: vi.fn(), setActiveLesson: vi.fn(), fullscreen: vi.fn() }));
const lesson: VideoLesson = { id: 'media-1', type: 'video', title: 'Protected lesson', description: '', thumbnailUrl: '', courseId: 'course-a', lessonId: 'lesson-a', provider: 'youtube', visibility: 'enrolled', status: 'published', durationSeconds: 120, order: 1, sourceConfigured: true, moduleId: 'course-a', moduleTitle: 'course-a', duration: '2:00', isFreePreview: false, price: 0 };
const state = { activeLesson: lesson as VideoLesson | null, setActiveLesson: mocks.setActiveLesson, hasAccessToLesson: vi.fn(() => true), setActivePayPalLesson: vi.fn(), comments: [], addComment: vi.fn(), currentUser: { id: 'private-full-uid', email: 'name@example.com', name: 'Name', role: 'user', status: 'active', avatar: '', purchasedLessonIds: [] }, setIsAuthModalOpen: vi.fn() };
vi.mock('../src/context/AppContext', () => ({ useApp: () => state }));
vi.mock('../src/services/firestore', () => ({ fetchPlaybackSession: mocks.fetchSession }));

import { VideoPlayerModal } from '../src/components/video/VideoPlayerModal';

beforeEach(() => { vi.clearAllMocks(); state.activeLesson = lesson; mocks.fetchSession.mockResolvedValue({ provider: 'youtube', videoId: 'abcdefghijk' }); Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { configurable: true, value: mocks.fullscreen }); });
afterEach(cleanup);

describe('secure video player', () => {
  it('fetches one source only after the lesson opens and renders a masked moving watermark', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true }); const clearSpy = vi.spyOn(window, 'clearInterval'); const view = render(<VideoPlayerModal />);
    await waitFor(() => expect(mocks.fetchSession).toHaveBeenCalledTimes(1)); expect(mocks.fetchSession).toHaveBeenCalledWith('media-1');
    expect(screen.getByTitle('Protected lesson')).toHaveAttribute('src', 'https://www.youtube.com/embed/abcdefghijk?fs=0&rel=0');
    const watermark = screen.getByTestId('video-watermark'); expect(watermark).toHaveTextContent('na***@example.com'); expect(watermark).not.toHaveTextContent('name@example.com'); expect(watermark).not.toHaveTextContent('private-full-uid');
    view.unmount(); expect(clearSpy).toHaveBeenCalled(); vi.useRealTimers();
  });
  it('keeps watermark in the app fullscreen wrapper', async () => { render(<VideoPlayerModal />); await screen.findByTitle('Protected lesson'); fireEvent.click(screen.getByRole('button', { name: 'Toàn màn hình có watermark' })); await waitFor(() => expect(mocks.fullscreen).toHaveBeenCalled()); expect(screen.getByTestId('video-watermark')).toBeInTheDocument(); });
  it('shows permission errors without leaking source identifiers', async () => { mocks.fetchSession.mockRejectedValue({ code: 'permission-denied', message: 'sensitive source omitted' }); render(<VideoPlayerModal />); expect(await screen.findByText('Bạn không có quyền xem video này.')).toBeInTheDocument(); expect(document.body.textContent).not.toContain('sensitive source omitted'); });
  it('does not fetch when no lesson is open', () => { state.activeLesson = null; render(<VideoPlayerModal />); expect(mocks.fetchSession).not.toHaveBeenCalled(); });
});
