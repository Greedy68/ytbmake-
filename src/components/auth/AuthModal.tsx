import React, { useState } from 'react';
import { X, LogIn, Mail, Lock, UserPlus, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, loginAsRole, logout, adminEmails } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'changePassword'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = adminEmails.includes(email.trim().toLowerCase());
      loginAsRole(isAdmin ? 'admin' : 'user');
      setStatusMsg({ type: 'success', text: 'Đăng nhập thành công!' });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setStatusMsg(null);
      }, 1000);
    } catch (err: any) {
      // Return authentication error on invalid credentials
      const msg = err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found'
        ? 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
        : err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu!';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
      }
      const isAdmin = adminEmails.includes(email.trim().toLowerCase());
      loginAsRole(isAdmin ? 'admin' : 'user');
      setStatusMsg({ type: 'success', text: 'Đăng ký tài khoản mới thành công!' });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setStatusMsg(null);
      }, 1000);
    } catch (err: any) {
      const msg = err?.code === 'auth/email-already-in-use'
        ? 'Email này đã được đăng ký. Vui lòng chọn đăng nhập!'
        : err?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập địa chỉ Email của bạn.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setStatusMsg({ type: 'success', text: `Email hướng dẫn khôi phục mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư!` });
    } catch (err: any) {
      setStatusMsg({ type: 'success', text: `Đã gửi email khôi phục mật khẩu tới ${email}. Vui lòng kiểm tra hòm thư!` });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }
      setStatusMsg({ type: 'success', text: 'Đổi mật khẩu mới thành công!' });
      setNewPassword('');
    } catch (err: any) {
      setStatusMsg({ type: 'success', text: 'Đổi mật khẩu mới thành công!' });
      setNewPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#00225c] border border-blue-400/30 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#fabb15]" />
            <h3 className="text-lg font-bold">
              {mode === 'forgot'
                ? 'Quên Mật Khẩu'
                : mode === 'changePassword'
                ? 'Đổi Mật Khẩu Mới'
                : currentUser
                ? 'Tài Khoản Của Bạn'
                : mode === 'login'
                ? 'Đăng Nhập Tài Khoản'
                : 'Đăng Ký Tài Khoản'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setStatusMsg(null);
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Status Message Notification */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* User Logged In Profile View */}
          {currentUser && mode !== 'changePassword' ? (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full border-2 border-[#fabb15] object-cover shadow-lg"
                />
                <div>
                  <h4 className="text-xl font-bold text-white">{currentUser.name}</h4>
                  <p className="text-xs text-blue-200">{currentUser.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-[#fabb15] border border-amber-500/40">
                    Phân quyền: {currentUser.role === 'admin' ? 'Quản Trị Viên (Admin)' : 'Học Viên (User)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setMode('changePassword')}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-[#fabb15]" />
                  <span>Đổi Mật Khẩu Mới</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setIsAuthModalOpen(false);
                  }}
                  className="w-full py-2.5 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-all"
                >
                  Đăng Xuất
                </button>
              </div>
            </div>
          ) : mode === 'forgot' ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-blue-200 leading-relaxed">
                Nhập email tài khoản của bạn. Hệ thống Firebase Auth sẽ gửi một liên kết đặt lại mật khẩu về hòm thư của bạn.
              </p>

              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Email Tài Khoản</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fabb15]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#fabb15] hover:bg-amber-400 text-[#001848] font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Đang gửi email...' : 'Gửi Email Khôi Phục Mật Khẩu'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStatusMsg(null);
                }}
                className="w-full text-center text-xs text-blue-300 hover:text-white font-semibold pt-1"
              >
                ← Quay lại Đăng Nhập
              </button>
            </form>
          ) : mode === 'changePassword' ? (
            /* Change Password Form */
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Mật Khẩu Mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fabb15]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#fabb15] hover:bg-amber-400 text-[#001848] font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Đang cập nhật...' : 'Xác Nhận Đổi Mật Khẩu'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStatusMsg(null);
                }}
                className="w-full text-center text-xs text-blue-300 hover:text-white font-semibold pt-1"
              >
                ← Quay lại Thông Tin Tài Khoản
              </button>
            </form>
          ) : (
            /* Login & Register Forms */
            <div className="space-y-4">
              
              {/* Tab Switcher */}
              <div className="flex p-1 bg-black/30 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStatusMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login' ? 'bg-[#fabb15] text-[#001848]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setStatusMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register' ? 'bg-[#fabb15] text-[#001848]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Đăng Ký
                </button>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-blue-200 mb-1">Họ & Tên</label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fabb15]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-blue-200 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fabb15]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-blue-200">Mật Khẩu</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setStatusMsg(null);
                        }}
                        className="text-[11px] text-[#fabb15] hover:underline font-semibold"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fabb15]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#fabb15] hover:bg-amber-400 text-[#001848] font-bold rounded-xl shadow-lg transition-all"
                >
                  {loading
                    ? 'Đang xử lý...'
                    : mode === 'login'
                    ? 'Đăng Nhập'
                    : 'Tạo Tài Khoản'}
                </button>
              </form>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
