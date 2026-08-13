import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { landingData } from '../../data/landingData';

export const RegisterForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitted(true);
    setTimeout(() => {
      alert(`[Demo Clone] Đăng ký thành công tài khoản: ${email}`);
      setIsSubmitted(false);
    }, 800);
  };

  const { registration } = landingData;

  return (
    <div id="register" className="w-full max-w-md mx-auto bg-[#001848]/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden p-6 sm:p-8 text-white relative group">
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
      <button
        type="button"
        onClick={() => alert('[Demo Clone] Đăng nhập Google đã khởi chạy')}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-all shadow-md active:scale-98 mb-5 cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Đăng nhập với Google</span>
      </button>

      {/* Tabs */}
      <div className="flex bg-white/10 rounded-xl p-1 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'register' ? 'bg-[#fabb15] text-[#001848] shadow-md' : 'text-gray-300 hover:text-white'
          }`}
        >
          Đăng ký ngay
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'login' ? 'bg-[#fabb15] text-[#001848] shadow-md' : 'text-gray-300 hover:text-white'
          }`}
        >
          Đăng nhập
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-center text-emerald-300 font-semibold">
          ✨ Không có thêm bước nào cả. <span className="underline">Đăng ký là xem được ngay!</span>
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nhapemailcuaban@gmail.com"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#fabb15] text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#fabb15] text-sm transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {activeTab === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              required
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#fabb15] text-sm transition-colors"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitted}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ce1211] via-red-600 to-[#ce1211] text-white font-extrabold text-base shadow-xl shadow-red-900/40 hover:shadow-2xl hover:scale-102 active:scale-98 transition-all flex flex-col items-center justify-center gap-0.5 border border-red-400/30 cursor-pointer mt-2"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#fabb15]" />
            {activeTab === 'register' ? 'ĐĂNG KÝ HỌC THỬ NGAY' : 'ĐĂNG NHẬP HỌC NGAY'}
          </span>
          <span className="text-[11px] font-normal text-amber-200">Hoàn toàn MIỄN PHÍ | Hiệu quả cao</span>
        </button>
      </form>

      {/* Launch Note */}
      <div className="mt-5 pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-gray-300">
          🎉 {registration.launchNote}
        </p>
      </div>
    </div>
  );
};
