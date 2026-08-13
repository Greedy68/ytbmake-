import React from 'react';
import { HelpCircle } from 'lucide-react';
import { landingData } from '../../data/landingData';
import { AccordionItem } from '../ui/Accordion';

export const FaqSection: React.FC = () => {
  const { faqs } = landingData;

  return (
    <section id={faqs.sectionId} className="py-20 bg-[#031a48] text-white relative overflow-hidden border-t border-white/10">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#06aef6]/20 text-[#06aef6] px-4 py-1.5 rounded-full text-xs font-bold uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>Giải đáp thắc mắc</span>
          </div>

          <h2 className="font-impact text-4xl sm:text-5xl text-[#fabb15] uppercase tracking-wide">
            {faqs.title}
          </h2>

          <p className="text-gray-300 text-base sm:text-lg">
            {faqs.subtitle}
          </p>
        </div>

        {/* Dynamic Accordion Items List */}
        <div className="space-y-4">
          {faqs.items.map((item, index) => (
            <AccordionItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isOpenDefault={index === 0}
            />
          ))}
        </div>

        {/* Support CTA Banner */}
        <div className="bg-gradient-to-r from-[#002976] to-[#06aef6]/40 p-6 rounded-3xl border border-white/20 text-center space-y-3">
          <p className="text-sm font-semibold text-white">
            Bạn vẫn còn thắc mắc khác chưa tìm thấy câu trả lời?
          </p>
          <a
            href="#register"
            className="inline-block px-6 py-3 rounded-xl bg-[#fabb15] text-[#001848] font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors shadow-lg"
          >
            Liên hệ Hỗ Trợ Đăng Ký
          </a>
        </div>

      </div>
    </section>
  );
};
