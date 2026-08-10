import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { GoogleButton } from './GoogleButton';
import { Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

type Step = 'step1' | 'step2' | 'otp';

interface RegistrationFormProps {
  onSuccess?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<Step>('step1');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 2
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 3 (OTP)
  const [otp, setOtp] = useState('');

  // ── Step 1: names ────────────────────────────────────────────────────────
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first and last name');
      return;
    }
    setStep('step2');
  };

  // ── Step 2: account details → initiate + send OTP ────────────────────────
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setDevCode(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.registerInitiate({
        firstName,
        lastName,
        username,
        email,
        password,
        confirmPassword,
      });
      setPendingToken(data.pendingToken);
      if (data.devMode && data.devCode) setDevCode(data.devCode);
      setStep('otp');
      setInfo(`We sent a 6-digit code to ${data.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: verify OTP → complete registration ───────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await authService.registerVerifyOtp(pendingToken, otp.trim());
      register(data.token, data.user);
      onSuccess?.();
      navigate('/learn');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setDevCode(null);
    setIsLoading(true);
    try {
      const data = await authService.registerResendOtp(pendingToken);
      setPendingToken(data.pendingToken);
      if (data.devMode && data.devCode) setDevCode(data.devCode);
      setInfo('A new code was sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRuleHint =
    'Min 6 characters with at least one letter and one number';

  // ── Progress dots ─────────────────────────────────────────────────────────
  const Progress = () => (
    <div className="mb-6 flex items-center gap-2">
      {(['step1', 'step2', 'otp'] as Step[]).map((s, i) => {
        const activeIndex = ['step1', 'step2', 'otp'].indexOf(step);
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <React.Fragment key={s}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done
                  ? 'bg-indigo-500 text-white'
                  : active
                  ? 'bg-white text-primary-700 ring-2 ring-indigo-400'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {done ? '✓' : i + 1}
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 ${done ? 'bg-indigo-500' : 'bg-white/10'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="w-full">
      <Progress />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
          {error}
        </div>
      )}
      {info && !error && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-100 text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
          {info}
          {devCode && (
            <div className="mt-2 font-mono text-lg tracking-[0.3em] text-white">
              {devCode}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 1: Names ─────────────────────────────────────────────── */}
      {step === 'step1' && (
        <form onSubmit={handleStep1Submit} className="space-y-5">
          <h2 className="text-xl font-bold text-white">Tell us about you</h2>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
              placeholder="Jane"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
              placeholder="Doe"
            />
          </div>
          <button
            type="submit"
            disabled={!firstName.trim() || !lastName.trim()}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ── STEP 2: Account details ───────────────────────────────────── */}
      {step === 'step2' && (
        <form onSubmit={handleStep2Submit} className="space-y-5">
          <h2 className="text-xl font-bold text-white">Create your account</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
              placeholder="janedoe"
            />
            <p className="text-xs text-slate-400 mt-1">3–30 chars, lowercase letters/numbers/_/-</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">{passwordRuleHint}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('step1')}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 px-5 py-3 bg-white/5 border border-white/10 text-slate-200 rounded-xl hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !username || !email || !password || !confirmPassword}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Sending code...' : 'Continue'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 3: OTP ───────────────────────────────────────────────── */}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 mb-3">
              <ShieldCheck className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-xl font-bold text-white">Verify your email</h2>
            <p className="text-slate-300/80 text-sm mt-1">Enter the 6-digit code we sent you.</p>
          </div>

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
            {isLoading ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isLoading}
            className="w-full text-center text-sm text-indigo-300 hover:text-indigo-200 transition"
          >
            Didn't get it? Resend code
          </button>
        </form>
      )}

      {step !== 'otp' && (
        <>
          <div className="flex items-center gap-3 py-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <GoogleButton enabled={Boolean(import.meta.env.VITE_GOOGLE_OAUTH_ENABLED)} />
        </>
      )}

      <p className="text-center text-sm text-slate-400 mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-indigo-300 hover:text-indigo-200 font-medium hover:underline transition"
        >
          Log in
        </button>
      </p>
    </div>
  );
};
