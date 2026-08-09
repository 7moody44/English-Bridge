import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { AuthShell } from './LoginPage';
import { Mail, ShieldCheck, KeyRound, ArrowRight, ArrowLeft, ShieldQuestion } from 'lucide-react';

type Stage = 'email' | 'otp' | 'reset' | 'done';

export const ForgotPasswordPage: React.FC = () => {
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Stage 1: submit email ────────────────────────────────────────────────
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setDevCode(null);
    setIsLoading(true);
    try {
      const data = await authService.forgotPassword(email);
      // Backend returns a generic message regardless of whether the email exists.
      setInfo('If an account exists for that email, a code is on its way.');
      if (data.devMode && data.devCode) setDevCode(data.devCode);
      setStage('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stage 2: verify OTP ──────────────────────────────────────────────────
  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await authService.verifyResetOtp(email, otp);
      setResetToken(data.resetToken);
      setStage('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stage 3: set new password ────────────────────────────────────────────
  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must be at least 6 characters with a letter and a number');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword, confirmNewPassword);
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition';

  const Banner = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) => (
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 mb-3">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-slate-300/80 text-sm mt-1">{sub}</p>
    </div>
  );

  return (
    <AuthShell tagline="Reset your password">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
          {error}
        </div>
      )}
      {info && !error && (stage === 'otp' || stage === 'email') && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-100 text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
          {info}
          {devCode && (
            <div className="mt-2 font-mono text-lg tracking-[0.3em] text-white">{devCode}</div>
          )}
        </div>
      )}

      {/* ── EMAIL ─────────────────────────────────────────────────────── */}
      {stage === 'email' && (
        <form onSubmit={submitEmail} className="space-y-5">
          <Banner
            icon={<ShieldQuestion className="w-6 h-6 text-indigo-300" />}
            title="Forgot your password?"
            sub="Enter your email and we'll send a verification code."
          />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Sending...' : 'Send Code'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </form>
      )}

      {/* ── OTP ───────────────────────────────────────────────────────── */}
      {stage === 'otp' && (
        <form onSubmit={submitOtp} className="space-y-5">
          <Banner
            icon={<Mail className="w-6 h-6 text-indigo-300" />}
            title="Check your inbox"
            sub={`We sent a 6-digit code to ${email}.`}
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-3xl tracking-[0.5em] font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
            placeholder="••••••"
          />
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={() => setStage('email')}
            className="w-full text-center text-sm text-slate-300 hover:text-white transition"
          >
            Use a different email
          </button>
        </form>
      )}

      {/* ── NEW PASSWORD ──────────────────────────────────────────────── */}
      {stage === 'reset' && (
        <form onSubmit={submitReset} className="space-y-5">
          <Banner
            icon={<KeyRound className="w-6 h-6 text-indigo-300" />}
            title="Set a new password"
            sub="Choose something memorable but secure."
          />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                className={inputClass + ' pr-11'}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Min 6 chars with a letter and a number.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmNewPassword}
            className="w-full bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {/* ── DONE ──────────────────────────────────────────────────────── */}
      {stage === 'done' && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 border border-green-400/30">
            <ShieldCheck className="w-8 h-8 text-green-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Password reset</h2>
            <p className="text-slate-300/80 text-sm mt-1">
              You can now log in with your new password.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-purple-600 transition-all"
          >
            Back to login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </AuthShell>
  );
};

export default ForgotPasswordPage;
