import api from './api';

/**
 * Centralized auth API client. Every auth form talks to the backend through here
 * instead of inlining fetch(), so the logic stays in one place.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface ApiError {
  success: false;
  error: string;
  [k: string]: unknown;
}

async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Attach the JWT from localStorage so authenticated endpoints
  // (e.g. /auth/change-password) don't get rejected as "no token provided".
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const raw: unknown = await res.json();
  const data = raw as Record<string, unknown> | null;

  if (!res.ok || data?.success === false) {
    const err = new Error((data?.error as string) || 'Request failed') as Error & ApiError;
    Object.assign(err, data || {});
    throw err;
  }
  return data as unknown as T;
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  success: true;
  token: string;
  user: AuthUser;
}
export interface InitiateRegisterResponse {
  success: true;
  pendingToken: string;
  email: string;
  devMode?: boolean;
  devCode?: string;
  fallback?: boolean;
  fallbackCode?: string;
}
export interface VerifyOtpResponse {
  success: true;
  token: string;
  user: AuthUser;
}
export interface SimpleResponse {
  success: true;
  message: string;
}
export interface ResetTokenResponse extends SimpleResponse {
  resetToken: string;
}

// ── Calls ────────────────────────────────────────────────────────────────────
export const authService = {
  /** Accepts username OR email. */
  login: (username: string, password: string) =>
    call<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  registerInitiate: (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) =>
    call<InitiateRegisterResponse>('/auth/register/initiate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  registerVerifyOtp: (pendingToken: string, otp: string) =>
    call<VerifyOtpResponse>('/auth/register/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ pendingToken, otp }),
    }),

  registerResendOtp: (pendingToken: string) =>
    call<InitiateRegisterResponse>('/auth/register/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ pendingToken }),
    }),

  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) =>
    call<SimpleResponse>(
      '/auth/change-password',
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      }
    ),

  forgotPassword: (email: string) =>
    call<SimpleResponse & { devMode?: boolean; devCode?: string; fallback?: boolean; fallbackCode?: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    ),

  verifyResetOtp: (email: string, otp: string) =>
    call<ResetTokenResponse>('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (resetToken: string, newPassword: string, confirmNewPassword: string) =>
    call<SimpleResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword, confirmNewPassword }),
    }),

  /**
   * Fetch the full user profile for a token. Used after the Google OAuth
   * redirect hands us a token via query string (the JWT only carries the
   * userId/username/email, not firstName/lastName).
   */
  fetchProfileFromToken: async (token: string): Promise<AuthUser> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed to fetch profile');
    }
    return data.user as AuthUser;
  },
};

export default api;
