import React, { useId, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoComplete: string;
  error?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ label, value, onChange, onBlur, autoComplete, error }) => {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  return <div>
    <label htmlFor={inputId} className="block text-xs font-semibold text-blue-200 mb-1">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      <input
        id={inputId} type={visible ? 'text' : 'password'} required autoComplete={autoComplete} value={value}
        onChange={(event) => onChange(event.target.value)} onBlur={onBlur}
        aria-invalid={Boolean(error)}
        className="w-full pl-9 pr-10 py-2 bg-black/20 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fabb15]"
      />
      <button
        type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setVisible((shown) => !shown)}
        className="absolute right-2 top-1.5 p-1 rounded text-gray-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fabb15]"
      >{visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
    </div>
    {error && <p role="alert" className="text-xs text-red-300 mt-1">{error}</p>}
  </div>;
};
