import React, { useState } from 'react';
import { X, Lock, MessageSquare, Send, CheckCircle, VideoOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getVideoPlayerAdapter, resolveVideoSource } from '../../services/videoSource';

export const VideoPlayerModal: React.FC = () => {
  const {
    activeLesson,
    setActiveLesson,
    hasAccessToLesson,
    setActivePayPalLesson,
    comments,
    addComment,
    currentUser,
    setIsAuthModalOpen,
  } = useApp();

  const [commentInput, setCommentInput] = useState('');
  const [commentSubmittedNotice, setCommentSubmittedNotice] = useState(false);

  if (!activeLesson) return null;

  const userHasAccess = hasAccessToLesson(activeLesson);
  const lessonComments = comments.filter((c) => c.lessonId === activeLesson.id);
  const approvedComments = lessonComments.filter((c) => c.status === 'approved');
  const adapter = getVideoPlayerAdapter(resolveVideoSource(activeLesson), activeLesson.title);
  const unavailableReason = adapter.kind === 'unavailable' ? adapter.reason : '';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    addComment(activeLesson.id, commentInput.trim());
    setCommentInput('');
    setCommentSubmittedNotice(true);
    setTimeout(() => setCommentSubmittedNotice(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#001848] border border-blue-400/30 rounded-2xl shadow-2xl overflow-hidden text-white my-auto flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 bg-[#00266b] border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <span className="bg-[#ce1211] text-white font-impact text-xs px-2.5 py-1 rounded-md uppercase tracking-wider flex-shrink-0">
              {activeLesson.isFreePreview ? 'Free Preview' : userHasAccess ? 'Đã Sở Hữu' : 'Khóa Học Đóng'}
            </span>
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {activeLesson.moduleTitle} — {activeLesson.title}
            </h3>
          </div>

          <button
            onClick={() => setActiveLesson(null)}
            className="p-1 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Screen / Locked Screen */}
        <div className="relative w-full aspect-video bg-black flex-shrink-0">
          {userHasAccess && adapter.kind === 'html5' ? (
            <video
              src={adapter.src}
              controls
              autoPlay
              poster={activeLesson.thumbnailUrl}
              className="w-full h-full object-contain"
            />
          ) : userHasAccess && adapter.kind === 'iframe' ? (
            <iframe src={adapter.src} title={adapter.title} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          ) : userHasAccess ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-blue-200"><VideoOff className="w-12 h-12 mb-3" /><p>{unavailableReason}</p></div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              {/* Blurred Poster Background */}
              <img
                src={activeLesson.thumbnailUrl}
                alt={activeLesson.title}
                className="absolute inset-0 w-full h-full object-cover filter blur-md opacity-30 scale-105"
              />

              {/* Locked Content Card */}
              <div className="relative z-10 max-w-md p-6 bg-black/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl space-y-4">
                <div className="w-14 h-14 bg-amber-500/20 text-[#fabb15] border border-amber-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Lock className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">Nội Dung Cần Mở Khóa</h4>
                  <p className="text-xs text-blue-200 mt-1">
                    Bạn cần mua bài học này với giá <strong className="text-[#fabb15]">${activeLesson.price.toFixed(2)} USD</strong> bằng cổng PayPal để xem video full HD và nhận tài liệu đi kèm.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActivePayPalLesson(activeLesson)}
                    className="w-full py-3 px-6 bg-[#ffc439] hover:bg-[#f2ba32] text-[#003087] font-black rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                  >
                    <span className="text-base font-black italic tracking-tighter">Pay<span className="text-[#0079c1]">Pal</span></span>
                    <span>Thanh Toán ${activeLesson.price.toFixed(2)} Để Mở Khóa</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Bottom Area: Meta & Comments */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#00143d]">
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{activeLesson.title}</h2>
              <p className="text-xs text-blue-200 mt-0.5">Thời lượng bài học: {activeLesson.duration}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                {approvedComments.length} Bình Luận
              </span>
            </div>
          </div>

          {/* Comment Form Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#fabb15]" />
                <span>Bình luận & Thảo luận ({approvedComments.length})</span>
              </h4>

              {!currentUser && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs text-[#fabb15] hover:underline font-semibold"
                >
                  Đăng nhập để bình luận
                </button>
              )}
            </div>

            {/* Notification when user submits a comment */}
            {commentSubmittedNotice && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-[#fabb15] flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {currentUser?.role === 'admin'
                    ? 'Bình luận của Admin đã xuất hiện trực tiếp!'
                    : 'Bình luận của bạn đã gửi thành công và đang chờ Admin duyệt!'}
                </span>
              </div>
            )}

            {/* Input Box */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  currentUser
                    ? `Viết bình luận với tên ${currentUser.name}...`
                    : 'Đăng nhập để viết bình luận...'
                }
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#fabb15]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#fabb15] hover:bg-amber-400 text-[#001848] font-bold rounded-xl flex items-center gap-1.5 transition-colors text-xs sm:text-sm"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {approvedComments.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4 bg-white/5 rounded-xl border border-white/5">
                  Chưa có bình luận nào được duyệt. Hãy là người đầu tiên để lại ý kiến!
                </p>
              ) : (
                approvedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3"
                  >
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-8 h-8 rounded-full border border-white/20 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white">{comment.userName}</h5>
                        <span className="text-[10px] text-gray-400">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-gray-200 mt-1 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
