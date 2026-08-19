import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Lock, LogIn, Mail, UserPlus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type Mode = 'login' | 'register' | 'forgot' | 'changePassword';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen, setIsAuthModalOpen, currentUser, authLoading, authError,
    login, register, logout, changePassword, requestPasswordReset,
  } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetCooldownUntil, setResetCooldownUntil] = useState(0);

  if (!isAuthModalOpen) return null;

  const fail = (text: string) => setStatus({ type: 'error', text });
  const validCredentials = () => {
    if (!EMAIL_PATTERN.test(email.trim())) return fail('Vui lòng nhập địa chỉ email hợp lệ.'), false;
    if (password.length < 6) return fail('Mật khẩu phải có ít nhất 6 ký tự.'), false;
    if (mode === 'register' && (name.trim().length < 2 || name.trim().length > 100)) {
      return fail('Họ tên phải có từ 2 đến 100 ký tự.'), false;
    }
    return true;
  };

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validCredentials()) return;
    setLoading(true);
    setStatus(null);
    try {
      if (mode === 'register') await register(name, email, password);
      else await login(email, password);
      setStatus({ type: 'success', text: mode === 'register' ? 'Đăng ký thành công.' : 'Đăng nhập thành công.' });
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Không thể xác thực.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) return fail('Vui lòng nhập địa chỉ email hợp lệ.');
    if (Date.now() < resetCooldownUntil) return;
    setLoading(true);
    setStatus(null);
    try {
      await requestPasswordReset(email);
    } catch {
      // A neutral response prevents account enumeration.
    } finally {
      setResetCooldownUntil(Date.now() + 30_000);
      setStatus({ type: 'success', text: 'Nếu email hợp lệ, hướng dẫn đặt lại mật khẩu sẽ được gửi trong ít phút.' });
      setLoading(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword) return fail('Vui lòng nhập mật khẩu hiện tại.');
    if (newPassword.length < 8) return fail('Mật khẩu mới phải có ít nhất 8 ký tự.');
    if (newPassword !== confirmPassword) return fail('Xác nhận mật khẩu không khớp.');
    if (newPassword === currentPassword) return fail('Mật khẩu mới phải khác mật khẩu hiện tại.');
    setLoading(true);
    setStatus(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setStatus({ type: 'success', text: 'Đổi mật khẩu thành công.' });
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Không thể đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full pl-9 pr-3 py-2 bg-black/20 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#fabb15]';
  const passwordInput = (label: string, value: string, setter: (value: string) => void) => <div>
    <label className="block text-xs font-semibold text-blue-200 mb-1">{label}</label>
    <div className="relative"><Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      <input type="password" required autoComplete="current-password" value={value} onChange={(event) => setter(event.target.value)} className={inputClass} />
    </div>
  </div>;

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
    <div className="relative w-full max-w-md bg-[#00225c] border border-blue-400/30 rounded-2xl shadow-2xl overflow-hidden text-white">
      <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
        <h3 className="text-lg font-bold flex items-center gap-2"><LogIn className="w-5 h-5 text-[#fabb15]" />
          {currentUser && mode !== 'changePassword' ? 'Tài khoản của bạn' : mode === 'register' ? 'Đăng ký' : mode === 'forgot' ? 'Quên mật khẩu' : mode === 'changePassword' ? 'Đổi mật khẩu' : 'Đăng nhập'}
        </h3>
        <button onClick={() => setIsAuthModalOpen(false)} aria-label="Đóng"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6 space-y-5">
        {(status || authError) && <div className={`p-3 rounded-xl text-xs flex gap-2 ${status?.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
          {status?.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{status?.text ?? authError}</span>
        </div>}
        {authLoading ? <p className="text-center text-sm text-blue-200">Đang kiểm tra phiên đăng nhập…</p> : currentUser && mode !== 'changePassword' ? <div className="text-center space-y-4">
          <img src={currentUser.avatar} alt="" className="w-20 h-20 rounded-full mx-auto border-2 border-[#fabb15]" />
          <div><h4 className="text-xl font-bold">{currentUser.name}</h4><p className="text-xs text-blue-200">{currentUser.email}</p><p className="text-xs mt-2">Vai trò: {currentUser.role}</p></div>
          <button onClick={() => { setMode('changePassword'); setStatus(null); }} className="w-full py-2.5 bg-white/10 rounded-xl text-xs font-bold flex justify-center gap-2"><KeyRound className="w-4 h-4" />Đổi mật khẩu</button>
          <button onClick={async () => { await logout(); setIsAuthModalOpen(false); }} className="w-full py-2.5 bg-red-600 rounded-xl text-xs font-bold">Đăng xuất</button>
        </div> : mode === 'forgot' ? <form onSubmit={handleForgot} className="space-y-4">
          <p className="text-xs text-blue-200">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
          <div className="relative"><Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></div>
          <button disabled={loading || Date.now() < resetCooldownUntil} className="w-full py-3 bg-[#fabb15] disabled:opacity-50 text-[#001848] font-bold rounded-xl">{loading ? 'Đang gửi…' : 'Gửi email khôi phục'}</button>
          <button type="button" onClick={() => setMode('login')} className="w-full text-xs text-blue-300">← Quay lại đăng nhập</button>
        </form> : mode === 'changePassword' ? <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordInput('Mật khẩu hiện tại', currentPassword, setCurrentPassword)}
          {passwordInput('Mật khẩu mới', newPassword, setNewPassword)}
          {passwordInput('Xác nhận mật khẩu mới', confirmPassword, setConfirmPassword)}
          <button disabled={loading} className="w-full py-3 bg-[#fabb15] text-[#001848] font-bold rounded-xl">{loading ? 'Đang cập nhật…' : 'Đổi mật khẩu'}</button>
          <button type="button" onClick={() => setMode('login')} className="w-full text-xs text-blue-300">← Quay lại tài khoản</button>
        </form> : <div className="space-y-4">
          <div className="flex p-1 bg-black/30 rounded-xl"><button onClick={() => setMode('login')} className={`flex-1 py-2 text-xs rounded-lg ${mode === 'login' ? 'bg-[#fabb15] text-[#001848]' : ''}`}>Đăng nhập</button><button onClick={() => setMode('register')} className={`flex-1 py-2 text-xs rounded-lg ${mode === 'register' ? 'bg-[#fabb15] text-[#001848]' : ''}`}>Đăng ký</button></div>
          <form onSubmit={handleAuth} className="space-y-3.5">
            {mode === 'register' && <div className="relative"><UserPlus className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Họ và tên" className={inputClass} /></div>}
            <div className="relative"><Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={inputClass} /></div>
            {passwordInput('Mật khẩu', password, setPassword)}
            <button disabled={loading} className="w-full py-3 bg-[#fabb15] text-[#001848] font-bold rounded-xl">{loading ? 'Đang xử lý…' : mode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
          </form>
          {mode === 'login' && <button onClick={() => setMode('forgot')} className="w-full text-xs text-[#fabb15]">Quên mật khẩu?</button>}
        </div>}
      </div>
    </div>
  </div>;
};
