import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PasswordField } from '../src/components/auth/PasswordField';

afterEach(cleanup);

describe('PasswordField', () => {
  it('toggles visibility independently without submitting or losing its value', () => {
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(<form onSubmit={submit}><PasswordField label="Mật khẩu" value="secret123" onChange={() => undefined} autoComplete="current-password" /></form>);
    const input = screen.getByLabelText('Mật khẩu');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('secret123');
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
