import React from 'react';
import { PlayCircle, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001848] text-gray-400 py-12 border-t border-white/10 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06aef6] to-[#002976] flex items-center justify-center shadow-md">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-impact text-2xl tracking-wider text-white">YMM<span className="text-[#fabb15]">.ACADEMY</span></span>
              <span className="text-[10px] text-blue-200 tracking-widest uppercase font-semibold">Học Làm Video Thực Chiến</span>
            </div>
          </a>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-gray-300">
            <a href="#module" className="hover:text-[#fabb15] transition-colors">Nội Dung Khóa Học</a>
            <a href="#loiich" className="hover:text-[#fabb15] transition-colors">Lợi Ích</a>
            <a href="#quyenloi" className="hover:text-[#fabb15] transition-colors">Quyền Lợi</a>
            <a href="#la_ai" className="hover:text-[#fabb15] transition-colors">Thành Hiếu YMM</a>
            <a href="#faq" className="hover:text-[#fabb15] transition-colors">FAQs</a>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>© 2026 YMM.academy — Bản quyền thuộc về YMM Media. All rights reserved.</span>
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by <span className="text-white font-bold">Midas</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
