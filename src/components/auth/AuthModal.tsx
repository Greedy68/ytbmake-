import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, LogIn, Mail, UserPlus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PasswordField } from './PasswordField';

type Mode = 'login' | 'register' | 'forgot' | 'changePassword';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const facebookEnabled = import.meta.env.VITE_ENABLE_FACEBOOK_AUTH === 'true';
const googleEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen, setIsAuthModalOpen, currentUser, authLoading, authError, hasPasswordProvider,
    login, register, signInWithSocial, logout, changePassword, requestPasswordReset,
  } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerConfirmTouched, setRegisterConfirmTouched] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [confirmNewTouched, setConfirmNewTouched] = useState(false);
  const [passwordFieldsKey, setPasswordFieldsKey] = useState(0);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetCooldownUntil, setResetCooldownUntil] = useState(0);

  if (!isAuthModalOpen) return null;
  const fail = (text: string) => setStatus({ type: 'error', text });
  const registrationMismatch = registerConfirmTouched && password !== registerConfirm ? 'Mật khẩu xác nhận không khớp.' : undefined;
  const changeMismatch = confirmNewTouched && newPassword !== confirmNewPassword ? 'Mật khẩu xác nhận không khớp.' : undefined;

  const validCredentials = () => {
    if (!EMAIL_PATTERN.test(email.trim())) return fail('Vui lòng nhập địa chỉ email hợp lệ.'), false;
    if (password.length < 6) return fail('Mật khẩu phải có ít nhất 6 ký tự.'), false;
    if (mode === 'register' && (name.trim().length < 2 || name.trim().length > 100)) return fail('Họ tên phải có từ 2 đến 100 ký tự.'), false;
    if (mode === 'register' && (!registerConfirm || password !== registerConfirm)) {
      setRegisterConfirmTouched(true); return false;
    }
    return true;
  };

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validCredentials()) return;
    setLoading(true); setStatus(null);
    try {
      if (mode === 'register') await register(name, email, password); else await login(email, password);
      setStatus({ type: 'success', text: mode === 'register' ? 'Đăng ký thành công.' : 'Đăng nhập thành công.' });
    } catch (error) { fail(error instanceof Error ? error.message : 'Không thể xác thực.'); }
    finally { setLoading(false); }
  };

  const handleSocial = async (provider: 'google' | 'facebook') => {
    setLoading(true); setStatus(null);
    try { await signInWithSocial(provider); }
    catch (error) { fail(error instanceof Error ? error.message : 'Không thể đăng nhập với nhà cung cấp này.'); }
    finally { setLoading(false); }
  };

  const handleForgot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) return fail('Vui lòng nhập địa chỉ email hợp lệ.');
    if (Date.now() < resetCooldownUntil) return;
    setLoading(true); setStatus(null);
    try { await requestPasswordReset(email); } catch { /* neutral response prevents enumeration */ }
    finally {
      setResetCooldownUntil(Date.now() + 30_000);
      setStatus({ type: 'success', text: 'Nếu email hợp lệ, hướng dẫn đặt lại mật khẩu sẽ được gửi trong ít phút.' });
      setLoading(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hasPasswordProvider) return;
    if (!currentPassword) return fail('Vui lòng nhập mật khẩu hiện tại.');
    if (newPassword.length < 8) return fail('Mật khẩu mới phải có ít nhất 8 ký tự.');
    if (!confirmNewPassword || newPassword !== confirmNewPassword) { setConfirmNewTouched(true); return; }
    if (newPassword === currentPassword) return fail('Mật khẩu mới phải khác mật khẩu hiện tại.');
    setLoading(true); setStatus(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setConfirmNewTouched(false);
      setPasswordFieldsKey((key) => key + 1);
      setStatus({ type: 'success', text: 'Đổi mật khẩu thành công.' });
    } catch (error) { fail(error instanceof Error ? error.message : 'Không thể đổi mật khẩu.'); }
    finally { setLoading(false); }
  };

  const inputClass = 'w-full pl-9 pr-3 py-2 bg-black/20 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fabb15]';
  const SocialButtons = () => <div className="space-y-2">
    <button type="button" disabled={loading || !googleEnabled} onClick={() => void handleSocial('google')} className="w-full py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold disabled:opacity-50">
      {mode === 'register' ? 'Đăng ký với Google' : 'Tiếp tục với Google'}
    </button>
    {facebookEnabled && <button type="button" disabled={loading} onClick={() => void handleSocial('facebook')} className="w-full py-2.5 bg-[#1877F2] text-white rounded-xl text-sm font-bold">{mode === 'register' ? 'Đăng ký với Facebook' : 'Tiếp tục với Facebook'}</button>}
    {!googleEnabled && <p className="text-[11px] text-blue-200 text-center">Google đăng nhập sẽ khả dụng sau khi provider được bật.</p>}
  </div>;

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"><div className="relative w-full max-w-md bg-[#00225c] border border-blue-400/30 rounded-2xl shadow-2xl overflow-hidden text-white">
    <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5"><h3 className="text-lg font-bold flex items-center gap-2"><LogIn className="w-5 h-5 text-[#fabb15]" />{currentUser && mode !== 'changePassword' ? 'Tài khoản của bạn' : mode === 'register' ? 'Đăng ký' : mode === 'forgot' ? 'Quên mật khẩu' : mode === 'changePassword' ? 'Đổi mật khẩu' : 'Đăng nhập'}</h3><button type="button" onClick={() => setIsAuthModalOpen(false)} aria-label="Đóng"><X className="w-5 h-5" /></button></div>
    <div className="p-6 space-y-5">
      {(status || authError) && <div className={`p-3 rounded-xl text-xs flex gap-2 ${status?.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{status?.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}<span>{status?.text ?? authError}</span></div>}
      {authLoading ? <p className="text-center text-sm text-blue-200">Đang kiểm tra phiên đăng nhập…</p> : currentUser && mode !== 'changePassword' ? <div className="text-center space-y-4"><img src={currentUser.avatar} alt="" className="w-20 h-20 rounded-full mx-auto border-2 border-[#fabb15]" /><div><h4 className="text-xl font-bold">{currentUser.name}</h4><p className="text-xs text-blue-200">{currentUser.email}</p><p className="text-xs mt-2">Vai trò: {currentUser.role}</p></div><button type="button" onClick={() => { setMode('changePassword'); setStatus(null); }} className="w-full py-2.5 bg-white/10 rounded-xl text-xs font-bold flex justify-center gap-2"><KeyRound className="w-4 h-4" />Đổi mật khẩu</button><button type="button" onClick={async () => { await logout(); setIsAuthModalOpen(false); }} className="w-full py-2.5 bg-red-600 rounded-xl text-xs font-bold">Đăng xuất</button></div>
      : mode === 'forgot' ? <form onSubmit={handleForgot} className="space-y-4"><p className="text-xs text-blue-200">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p><div className="relative"><Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></div><button disabled={loading || Date.now() < resetCooldownUntil} className="w-full py-3 bg-[#fabb15] disabled:opacity-50 text-[#001848] font-bold rounded-xl">{loading ? 'Đang gửi…' : 'Gửi email khôi phục'}</button><button type="button" onClick={() => setMode('login')} className="w-full text-xs text-blue-300">← Quay lại đăng nhập</button></form>
      : mode === 'changePassword' ? !hasPasswordProvider ? <div className="text-center space-y-4"><p className="text-sm text-blue-100">Tài khoản này đăng nhập bằng Google/Facebook và chưa có mật khẩu YMM.</p><p className="text-xs text-blue-300">Hãy quản lý mật khẩu tại nhà cung cấp đăng nhập của bạn.</p><button type="button" onClick={() => setMode('login')} className="text-xs text-[#fabb15]">← Quay lại tài khoản</button></div> : <form key={passwordFieldsKey} onSubmit={handleChangePassword} className="space-y-4"><PasswordField label="Mật khẩu hiện tại" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" /><PasswordField label="Mật khẩu mới" value={newPassword} onChange={(value) => { setNewPassword(value); if (confirmNewTouched && value === confirmNewPassword) setConfirmNewTouched(false); }} autoComplete="new-password" /><PasswordField label="Xác nhận mật khẩu mới" value={confirmNewPassword} onChange={(value) => { setConfirmNewPassword(value); if (value === newPassword) setConfirmNewTouched(false); }} onBlur={() => setConfirmNewTouched(true)} autoComplete="new-password" error={changeMismatch} /><button disabled={loading} className="w-full py-3 bg-[#fabb15] text-[#001848] font-bold rounded-xl">{loading ? 'Đang cập nhật…' : 'Đổi mật khẩu'}</button><button type="button" onClick={() => setMode('login')} className="w-full text-xs text-blue-300">← Quay lại tài khoản</button></form>
      : <div className="space-y-4"><div className="flex p-1 bg-black/30 rounded-xl"><button type="button" onClick={() => { setMode('login'); setStatus(null); }} className={`flex-1 py-2 text-xs rounded-lg ${mode === 'login' ? 'bg-[#fabb15] text-[#001848]' : ''}`}>Đăng nhập</button><button type="button" onClick={() => { setMode('register'); setStatus(null); }} className={`flex-1 py-2 text-xs rounded-lg ${mode === 'register' ? 'bg-[#fabb15] text-[#001848]' : ''}`}>Đăng ký</button></div><SocialButtons /><div className="flex items-center gap-3 text-[11px] text-blue-300"><span className="h-px flex-1 bg-white/10" />hoặc dùng email<span className="h-px flex-1 bg-white/10" /></div><form onSubmit={handleAuth} className="space-y-3.5">{mode === 'register' && <div className="relative"><UserPlus className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Họ và tên" className={inputClass} /></div>}<div className="relative"><Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={inputClass} /></div><PasswordField label="Mật khẩu" value={password} onChange={(value) => { setPassword(value); if (registerConfirmTouched && value === registerConfirm) setRegisterConfirmTouched(false); }} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />{mode === 'register' && <PasswordField label="Xác nhận mật khẩu" value={registerConfirm} onChange={(value) => { setRegisterConfirm(value); if (value === password) setRegisterConfirmTouched(false); }} onBlur={() => setRegisterConfirmTouched(true)} autoComplete="new-password" error={registrationMismatch} />}<button disabled={loading || (mode === 'register' && Boolean(registrationMismatch))} className="w-full py-3 bg-[#fabb15] disabled:opacity-50 text-[#001848] font-bold rounded-xl">{loading ? 'Đang xử lý…' : mode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}</button></form>{mode === 'login' && <button type="button" onClick={() => setMode('forgot')} className="w-full text-xs text-[#fabb15]">Quên mật khẩu?</button>}</div>}
    </div>
  </div></div>;
};
