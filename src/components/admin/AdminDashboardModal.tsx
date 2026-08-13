import React, { useState } from 'react';
import { X, Upload, MessageSquare, Video, CheckCircle2, Trash2, ShieldAlert, PlusCircle, Clock, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { CommentStatus } from '../../types/app';

export const AdminDashboardModal: React.FC = () => {
  const {
    isAdminDashboardOpen,
    setIsAdminDashboardOpen,
    currentUser,
    lessons,
    addLesson,
    deleteLesson,
    comments,
    approveComment,
    rejectComment,
    deleteComment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'comments'>('upload');
  const [commentFilter, setCommentFilter] = useState<CommentStatus | 'all'>('pending');

  // New Lesson Form State
  const [moduleTitle, setModuleTitle] = useState('Module 01: Thiết Kế Giao Diện');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('15:30');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [price, setPrice] = useState(19.99);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAdminDashboardOpen) return null;

  if (currentUser?.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="bg-[#001848] border border-red-500/40 rounded-2xl p-6 max-w-sm text-center text-white space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold">Quyền Truy Cập Bị Từ Chối</h3>
          <p className="text-xs text-blue-200">Bạn cần đăng nhập với quyền Admin để vào trang này.</p>
          <button
            onClick={() => setIsAdminDashboardOpen(false)}
            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addLesson({
      moduleId: 'mod_custom',
      moduleTitle,
      title: title.trim(),
      duration,
      thumbnailUrl,
      videoUrl,
      isFreePreview,
      price: Number(price),
    });

    setTitle('');
    setSuccessMessage('Đã thêm video bài học mới thành công vào danh sách!');
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const filteredComments = comments.filter((c) => {
    if (commentFilter === 'all') return true;
    return c.status === commentFilter;
  });

  const pendingCount = comments.filter((c) => c.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#001848] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-white my-auto flex flex-col max-h-[90vh]">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-[#00266b] border-b border-amber-500/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/20 text-[#fabb15] border border-amber-500/40 rounded-xl">
              <Video className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Bảng Quản Trị Admin</h3>
              <p className="text-[11px] text-blue-200">Quản lý upload video bài học & duyệt bình luận học viên</p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminDashboardOpen(false)}
            className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/20 flex-shrink-0 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-[#001848] text-[#fabb15] border-t-2 border-x border-[#fabb15]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Quản Lý Video ({lessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'comments'
                ? 'bg-[#001848] text-[#fabb15] border-t-2 border-x border-[#fabb15]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Duyệt Bình Luận</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-red-600 text-white font-extrabold rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#00143d]">
          
          {/* TAB 1: UPLOAD & MANAGING VIDEOS */}
          {activeTab === 'upload' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Upload */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-sm font-bold text-[#fabb15] flex items-center gap-2 border-b border-white/10 pb-3">
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload Bài Học Mới</span>
                </h4>

                {successMessage && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCreateLesson} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Tên Module</label>
                    <input
                      type="text"
                      required
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-black/30 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#fabb15]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Tiêu Đề Bài Học</label>
                    <input
                      type="text"
                      required
                      placeholder="Bài 05: Thực Hành Layout Nâng Cao"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-black/30 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#fabb15]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Thời Lượng</label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          placeholder="25:10"
                          className="w-full pl-8 pr-2 py-2 bg-black/30 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#fabb15]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Giá ($ USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={price}
                          onChange={(e) => setPrice(parseFloat(e.target.value))}
                          className="w-full pl-8 pr-2 py-2 bg-black/30 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#fabb15]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">URL Ảnh Thumbnail</label>
                    <input
                      type="text"
                      required
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-black/30 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#fabb15]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">URL Video Stream</label>
                    <input
                      type="text"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-black/30 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#fabb15]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="freePreviewToggle"
                      checked={isFreePreview}
                      onChange={(e) => setIsFreePreview(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 text-[#fabb15] focus:ring-0 accent-[#fabb15]"
                    />
                    <label htmlFor="freePreviewToggle" className="text-gray-200 font-semibold cursor-pointer">
                      Cho phép xem thử miễn phí (Free Preview)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#fabb15] hover:bg-amber-400 text-[#001848] font-bold rounded-xl shadow-lg transition-colors mt-2"
                  >
                    Tải Bài Học Phổ Biến Lên
                  </button>
                </form>
              </div>

              {/* Existing Videos List */}
              <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Danh Sách Video Đã Upload ({lessons.length})</span>
                  <span className="text-xs text-blue-200 font-normal">Quản lý & xóa bài học</span>
                </h4>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-3 bg-black/20 rounded-xl border border-white/10 flex items-center gap-3 hover:border-white/20 transition-colors"
                    >
                      <img
                        src={lesson.thumbnailUrl}
                        alt={lesson.title}
                        className="w-16 h-11 object-cover rounded-lg border border-white/20 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-amber-400 block truncate">
                          {lesson.moduleTitle}
                        </span>
                        <h5 className="text-xs font-bold text-white truncate">{lesson.title}</h5>
                        <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-0.5">
                          <span>{lesson.duration}</span>
                          <span>•</span>
                          <span className={lesson.isFreePreview ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                            {lesson.isFreePreview ? 'Free Preview' : `$${lesson.price}`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                        title="Xóa bài học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: COMMENT MODERATION */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              
              {/* Comment Filter Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setCommentFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        commentFilter === st
                          ? 'bg-[#fabb15] text-[#001848]'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {st === 'pending'
                        ? `Chờ Duyệt (${comments.filter((c) => c.status === 'pending').length})`
                        : st === 'approved'
                        ? `Đã Duyệt (${comments.filter((c) => c.status === 'approved').length})`
                        : st === 'rejected'
                        ? `Từ Chối (${comments.filter((c) => c.status === 'rejected').length})`
                        : `Tất Cả (${comments.length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment List */}
              <div className="space-y-3">
                {filteredComments.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-gray-400 text-xs">
                    Không có bình luận nào trong danh mục này.
                  </div>
                ) : (
                  filteredComments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <img
                          src={cmt.userAvatar}
                          alt={cmt.userName}
                          className="w-10 h-10 rounded-full border border-white/20 object-cover flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">{cmt.userName}</h5>
                            <span className="text-[10px] text-gray-400">{cmt.createdAt}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                cmt.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : cmt.status === 'pending'
                                  ? 'bg-amber-500/20 text-[#fabb15] border border-amber-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {cmt.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-200">{cmt.content}</p>
                        </div>
                      </div>

                      {/* Moderation Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        {cmt.status !== 'approved' && (
                          <button
                            onClick={() => approveComment(cmt.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                        )}

                        {cmt.status !== 'rejected' && (
                          <button
                            onClick={() => rejectComment(cmt.id)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors"
                          >
                            Từ chối
                          </button>
                        )}

                        <button
                          onClick={() => deleteComment(cmt.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Xóa bình luận"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
