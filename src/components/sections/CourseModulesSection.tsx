import React from 'react';
import { PlayCircle, Clock, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { landingData } from '../../data/landingData';
import { useApp } from '../../context/AppContext';
import type { VideoLesson } from '../../types/app';

export const CourseModulesSection: React.FC = () => {
  const { courseModules } = landingData;
  const { lessons, setActiveLesson, hasAccessToLesson } = useApp();

  // Group lessons by module
  const moduleMap = courseModules.modules.map((mod) => {
    const modLessons = lessons.filter((l) => l.moduleId === mod.id);
    return {
      ...mod,
      lessons: modLessons.length > 0 ? modLessons : mod.lessons.map(les => ({
        id: les.id,
        moduleId: mod.id,
        moduleTitle: mod.title,
        title: les.title,
        duration: les.duration,
        thumbnailUrl: les.thumbnailUrl,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        isFreePreview: false,
        price: 19.99
      }) as VideoLesson),
    };
  });

  // Custom uploaded lessons (if any)
  const customLessons = lessons.filter((l) => l.moduleId === 'mod_custom');

  return (
    <section id={courseModules.sectionId} className="py-20 bg-gradient-to-b from-[#0055c3] via-[#0047a7] to-[#003682] text-white relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[#00a6ff]/15 blur-3xl pointer-events-none" />

      <div className="max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h2 className="font-impact text-4xl sm:text-6xl text-white uppercase tracking-wider">
              {courseModules.titleMain}
            </h2>
            <span className="bg-[#ce1211] text-white font-impact text-2xl sm:text-4xl px-5 py-2 rounded-2xl shadow-xl shadow-red-900/50 border border-red-400/40 inline-block uppercase transform hover:scale-105 transition-transform">
              {courseModules.badgeText}
            </span>
          </div>

          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            {courseModules.subtitle} — <em>Click bất kỳ bài học nào bên dưới để mở player video & xem bình luận!</em>
          </p>
        </div>

        {/* Custom Uploaded Admin Videos Banner (If Any) */}
        {customLessons.length > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-5 backdrop-blur-md">
            <h3 className="text-sm font-bold text-[#fabb15] flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Bài Học Mới Upload Từ Admin ({customLessons.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {customLessons.map((les) => (
                <div
                  key={les.id}
                  onClick={() => setActiveLesson(les)}
                  className="p-3 bg-black/40 hover:bg-black/60 rounded-xl border border-amber-500/30 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <img src={les.thumbnailUrl} alt={les.title} className="w-16 h-11 object-cover rounded-lg flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{les.title}</h4>
                    <span className="text-[10px] text-amber-300 font-medium">{les.duration} • ${les.price} USD</span>
                  </div>
                  <PlayCircle className="w-5 h-5 text-[#fabb15] flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modules Slider */}
        <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-thin scrollbar-thumb-[#fabb15] scrollbar-track-transparent snap-x">
          {moduleMap.map((module, idx) => (
            <React.Fragment key={module.id}>
              
              {/* Module Card */}
              <div className="flex-none w-[320px] sm:w-[380px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 sm:p-6 shadow-2xl flex flex-col justify-between snap-start hover:border-[#fabb15]/60 transition-all duration-300 group">
                
                {/* Module Header */}
                <div className="space-y-3 mb-5 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="font-impact text-4xl text-white tracking-tight">
                      {module.moduleNumber}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-white uppercase leading-snug tracking-wide group-hover:text-[#fabb15] transition-colors">
                      {module.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs text-blue-200 font-semibold pt-1">
                    <span>Số lượng bài: <strong className="text-white font-bold">{module.lessons.length} bài</strong></span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#fabb15]" />
                      <span>Thời lượng: <strong className="text-white font-bold">{module.totalDuration}</strong></span>
                    </span>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-3.5 flex-1">
                  {module.lessons.map((lesson) => {
                    const hasAccess = hasAccessToLesson(lesson);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className="flex items-center gap-3.5 p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-500/60 cursor-pointer transition-all group/item"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 sm:w-24 aspect-[16/10] rounded-lg overflow-hidden flex-shrink-0 border border-amber-500/80 shadow-md">
                          <img
                            src={lesson.thumbnailUrl}
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {hasAccess ? (
                              <PlayCircle className="w-6 h-6 text-[#fabb15] shadow-md group-hover/item:scale-110 transition-transform" />
                            ) : (
                              <Lock className="w-5 h-5 text-white/90" />
                            )}
                          </div>
                        </div>

                        {/* Lesson Metadata */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2 group-hover/item:text-[#fabb15] transition-colors">
                              {lesson.title}
                            </h4>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] font-medium">
                            <span className="text-gray-300">{lesson.duration}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                              lesson.isFreePreview
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : hasAccess
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-amber-500/20 text-[#fabb15] border border-amber-500/30'
                            }`}>
                              {lesson.isFreePreview ? 'Free' : hasAccess ? 'Mở Khóa' : 'PayPal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom CTA for Module */}
                <div className="mt-6 pt-3">
                  <button
                    onClick={() => module.lessons[0] && setActiveLesson(module.lessons[0])}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-[#fabb15] hover:text-[#001848] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
                  >
                    <span>Vào học module này</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Decorative Connector Arrow */}
              {idx < moduleMap.length - 1 && (
                <div className="hidden lg:flex items-center justify-center flex-none text-white/40">
                  <div className="flex flex-col gap-1">
                    <ChevronRight className="w-6 h-6 -mr-3 stroke-[3]" />
                    <ChevronRight className="w-6 h-6 stroke-[3]" />
                  </div>
                </div>
              )}

            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};
