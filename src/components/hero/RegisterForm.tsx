import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Sparkles, CheckCircle2, Flame, Clock, AlertCircle } from 'lucide-react';
import { landingData } from '../../data/landingData';
import { useApp } from '../../context/AppContext';

const FLASH_SALE_KEY = 'ymm_flash_sale_end_time';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const RegisterForm: React.FC = () => {
  const { setIsAuthModalOpen, signInWithSocial } = useApp();
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // 30-Day Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const getOrSetEndTime = () => {
      const stored = localStorage.getItem(FLASH_SALE_KEY);
      let endTime = stored ? parseInt(stored, 10) : 0;
      const now = Date.now();

      if (!endTime || now >= endTime) {
        endTime = now + THIRTY_DAYS_MS;
        localStorage.setItem(FLASH_SALE_KEY, endTime.toString());
      }
      return endTime;
    };

    let targetEndTime = getOrSetEndTime();

    const updateTimer = () => {
      const now = Date.now();
      let diff = targetEndTime - now;

      // Auto-reset when 30 days complete
      if (diff <= 0) {
        targetEndTime = now + THIRTY_DAYS_MS;
        localStorage.setItem(FLASH_SALE_KEY, targetEndTime.toString());
        diff = THIRTY_DAYS_MS;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const { registration } = landingData;
  const padZero = (num: number) => num.toString().padStart(2, '0');

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError('');
    try {
      await signInWithSocial('google');
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : 'Không thể đăng nhập với Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div id="register" className="w-full max-w-md mx-auto bg-[#001848]/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden p-6 sm:p-8 text-white relative group">
      {/* Decorative Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#06aef6]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#fabb15]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Title & Subtitle */}
      <div className="text-center mb-6">
        <h3 className="font-bold text-xl sm:text-2xl text-[#fabb15] uppercase tracking-wide leading-snug">
          {registration.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
          {registration.subtitle}
        </p>
      </div>

      {/* Box Header Summary */}
      <div className="bg-white/10 rounded-2xl p-3.5 mb-6 border border-white/10 flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-[#fabb15] flex-shrink-0" />
        <p className="text-xs text-gray-200 leading-snug font-medium">
          {registration.summaryText}
        </p>
      </div>

      {/* 3 Value Proposition Badges */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 hover:border-[#fabb15]/50 transition-colors">
          <ShieldCheck className="w-5 h-5 text-[#fabb15] mx-auto mb-1" />
          <p className="text-[11px] text-gray-300 font-semibold leading-tight">
            Không cần<br /><span className="text-white">lộ mặt</span>
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 hover:border-[#fabb15]/50 transition-colors">
          <Zap className="w-5 h-5 text-[#06aef6] mx-auto mb-1" />
          <p className="text-[11px] text-gray-300 font-semibold leading-tight">
            Không cần<br /><span className="text-white">thiết bị máy móc</span>
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 hover:border-[#fabb15]/50 transition-colors">
          <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-[11px] text-gray-300 font-semibold leading-tight">
            Không cần<br /><span className="text-white">kinh nghiệm</span>
          </p>
        </div>
      </div>

      {/* Google Login Button */}
      {googleError && (
        <div role="alert" className="mb-3 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{googleError}</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => void handleGoogleSignIn()}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-sm transition-all shadow-md active:scale-98 mb-5 cursor-pointer disabled:opacity-60 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fabb15]"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>{googleLoading ? 'Đang kết nối Google…' : 'Tiếp tục với Google'}</span>
      </button>

      {/* Tabs */}
      <div className="flex bg-white/10 rounded-xl p-1 mb-5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            handleOpenAuthModal();
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'register' ? 'bg-[#fabb15] text-[#001848] shadow-md' : 'text-gray-300 hover:text-white'
          }`}
        >
          Đăng ký ngay
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('login');
            handleOpenAuthModal();
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'login' ? 'bg-[#fabb15] text-[#001848] shadow-md' : 'text-gray-300 hover:text-white'
          }`}
        >
          Đăng nhập
        </button>
      </div>

      <p className="text-xs text-center text-emerald-300 font-semibold mb-4">
        ✨ Không có thêm bước nào cả. <button type="button" onClick={handleOpenAuthModal} className="underline cursor-pointer">Đăng ký là xem được ngay!</button>
      </p>

      {/* 30-Day Flash Sale Countdown Timer Box - Moved Directly Above Red Button */}
      <div className="mb-5 bg-gradient-to-r from-amber-500/25 via-yellow-500/35 to-amber-500/25 p-4 rounded-2xl border border-amber-400/60 shadow-xl shadow-amber-500/10 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-2.5">
          <Flame className="w-5 h-5 text-[#fabb15] animate-bounce" />
          <h4 className="text-xs sm:text-sm font-black text-[#fabb15] uppercase tracking-wider">
            Ưu đãi Flash sale kết thúc sau:
          </h4>
          <Clock className="w-4 h-4 text-[#fabb15]" />
        </div>

        {/* Timer Numbers Grid */}
        <div className="flex items-center justify-center gap-2 text-center">
          <div className="bg-gradient-to-b from-[#002b70] to-[#00143d] border border-amber-400/50 rounded-xl px-2.5 py-1.5 min-w-[58px] shadow-md">
            <span className="font-impact text-xl sm:text-2xl text-[#fabb15] block tracking-wide">
              {padZero(timeLeft.days)}
            </span>
            <span className="text-[9px] font-extrabold uppercase text-blue-200 block -mt-1">Ngày</span>
          </div>

          <span className="font-impact text-xl text-[#fabb15] animate-pulse">:</span>

          <div className="bg-gradient-to-b from-[#002b70] to-[#00143d] border border-amber-400/50 rounded-xl px-2.5 py-1.5 min-w-[54px] shadow-md">
            <span className="font-impact text-xl sm:text-2xl text-white block tracking-wide">
              {padZero(timeLeft.hours)}
            </span>
            <span className="text-[9px] font-extrabold uppercase text-blue-200 block -mt-1">Giờ</span>
          </div>

          <span className="font-impact text-xl text-[#fabb15] animate-pulse">:</span>

          <div className="bg-gradient-to-b from-[#002b70] to-[#00143d] border border-amber-400/50 rounded-xl px-2.5 py-1.5 min-w-[54px] shadow-md">
            <span className="font-impact text-xl sm:text-2xl text-white block tracking-wide">
              {padZero(timeLeft.minutes)}
            </span>
            <span className="text-[9px] font-extrabold uppercase text-blue-200 block -mt-1">Phút</span>
          </div>

          <span className="font-impact text-xl text-[#fabb15] animate-pulse">:</span>

          <div className="bg-gradient-to-b from-[#002b70] to-[#00143d] border border-amber-400/50 rounded-xl px-2.5 py-1.5 min-w-[54px] shadow-md">
            <span className="font-impact text-xl sm:text-2xl text-amber-400 block tracking-wide">
              {padZero(timeLeft.seconds)}
            </span>
            <span className="text-[9px] font-extrabold uppercase text-blue-200 block -mt-1">Giây</span>
          </div>
        </div>
      </div>

      {/* Main Red Call-To-Action Button -> Triggers Popup Modal */}
      <button
        type="button"
        onClick={handleOpenAuthModal}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ce1211] via-red-600 to-[#ce1211] text-white font-extrabold text-base shadow-xl shadow-red-900/40 hover:shadow-2xl hover:scale-102 active:scale-98 transition-all flex flex-col items-center justify-center gap-0.5 border border-red-400/30 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#fabb15]" />
          <span>ĐĂNG KÝ HỌC THỬ NGAY</span>
        </span>
        <span className="text-[11px] font-normal text-amber-200">Hoàn toàn MIỄN PHÍ | Hiệu quả cao</span>
      </button>

      {/* Launch Note */}
      <div className="mt-5 pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-gray-300">
          🎉 {registration.launchNote}
        </p>
      </div>
    </div>
  );
};
