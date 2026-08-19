import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const app = vi.hoisted(() => ({
  isAuthModalOpen: true, setIsAuthModalOpen: vi.fn(), currentUser: null as null | Record<string, unknown>,
  authLoading: false, authError: null, hasPasswordProvider: true,
  login: vi.fn(), register: vi.fn(), signInWithSocial: vi.fn(), logout: vi.fn(),
  changePassword: vi.fn(), requestPasswordReset: vi.fn(),
}));
vi.mock('../src/context/AppContext', () => ({ useApp: () => app }));

import { AuthModal } from '../src/components/auth/AuthModal';

afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); app.currentUser = null; app.hasPasswordProvider = true; });

describe('AuthModal validation and provider-aware password UI', () => {
  it('blocks email registration when confirmation does not match', () => {
    render(<AuthModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
    fireEvent.change(screen.getByPlaceholderText('Họ và tên'), { target: { value: 'YMM User' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: 'different123' } });
    fireEvent.blur(screen.getByLabelText('Xác nhận mật khẩu'));
    expect(screen.getByText('Mật khẩu xác nhận không khớp.')).toBeInTheDocument();
    fireEvent.submit(screen.getByRole('button', { name: 'Tạo tài khoản' }).closest('form')!);
    expect(app.register).not.toHaveBeenCalled();
  });

  it('submits registration only when passwords match', () => {
    render(<AuthModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
    fireEvent.change(screen.getByPlaceholderText('Họ và tên'), { target: { value: 'YMM User' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
    expect(app.register).toHaveBeenCalledWith('YMM User', 'user@example.com', 'password123');
  });

  it('enables Google while keeping unconfigured Facebook hidden', () => {
    render(<AuthModal />);
    const google = screen.getByRole('button', { name: 'Tiếp tục với Google' });
    expect(google).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Tiếp tục với Facebook' })).not.toBeInTheDocument();
    fireEvent.click(google);
    expect(app.signInWithSocial).toHaveBeenCalledWith('google');
  });

  it('does not show a YMM password form for social-only users', () => {
    app.currentUser = { id: 'social', name: 'Social', email: 'social@example.com', role: 'user', avatar: '', status: 'active' };
    app.hasPasswordProvider = false;
    render(<AuthModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
    expect(screen.getByText('Tài khoản này đăng nhập bằng Google/Facebook và chưa có mật khẩu YMM.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Mật khẩu hiện tại')).not.toBeInTheDocument();
  });

  it('blocks password change before reauthentication when confirmation differs', () => {
    app.currentUser = { id: 'password', name: 'Password', email: 'user@example.com', role: 'user', avatar: '', status: 'active' };
    render(<AuthModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
    fireEvent.change(screen.getByLabelText('Mật khẩu hiện tại'), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByLabelText('Mật khẩu mới'), { target: { value: 'newpassword' } });
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu mới'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
    expect(app.changePassword).not.toHaveBeenCalled();
    expect(screen.getByText('Mật khẩu xác nhận không khớp.')).toBeInTheDocument();
  });
});
