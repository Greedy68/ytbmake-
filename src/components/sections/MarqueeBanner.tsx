import React from 'react';
import { landingData } from '../../data/landingData';

export const MarqueeBanner: React.FC = () => {
  const { marquee } = landingData;
  const items = [...marquee, ...marquee, ...marquee, ...marquee];

  return (
    <div className="w-full bg-gradient-to-r from-[#ce1211] via-[#002976] to-[#ce1211] border-y border-white/20 py-3.5 overflow-hidden shadow-inner select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-6 mx-4">
            <span className="font-impact text-xl sm:text-2xl text-white tracking-widest uppercase hover:text-[#fabb15] transition-colors cursor-default">
              {item}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#fabb15] shadow-sm shadow-[#fabb15]" />
          </div>
        ))}
      </div>
    </div>
  );
};
