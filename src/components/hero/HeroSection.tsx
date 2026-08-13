import React from 'react';
import { Check, Star, Play, Sparkles } from 'lucide-react';
import { landingData } from '../../data/landingData';
import { RegisterForm } from './RegisterForm';

export const HeroSection: React.FC = () => {
  const { hero } = landingData;

  return (
    <section className="relative overflow-hidden pt-10 pb-20 bg-gradient-to-b from-[#06aef6]/20 via-[#002976]/90 to-[#031a48]">
      {/* Background Decorative Mesh & Radial Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,174,246,0.35),rgba(255,255,255,0))]" />
      
      {/* Floating Media Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block opacity-40">
        <div className="absolute top-10 left-10 w-24 h-24 bg-red-600/20 rounded-full blur-xl animate-float" />
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-[#fabb15]/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Top Badge */}
            <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <span className="bg-[#fabb15] text-[#001848] font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-md">
                {hero.badgeText}
              </span>
              <p className="text-sm sm:text-base font-semibold text-blue-100 flex-1">
                {hero.badgeSubtitle}
              </p>
            </div>

            {/* Main Title */}
            <div className="space-y-2">
              <span className="text-blue-300 font-bold uppercase tracking-widest text-sm sm:text-base">
                {hero.subHeader}
              </span>
              <h1 className="font-impact text-4xl sm:text-6xl text-white uppercase tracking-wide leading-tight drop-shadow-md">
                {hero.mainTitle.split(' ').map((word, i) => (
                  <span key={i} className={i % 3 === 0 ? 'text-[#fabb15]' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
            </div>

            {/* Feature List Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-4">
              <p className="text-sm font-medium text-blue-200">
                {hero.boxHeader}
              </p>
              <div className="space-y-3">
                {hero.features.map((feat) => (
                  <div key={feat.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#06aef6]/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#06aef6]/40">
                      <Play className="w-4 h-4 text-[#fabb15] fill-[#fabb15]" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-white leading-snug">
                      {feat.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience List */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-300">
                {hero.audienceHeader}
              </p>
              <div className="space-y-2.5">
                {hero.audienceList.map((aud) => (
                  <div key={aud.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-100">
                      {aud.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Yellow Highlight Banner */}
            <div className="bg-gradient-to-r from-[#fabb15] to-[#ffe066] text-[#001848] rounded-2xl p-5 shadow-xl flex items-start gap-4 border border-yellow-200">
              <Sparkles className="w-8 h-8 text-[#001848] flex-shrink-0 mt-0.5" />
              <p className="font-bold text-sm sm:text-base leading-relaxed">
                {hero.highlightBanner}
              </p>
            </div>

            {/* Instructor Red Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ce1211] via-red-700 to-[#ce1211] p-6 text-white shadow-2xl border border-red-500/30">
              <div className="relative z-10 space-y-4">
                <div>
                  <p className="text-xs text-red-200 font-medium">
                    {hero.authorCard.label}
                  </p>
                  <h3 className="font-impact text-3xl sm:text-4xl text-[#fabb15] uppercase tracking-wider mt-1">
                    {hero.authorCard.name}{' '}
                    <span className="block text-base font-sans font-medium text-white normal-case mt-0.5">
                      ({hero.authorCard.tagline})
                    </span>
                  </h3>
                </div>

                <ul className="space-y-2">
                  {hero.authorCard.achievements.map((ach) => (
                    <li key={ach.id} className="flex items-start gap-2.5 text-xs sm:text-sm text-red-100">
                      <Star className="w-4 h-4 text-[#fabb15] fill-[#fabb15] flex-shrink-0 mt-0.5" />
                      <span>{ach.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <RegisterForm />
          </div>

        </div>
      </div>
    </section>
  );
};
