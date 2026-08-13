import React from 'react';
import { Star } from 'lucide-react';
import { landingData } from '../../data/landingData';

export const PrivilegesSection: React.FC = () => {
  const { privileges } = landingData;

  return (
    <section id="quyenloi" className="py-24 bg-[#001848] text-white relative overflow-hidden border-t border-white/10">
      
      {/* Background Radial Lights */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#06aef6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Giant Section Header */}
        <div className="text-center mb-20 space-y-3">
          <span className="inline-flex items-center gap-2 bg-[#fabb15]/20 text-[#fabb15] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[#fabb15]/30">
            <Star className="w-4 h-4 fill-[#fabb15]" />
            <span>{privileges.badge}</span>
          </span>
          <h2 className="font-impact text-5xl sm:text-7xl text-[#fabb15] uppercase tracking-wider drop-shadow-lg">
            {privileges.titleImage}
          </h2>
        </div>

        {/* List of Privileges (Alternating Row Layout) */}
        <div className="space-y-16 sm:space-y-24">
          {privileges.items.map((item, index) => {
            const isEven = index % 2 === 1;
            return (
              <div
                key={item.number}
                className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 ${
                  isEven ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image Box */}
                <div className="w-full lg:w-1/2 rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative group">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-72 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001848]/80 via-transparent to-transparent" />
                </div>

                {/* Text Content with Giant Watermark Number */}
                <div className="w-full lg:w-1/2 relative space-y-4 pt-6">
                  {/* Watermark Number */}
                  <span className="absolute -top-12 -left-4 font-impact text-8xl sm:text-9xl text-white/10 select-none pointer-events-none z-0">
                    {item.number}
                  </span>

                  <div className="relative z-10 space-y-3">
                    <span className="bg-[#06aef6]/20 text-[#06aef6] font-bold text-xs px-3 py-1 rounded-full uppercase border border-[#06aef6]/30">
                      Đặc quyền #{item.number}
                    </span>
                    
                    <h3 className="font-impact text-3xl sm:text-4xl text-[#fabb15] uppercase tracking-wide leading-tight">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
