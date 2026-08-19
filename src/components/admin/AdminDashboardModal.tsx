import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Pencil, PlusCircle, Shield, ShieldAlert, Trash2, Video, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSafeHttpsUrl } from '../../services/videoSource';
import type { MediaStatus, MediaVisibility, UserRole, UserStatus, VideoLesson, VideoSourceType } from '../../types/app';

const emptyForm = {
  moduleTitle: 'Video YMM', title: '', description: '', duration: '', thumbnailUrl: '',
  sourceType: 'unset' as VideoSourceType, sourceUrl: '', visibility: 'private' as MediaVisibility,
  status: 'draft' as MediaStatus, isFreePreview: false, price: 0,
};

export const AdminDashboardModal: React.FC = () => {
  const {
    isAdminDashboardOpen, setIsAdminDashboardOpen, currentUser, users, loadUsers, setUserAccess,
    lessons, mediaLoading, mediaError, addLesson, editLesson, deleteLesson,
  } = useApp();
  const [tab, setTab] = useState<'media' | 'users'>('media');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdminDashboardOpen && currentUser?.role === 'admin') void loadUsers().catch(() => setNotice({ type: 'error', text: 'Không thể tải danh sách người dùng.' }));
  }, [isAdminDashboardOpen, currentUser?.role, loadUsers]); // load only when the admin panel opens

  if (!isAdminDashboardOpen) return null;
  if (currentUser?.role !== 'admin') return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"><div className="bg-[#001848] p-6 rounded-2xl text-center text-white"><ShieldAlert className="mx-auto text-red-500" /><p className="mt-3">Quyền truy cập bị từ chối.</p><button onClick={() => setIsAdminDashboardOpen(false)} className="mt-4">Đóng</button></div></div>;

  const edit = (lesson: VideoLesson) => {
    setEditingId(lesson.id);
    setForm({
      moduleTitle: lesson.moduleTitle, title: lesson.title, description: lesson.description,
      duration: lesson.duration, thumbnailUrl: lesson.thumbnailUrl, sourceType: lesson.sourceType,
      sourceUrl: lesson.sourceUrl ?? '', visibility: lesson.visibility, status: lesson.status,
      isFreePreview: lesson.isFreePreview, price: lesson.price,
    });
  };

  const submitMedia = async (event: React.FormEvent) => {
    event.preventDefault(); setNotice(null);
    if (form.title.trim().length < 2 || form.title.trim().length > 150) return setNotice({ type: 'error', text: 'Tiêu đề phải có từ 2 đến 150 ký tự.' });
    if (form.description.length > 2000) return setNotice({ type: 'error', text: 'Mô tả tối đa 2.000 ký tự.' });
    if (form.sourceUrl && !isSafeHttpsUrl(form.sourceUrl)) return setNotice({ type: 'error', text: 'URL nguồn phải dùng HTTPS hợp lệ.' });
    if (form.sourceType !== 'unset' && form.sourceType !== 'future_storage' && !form.sourceUrl) return setNotice({ type: 'error', text: 'Nguồn đã chọn cần có URL.' });
    setSaving(true);
    const input = {
      type: 'video' as const, moduleId: 'mod_custom', moduleTitle: form.moduleTitle.trim(), title: form.title.trim(),
      description: form.description.trim(), duration: form.duration.trim(), thumbnailUrl: form.thumbnailUrl.trim(),
      sourceType: form.sourceType, sourceUrl: form.sourceUrl.trim() || null, sourcePath: null,
      visibility: form.visibility, status: form.status, isFreePreview: form.isFreePreview, price: Number(form.price),
    };
    try {
      if (editingId) await editLesson(editingId, input); else await addLesson(input);
      setForm(emptyForm); setEditingId(null);
      setNotice({ type: 'success', text: editingId ? 'Đã cập nhật metadata video.' : 'Đã tạo metadata video.' });
    } catch { setNotice({ type: 'error', text: 'Không thể lưu metadata. Vui lòng kiểm tra quyền và thử lại.' }); }
    finally { setSaving(false); }
  };

  const updateAccess = async (uid: string, role: UserRole, status: UserStatus) => {
    try { await setUserAccess(uid, role, status); setNotice({ type: 'success', text: 'Đã cập nhật quyền người dùng.' }); }
    catch { setNotice({ type: 'error', text: 'Không thể cập nhật quyền. Không được tự hạ quyền tài khoản đang dùng.' }); }
  };

  const field = 'w-full px-3 py-2 bg-black/30 border border-white/15 rounded-xl text-white text-xs';
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 text-white">
    <div className="w-full max-w-5xl bg-[#001848] rounded-2xl max-h-[92vh] overflow-y-auto border border-amber-500/30">
      <header className="sticky top-0 z-10 flex justify-between p-4 bg-[#00266b] border-b border-white/10"><h3 className="font-bold flex gap-2"><Shield className="text-[#fabb15]" />Quản trị YMM</h3><button onClick={() => setIsAdminDashboardOpen(false)}><X /></button></header>
      <nav className="flex gap-2 p-4 border-b border-white/10"><button onClick={() => setTab('media')} className={`px-4 py-2 rounded-xl ${tab === 'media' ? 'bg-[#fabb15] text-[#001848]' : 'bg-white/10'}`}><Video className="inline w-4 h-4 mr-2" />Media</button><button onClick={() => setTab('users')} className={`px-4 py-2 rounded-xl ${tab === 'users' ? 'bg-[#fabb15] text-[#001848]' : 'bg-white/10'}`}><Shield className="inline w-4 h-4 mr-2" />Người dùng</button></nav>
      <main className="p-4 sm:p-6 space-y-4">
        {notice && <div className={`p-3 rounded-xl text-xs flex gap-2 ${notice.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>{notice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{notice.text}</div>}
        {tab === 'media' ? <div className="grid lg:grid-cols-2 gap-6">
          <form onSubmit={submitMedia} className="space-y-3 bg-white/5 p-4 rounded-2xl">
            <h4 className="font-bold text-[#fabb15] flex gap-2"><PlusCircle className="w-4 h-4" />{editingId ? 'Sửa metadata video' : 'Thêm metadata video'}</h4>
            <input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề" />
            <textarea className={field} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" />
            <div className="grid grid-cols-2 gap-2"><input className={field} value={form.moduleTitle} onChange={(e) => setForm({ ...form, moduleTitle: e.target.value })} placeholder="Nhóm/module" /><input className={field} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Thời lượng" /></div>
            <input className={field} value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="Thumbnail HTTPS (không bắt buộc)" />
            <div className="grid grid-cols-2 gap-2"><select className={field} value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value as VideoSourceType })}>{['unset','external_url','youtube','vimeo','future_storage'].map((v) => <option key={v}>{v}</option>)}</select><input className={field} value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="Source URL HTTPS" /></div>
            <div className="grid grid-cols-2 gap-2"><select className={field} value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as MediaVisibility })}>{['private','authenticated','public'].map((v) => <option key={v}>{v}</option>)}</select><select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MediaStatus })}>{['draft','published','archived'].map((v) => <option key={v}>{v}</option>)}</select></div>
            <button disabled={saving} className="w-full py-2 bg-[#fabb15] text-[#001848] rounded-xl font-bold">{saving ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : 'Tạo metadata'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="w-full text-xs text-blue-200">Hủy chỉnh sửa</button>}
          </form>
          <section className="space-y-3"><h4 className="font-bold">Media ({lessons.length})</h4>{mediaLoading ? <p>Đang tải…</p> : mediaError ? <p className="text-red-300">{mediaError}</p> : lessons.length === 0 ? <p className="text-blue-200">Chưa có media.</p> : lessons.map((lesson) => <article key={lesson.id} className="p-3 bg-white/5 rounded-xl flex justify-between gap-3"><div><p className="font-bold text-sm">{lesson.title}</p><p className="text-xs text-blue-200">{lesson.status} · {lesson.visibility} · {lesson.sourceType}</p></div><div className="flex gap-1"><button onClick={() => edit(lesson)} aria-label="Sửa"><Pencil className="w-4 h-4" /></button><button onClick={() => void deleteLesson(lesson.id).catch(() => setNotice({ type: 'error', text: 'Không thể xóa media.' }))} aria-label="Xóa"><Trash2 className="w-4 h-4 text-red-400" /></button></div></article>)}</section>
        </div> : <section className="space-y-3">{users.length === 0 ? <p className="text-blue-200">Chưa có người dùng hoặc không thể tải dữ liệu.</p> : users.map((user) => <article key={user.id} className="p-3 bg-white/5 rounded-xl flex flex-wrap justify-between gap-3"><div><p className="font-bold text-sm">{user.name}</p><p className="text-xs text-blue-200">{user.email}</p></div><div className="flex gap-2"><select className={field} value={user.role} disabled={user.id === currentUser.id} onChange={(e) => void updateAccess(user.id, e.target.value as UserRole, user.status)}><option value="user">user</option><option value="admin">admin</option></select><select className={field} value={user.status} disabled={user.id === currentUser.id} onChange={(e) => void updateAccess(user.id, user.role, e.target.value as UserStatus)}><option value="active">active</option><option value="disabled">disabled</option></select></div></article>)}</section>}
      </main>
    </div>
  </div>;
};
