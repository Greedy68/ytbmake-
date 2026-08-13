import React from 'react';
import { Award, Sparkles } from 'lucide-react';
import { landingData } from '../../data/landingData';

export const BenefitsSection: React.FC = () => {
  const { benefits } = landingData;

  return (
    <section id="loiich" className="py-20 bg-gradient-to-b from-[#031a48] via-[#002976] to-[#031a48] text-white relative overflow-hidden">
      
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#06aef6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-[#fabb15]/20 text-[#fabb15] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border border-[#fabb15]/30">
            <Award className="w-4 h-4 text-[#fabb15]" />
            <span>{benefits.badge}</span>
          </div>

          <h2 className="font-impact text-4xl sm:text-5xl text-white uppercase tracking-wide leading-tight">
            {benefits.titleLine1} <br />
            <span className="text-[#fabb15]">{benefits.titleLine2}</span>
          </h2>
        </div>

        {/* Dynamic Cards Grid (Responsive 3 cols / 2 cols / 1 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.cards.map((card) => (
            <div
              key={card.id}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/15 hover:border-[#fabb15]/60 hover:bg-white/15 transition-all duration-300 shadow-xl hover:-translate-y-2 hover:shadow-2xl flex flex-col group"
            >
              {/* Image Box */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-gray-800">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#fabb15]">
                    <Sparkles className="w-3.5 h-3.5" /> Thống trị nền tảng
                  </span>
                </div>
              </div>

              {/* Title Text */}
              <h3 className="font-bold text-base sm:text-lg text-white leading-snug tracking-tight flex-1 whitespace-pre-line group-hover:text-[#fabb15] transition-colors">
                {card.title}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
