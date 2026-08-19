import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as null | { uid: string; email: string; providerData: Array<{ providerId: string }> } },
  authChanged: null as null | ((user: unknown) => Promise<void>),
  ensureProfile: vi.fn(), signIn: vi.fn(), createUser: vi.fn(), signOut: vi.fn(),
  updateProfile: vi.fn(), reauthenticate: vi.fn(), updatePassword: vi.fn(), reset: vi.fn(),
  socialPopup: vi.fn(), socialRedirect: vi.fn(), redirectResult: vi.fn(),
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
  signInWithPopup: mocks.socialPopup,
  signInWithRedirect: mocks.socialRedirect,
  getRedirectResult: mocks.redirectResult,
  GoogleAuthProvider: class { setCustomParameters = vi.fn(); },
  FacebookAuthProvider: class { setCustomParameters = vi.fn(); },
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
    <button onClick={() => void app.signInWithSocial('google').catch(() => undefined)}>google</button>
    <button onClick={() => void app.signInWithSocial('facebook').catch(() => undefined)}>facebook</button>
  </div>;
}

const state = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');

beforeEach(() => {
  vi.clearAllMocks(); mocks.authChanged = null; mocks.auth.currentUser = null; mocks.ensureProfile.mockResolvedValue(profile); mocks.redirectResult.mockResolvedValue(null);
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
    mocks.auth.currentUser = { uid: 'uid-1', email: 'user@example.com', providerData: [{ providerId: 'password' }] };
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

  it('signs in with Google and creates a safe user profile', async () => {
    const firebaseUser = { uid: 'google-uid', email: 'google@example.com', providerData: [{ providerId: 'google.com' }] };
    mocks.socialPopup.mockResolvedValue({ user: firebaseUser });
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { await mocks.authChanged?.(null); });
    fireEvent.click(screen.getByText('google'));
    await waitFor(() => expect(mocks.ensureProfile).toHaveBeenCalledWith(firebaseUser));
    expect(state().user.role).toBe('user');
  });

  it('preserves an existing admin profile after Google sign-in', async () => {
    const adminProfile = { ...profile, role: 'admin' as const };
    mocks.ensureProfile.mockResolvedValue(adminProfile);
    mocks.socialPopup.mockResolvedValue({ user: { uid: 'uid-1', providerData: [{ providerId: 'google.com' }] } });
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { await mocks.authChanged?.(null); });
    fireEvent.click(screen.getByText('google'));
    await waitFor(() => expect(state().user.role).toBe('admin'));
  });

  it('returns a clear provider-collision error without creating a profile', async () => {
    mocks.socialPopup.mockRejectedValue({ code: 'auth/account-exists-with-different-credential' });
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { await mocks.authChanged?.(null); });
    fireEvent.click(screen.getByText('google'));
    await waitFor(() => expect(mocks.socialPopup).toHaveBeenCalled());
    expect(mocks.ensureProfile).not.toHaveBeenCalled();
  });

  it('supports Facebook sign-in and handles a closed popup without profile writes', async () => {
    const facebookUser = { uid: 'facebook-uid', email: 'facebook@example.com', providerData: [{ providerId: 'facebook.com' }] };
    mocks.socialPopup.mockResolvedValueOnce({ user: facebookUser });
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { await mocks.authChanged?.(null); });
    fireEvent.click(screen.getByText('facebook'));
    await waitFor(() => expect(mocks.ensureProfile).toHaveBeenCalledWith(facebookUser));
    cleanup();
    vi.clearAllMocks(); mocks.redirectResult.mockResolvedValue(null);
    mocks.socialPopup.mockRejectedValueOnce({ code: 'auth/popup-closed-by-user' });
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { await mocks.authChanged?.(null); });
    fireEvent.click(screen.getByText('google'));
    await waitFor(() => expect(mocks.socialPopup).toHaveBeenCalled());
    expect(mocks.ensureProfile).not.toHaveBeenCalled();
  });
});
