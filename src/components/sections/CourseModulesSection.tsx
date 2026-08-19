import React, { useMemo } from 'react';
import { AlertCircle, Clock, Lock, PlayCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CourseModulesSection: React.FC = () => {
  const { lessons, mediaLoading, mediaError, reloadMedia, setActiveLesson, hasAccessToLesson } = useApp();
  const modules = useMemo(() => Object.entries(lessons.reduce<Record<string, typeof lessons>>((result, lesson) => {
    (result[lesson.courseId] ??= []).push(lesson); return result;
  }, {})), [lessons]);
  return <section id="module" className="py-16 bg-[#001848] text-white"><div className="max-w-7xl mx-auto px-4">
    <div className="text-center mb-10"><h2 className="font-impact text-3xl sm:text-5xl uppercase">Thư viện <span className="text-[#fabb15]">video YMM</span></h2><p className="text-blue-200 mt-3">Metadata được tải từ Cloud Firestore; nguồn phát chỉ tải khi mở bài học.</p></div>
    {mediaLoading ? <div className="py-16 text-center text-blue-200">Đang tải danh sách video…</div>
      : mediaError ? <div className="py-12 text-center"><AlertCircle className="mx-auto text-red-400" /><p className="mt-2 text-red-200">{mediaError}</p><button onClick={() => void reloadMedia()} className="mt-4 px-4 py-2 bg-white/10 rounded-xl"><RefreshCw className="inline w-4 h-4 mr-2" />Thử lại</button></div>
      : modules.length === 0 ? <div className="py-16 text-center text-blue-200">Chưa có video được xuất bản cho bạn.</div>
      : <div className="grid lg:grid-cols-2 gap-6">{modules.map(([courseId, courseLessons]) => <article key={courseId} className="bg-white/10 rounded-2xl border border-white/20 p-5"><h3 className="font-bold text-[#fabb15] mb-4">{courseId}</h3><div className="space-y-3">{courseLessons.map((lesson) => { const access = hasAccessToLesson(lesson); return <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className="w-full text-left p-3 rounded-xl bg-black/20 border border-white/10 flex gap-3 items-center"><div className="w-20 aspect-video bg-black/40 rounded-lg overflow-hidden flex items-center justify-center">{lesson.thumbnailUrl ? <img src={lesson.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <PlayCircle className="text-blue-300" />}</div><div className="flex-1"><h4 className="text-sm font-bold">{lesson.title}</h4><p className="text-xs text-blue-200 mt-1"><Clock className="inline w-3 h-3 mr-1" />{lesson.duration || 'Chưa cập nhật'} · {lesson.provider}</p></div>{access ? <PlayCircle className="text-[#fabb15]" /> : <Lock className="w-5 h-5" />}</button>; })}</div></article>)}</div>}
  </div></section>;
};
