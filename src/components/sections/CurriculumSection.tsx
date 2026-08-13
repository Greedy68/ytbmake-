import React from 'react';
import { CheckCircle2, BookOpen } from 'lucide-react';
import { landingData } from '../../data/landingData';

export const CurriculumSection: React.FC = () => {
  const { curriculum } = landingData;

  return (
    <section id="module" className="py-20 bg-white text-gray-900 relative overflow-hidden">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-10 -left-20 w-64 h-64 rounded-full border-[20px] border-blue-500/10 pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full border-[30px] border-red-500/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-[#06aef6]/10 text-[#002976] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#06aef6]" />
            <span>{curriculum.badge}</span>
          </div>

          <h2 className="font-impact text-4xl sm:text-5xl text-[#001848] uppercase tracking-wide leading-tight">
            {curriculum.titleLine1} <br />
            <span className="text-[#ce1211]">{curriculum.titleLine2}</span>
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {curriculum.description}
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: 15 Curriculum Bullet Points */}
          <div className="lg:col-span-7 bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-[#001848] mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
              <span className="w-3 h-3 rounded-full bg-[#ce1211]" />
              <span>{curriculum.pointsHeader}</span>
            </h3>

            <div className="grid grid-cols-1 gap-3.5">
              {curriculum.points.map((point) => (
                <div
                  key={point.id}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 transition-all duration-200 shadow-sm group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#ce1211] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-red-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-800 leading-snug group-hover:text-[#001848] transition-colors">
                    {point.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Preview Banner */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img
                src={curriculum.imageUrl}
                alt="Nội dung khóa học DGMD"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001848]/90 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-2">
                  <span className="bg-[#fabb15] text-[#001848] text-xs font-black px-3 py-1 rounded-full uppercase">
                    Thực chiến 100%
                  </span>
                  <h4 className="font-impact text-xl sm:text-2xl text-white uppercase">
                    Hơn 100 Video Bài Học Chi Tiết
                  </h4>
                  <p className="text-xs text-gray-200">
                    Cập nhật kiến thức mới liên tục theo xu hướng YouTube & AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="bg-[#001848] text-white p-6 rounded-3xl shadow-xl text-center space-y-3">
              <p className="text-sm font-semibold text-gray-200">
                Sẵn sàng khám phá toàn bộ bài học?
              </p>
              <a
                href="#register"
                className="inline-block w-full py-3.5 px-6 rounded-2xl bg-[#fabb15] text-[#001848] font-extrabold text-sm hover:bg-[#ffe066] transition-colors shadow-lg"
              >
                Đăng ký học thử ngay
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
