import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpenDefault?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white hover:text-[#fabb15] transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-[#06aef6] flex-shrink-0" />
          <span>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 text-[#fabb15] flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm sm:text-base text-gray-300 leading-relaxed border-t border-white/5 pt-4 animate-in fade-in duration-200">
          {answer}
        </div>
      )}
    </div>
  );
};
