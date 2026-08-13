import React from 'react';
import { UserCheck, Flame, CheckCircle } from 'lucide-react';
import { landingData } from '../../data/landingData';

export const AuthorSection: React.FC = () => {
  const { author } = landingData;

  return (
    <section id={author.sectionId} className="py-20 bg-gradient-to-b from-[#001848] via-[#031a48] to-[#001848] text-white relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Author Image & Badge */}
            <div className="lg:col-span-5 relative text-center">
              <div className="relative inline-block mx-auto">
                <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-4 border-[#fabb15] shadow-2xl mx-auto">
                  <img
                    src="https://api.dgmd.academy/media/wysiwyg/socialnewdgmd.png"
                    alt={author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 right-1/2 translate-x-1/2 bg-[#ce1211] text-white px-5 py-2 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center gap-2 border border-red-400">
                  <Flame className="w-4 h-4 text-[#fabb15] fill-[#fabb15]" />
                  <span>Founder DGMD Academy</span>
                </div>
              </div>
            </div>

            {/* Right Column: Bio & Stats */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-[#06aef6]/20 text-[#06aef6] px-3.5 py-1 rounded-full text-xs font-bold uppercase">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Thành Hiếu là ai ?</span>
                </div>
                <h2 className="font-impact text-4xl sm:text-5xl text-white uppercase tracking-wide">
                  {author.name}{' '}
                  <span className="text-[#fabb15] text-2xl sm:text-3xl block font-sans font-medium normal-case mt-1">
                    ({author.nickname})
                  </span>
                </h2>
              </div>

              <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                {author.bio}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3">
                {author.stats.map((stat, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center hover:border-[#fabb15] transition-colors">
                    <span className="font-impact text-2xl sm:text-3xl text-[#fabb15] block">
                      {stat.value}
                    </span>
                    <span className="text-xs text-gray-300 font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Achievements Checklist */}
              <div className="space-y-2 pt-2">
                {author.achievements.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-gray-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
