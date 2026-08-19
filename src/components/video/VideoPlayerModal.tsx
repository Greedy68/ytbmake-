import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Expand, Lock, MessageSquare, Send, VideoOff, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchPlaybackSession } from '../../services/firestore';
import { getVideoPlayerAdapter } from '../../services/videoSource';
import { createWatermarkSessionCode, getWatermarkPosition, maskEmail } from '../../services/watermark';
import type { VideoPlaybackSession } from '../../types/app';

export const VideoPlayerModal: React.FC = () => {
  const { activeLesson, setActiveLesson, hasAccessToLesson, setActivePayPalLesson, comments, addComment, currentUser, setIsAuthModalOpen } = useApp();
  const [commentInput, setCommentInput] = useState(''); const [commentSubmittedNotice, setCommentSubmittedNotice] = useState(false);
  const [session, setSession] = useState<VideoPlaybackSession | null>(null); const [sourceLoading, setSourceLoading] = useState(false); const [sourceError, setSourceError] = useState<string | null>(null);
  const [positionIndex, setPositionIndex] = useState(0); const playerRef = useRef<HTMLDivElement>(null);
  const sessionCode = useMemo(() => currentUser ? createWatermarkSessionCode(currentUser.id) : '', [currentUser]);
  const userHasAccess = Boolean(activeLesson && hasAccessToLesson(activeLesson));

  useEffect(() => {
    let active = true; setSession(null); setSourceError(null);
    if (!activeLesson || !userHasAccess || !currentUser || !activeLesson.sourceConfigured) return () => { active = false; };
    setSourceLoading(true);
    void fetchPlaybackSession(activeLesson.id).then((value) => { if (active) setSession(value); }).catch((error: unknown) => {
      if (!active) return;
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      setSourceError(code === 'permission-denied' ? 'Bạn không có quyền xem video này.' : 'Không thể tải nguồn video. Vui lòng kiểm tra mạng và thử lại.');
    }).finally(() => { if (active) setSourceLoading(false); });
    return () => { active = false; setSession(null); };
  }, [activeLesson, currentUser, userHasAccess]);

  useEffect(() => { if (!session || session.provider === 'unset') return; const timer = window.setInterval(() => setPositionIndex((value) => value + 1), 12_000); return () => window.clearInterval(timer); }, [session]);

  if (!activeLesson) return null;
  const approvedComments = comments.filter((comment) => comment.lessonId === activeLesson.id && comment.status === 'approved');
  const adapter = session ? getVideoPlayerAdapter(session, activeLesson.title) : null;
  const watermarkPosition = getWatermarkPosition(positionIndex);
  const positionClass = { 'top-left': 'top-4 left-4', 'top-right': 'top-4 right-4', 'bottom-left': 'bottom-14 left-4', 'bottom-right': 'bottom-14 right-4' }[watermarkPosition];
  const unavailableReason = sourceError || (!activeLesson.sourceConfigured ? 'Video chưa được cấu hình' : adapter?.kind === 'unavailable' ? adapter.reason : 'Không thể phát video');

  const requestFullscreen = async () => { if (!playerRef.current?.requestFullscreen) { setSourceError('Trình duyệt không hỗ trợ chế độ toàn màn hình của ứng dụng.'); return; } try { await playerRef.current.requestFullscreen(); } catch { setSourceError('Không thể mở chế độ toàn màn hình.'); } };
  const handleCommentSubmit = (event: React.FormEvent) => { event.preventDefault(); if (!commentInput.trim()) return; if (!currentUser) { setIsAuthModalOpen(true); return; } addComment(activeLesson.id, commentInput.trim()); setCommentInput(''); setCommentSubmittedNotice(true); window.setTimeout(() => setCommentSubmittedNotice(false), 4000); };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"><div className="relative w-full max-w-4xl bg-[#001848] border border-blue-400/30 rounded-2xl shadow-2xl overflow-hidden text-white my-auto flex flex-col max-h-[90vh]">
    <header className="flex items-center justify-between p-4 bg-[#00266b] border-b border-white/10"><div className="min-w-0"><span className="text-xs text-[#fabb15]">{activeLesson.courseId}</span><h3 className="font-bold truncate">{activeLesson.title}</h3></div><button aria-label="Đóng video" onClick={() => setActiveLesson(null)} className="p-1"><X /></button></header>
    <div ref={playerRef} className="relative w-full aspect-video bg-black flex-shrink-0 overflow-hidden">
      {userHasAccess && sourceLoading ? <div className="w-full h-full grid place-items-center text-blue-200" role="status">Đang tải nguồn video…</div>
        : userHasAccess && adapter?.kind === 'iframe' ? <><iframe src={adapter.src} title={adapter.title} className="w-full h-full" loading="lazy" allow="encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" /><div data-testid="video-watermark" className={`pointer-events-none absolute z-10 ${positionClass} max-w-[70%] rounded bg-black/45 px-2 py-1 text-[10px] text-white/70 transition-all duration-700`}>{maskEmail(currentUser?.email ?? '')} · {sessionCode} · {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div><button type="button" onClick={() => void requestFullscreen()} className="absolute right-3 bottom-3 z-20 rounded bg-black/60 p-2 text-white focus:ring-2 focus:ring-amber-400" aria-label="Toàn màn hình có watermark"><Expand className="w-4 h-4" /></button></>
        : userHasAccess ? <div className="w-full h-full flex flex-col items-center justify-center text-blue-200 px-6 text-center"><VideoOff className="w-12 h-12 mb-3" /><p>{unavailableReason}</p><p className="text-xs mt-2 text-blue-300">Video có thể đã bị xóa, chặn embedding hoặc giới hạn quyền xem.</p></div>
        : <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center"><Lock className="w-12 h-12 text-[#fabb15] mb-3" /><h4 className="font-bold">Nội dung cần mở khóa</h4><p className="text-xs text-blue-200 mt-2">Đăng nhập và có quyền khóa học để tải nguồn phát.</p>{!currentUser ? <button onClick={() => setIsAuthModalOpen(true)} className="mt-4 px-5 py-2 bg-[#fabb15] text-[#001848] rounded-xl font-bold">Đăng nhập</button> : <button onClick={() => setActivePayPalLesson(activeLesson)} className="mt-4 px-5 py-2 bg-[#fabb15] text-[#001848] rounded-xl font-bold">Xem quyền truy cập</button>}</div>}
    </div>
    <div className="p-4 sm:p-6 overflow-y-auto space-y-5"><div><h2 className="text-lg font-bold">{activeLesson.title}</h2><p className="text-xs text-blue-200">Thời lượng: {activeLesson.duration} · Watermark giúp truy vết, không thể ngăn quay màn hình tuyệt đối.</p></div><div className="space-y-3"><h4 className="text-sm font-bold flex gap-2"><MessageSquare className="w-4 h-4 text-[#fabb15]" />Bình luận ({approvedComments.length})</h4>{commentSubmittedNotice && <p className="p-3 bg-amber-500/20 rounded-xl text-xs flex gap-2"><CheckCircle className="w-4 h-4" />Đã gửi bình luận.</p>}<form onSubmit={handleCommentSubmit} className="flex gap-2"><input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Viết bình luận…" className="flex-1 px-4 py-2 bg-white/5 border border-white/15 rounded-xl" /><button className="px-4 bg-[#fabb15] text-[#001848] rounded-xl" aria-label="Gửi bình luận"><Send className="w-4 h-4" /></button></form>{approvedComments.map((comment) => <div key={comment.id} className="p-3 bg-white/5 rounded-xl"><strong className="text-xs">{comment.userName}</strong><p className="text-xs text-gray-200 mt-1">{comment.content}</p></div>)}</div></div>
  </div></div>;
};
