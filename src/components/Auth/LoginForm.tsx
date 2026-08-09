import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { GoogleButton } from './GoogleButton';
import { Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authService.login(identifier, password);
      login(data.token, data.user);
      onSuccess?.();
      navigate('/home');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during login';
      // If unverified, route them to forgot-password-like resend? No — they should re-register.
      // For now just show the message.
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide uppercase">
            Username or Email
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300 tracking-wide uppercase">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-indigo-300 hover:text-indigo-200 transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-xl animate-fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !identifier || !password}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:shadow-indigo-700/50 hover:from-indigo-400 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          <LogIn className="w-4 h-4" />
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <GoogleButton enabled={Boolean(import.meta.env.VITE_GOOGLE_OAUTH_ENABLED)} />

      <p className="text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-indigo-300 hover:text-indigo-200 font-medium hover:underline transition"
        >
          Create one
        </button>
      </p>
    </div>
  );
};
