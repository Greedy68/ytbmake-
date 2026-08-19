import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as null | { uid: string; email: string } },
  authChanged: null as null | ((user: unknown) => Promise<void>),
  ensureProfile: vi.fn(), signIn: vi.fn(), createUser: vi.fn(), signOut: vi.fn(),
  updateProfile: vi.fn(), reauthenticate: vi.fn(), updatePassword: vi.fn(), reset: vi.fn(),
}));

vi.mock('../src/config/firebase', () => ({ auth: mocks.auth }));
vi.mock('firebase/auth', () => ({
  EmailAuthProvider: { credential: vi.fn(() => 'credential') },
  onAuthStateChanged: vi.fn((_auth, callback) => { mocks.authChanged = callback; return vi.fn(); }),
  signInWithEmailAndPassword: mocks.signIn,
  createUserWithEmailAndPassword: mocks.createUser,
  signOut: mocks.signOut,
  updateProfile: mocks.updateProfile,
  reauthenticateWithCredential: mocks.reauthenticate,
  updatePassword: mocks.updatePassword,
  sendPasswordResetEmail: mocks.reset,
}));
vi.mock('../src/services/firestore', () => ({
  ensureUserProfile: mocks.ensureProfile,
  listPublishedMedia: vi.fn(async () => []), listAdminMedia: vi.fn(async () => []), listUsers: vi.fn(async () => []),
  updateUserAccess: vi.fn(), createMedia: vi.fn(), updateMedia: vi.fn(), removeMedia: vi.fn(),
}));

import { AppProvider, useApp } from '../src/context/AppContext';

const profile = { id: 'uid-1', name: 'YMM User', email: 'user@example.com', role: 'user' as const, status: 'active' as const, avatar: '', purchasedLessonIds: [] };

function Probe() {
  const app = useApp();
  return <div>
    <output data-testid="state">{JSON.stringify({ loading: app.authLoading, user: app.currentUser, error: app.authError })}</output>
    <button onClick={() => void app.register('YMM User', 'user@example.com', 'password123')}>register</button>
    <button onClick={() => void app.login('user@example.com', 'password123')}>login</button>
    <button onClick={() => void app.logout()}>logout</button>
    <button onClick={() => void app.changePassword('password123', 'newpassword123')}>change</button>
    <button onClick={() => void app.requestPasswordReset('user@example.com')}>reset</button>
  </div>;
}

const state = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');

beforeEach(() => {
  vi.clearAllMocks(); mocks.authChanged = null; mocks.auth.currentUser = null; mocks.ensureProfile.mockResolvedValue(profile);
});
afterEach(cleanup);

describe('AppProvider authentication lifecycle', () => {
  it('waits for Firebase initialization then represents a signed-out user', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    expect(state().loading).toBe(true);
    await act(async () => { await mocks.authChanged?.(null); });
    expect(state()).toMatchObject({ loading: false, user: null });
  });

  it('restores a Firebase session and loads the Firestore role', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { await mocks.authChanged?.({ uid: 'uid-1', email: 'user@example.com' }); });
    expect(mocks.ensureProfile).toHaveBeenCalled();
    expect(state().user).toMatchObject({ id: 'uid-1', role: 'user' });
  });

  it('handles a missing profile through safe user-profile creation and reports backend failure', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    mocks.ensureProfile.mockRejectedValueOnce(new Error('network'));
    await act(async () => { await mocks.authChanged?.({ uid: 'uid-1' }); });
    expect(state()).toMatchObject({ loading: false, user: null, error: 'Không thể tải hồ sơ tài khoản.' });
  });

  it('registers with Firebase and receives a user role from Firestore', async () => {
    mocks.createUser.mockResolvedValue({ user: { uid: 'uid-1', email: 'user@example.com' } });
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { await mocks.authChanged?.(null); });
    fireEvent.click(screen.getByText('register'));
    await waitFor(() => expect(mocks.ensureProfile).toHaveBeenCalled());
    expect(state().user.role).toBe('user');
  });

  it('logs in, logs out, changes password with reauthentication, and requests reset', async () => {
    mocks.auth.currentUser = { uid: 'uid-1', email: 'user@example.com' };
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { await mocks.authChanged?.({ uid: 'uid-1', email: 'user@example.com' }); });
    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(mocks.signIn).toHaveBeenCalled());
    fireEvent.click(screen.getByText('change'));
    await waitFor(() => expect(mocks.reauthenticate).toHaveBeenCalled());
    expect(mocks.updatePassword).toHaveBeenCalledWith(mocks.auth.currentUser, 'newpassword123');
    fireEvent.click(screen.getByText('reset'));
    await waitFor(() => expect(mocks.reset).toHaveBeenCalled());
    fireEvent.click(screen.getByText('logout'));
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalled());
    expect(state().user).toBeNull();
  });
});
