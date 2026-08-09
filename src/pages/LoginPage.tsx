import React from 'react';
import { LoginForm } from '@/components/Auth/LoginForm';
import logo from '@/assets/logo.png';

/**
 * Shared auth shell: deep-navy gradient background with a subtle radial glow,
 * centered glass card. Used by Login / Register / Forgot / Change password pages.
 */
export const AuthShell: React.FC<{ children: React.ReactNode; tagline: string }> = ({
  children,
  tagline,
}) => (
  <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-700 to-primary-500 py-12 px-4 overflow-hidden">
    {/* Radial glow accents */}
    <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
    {/* Subtle grid texture */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />

    <div className="relative w-full max-w-md animate-slide-up">
      {/* Brand */}
      <div className="text-center mb-8">
        <img
          src={logo}
          alt="English Bridge"
          className="inline-block w-16 h-16 rounded-2xl object-contain shadow-lg shadow-indigo-900/50 mb-4"
        />
        <h1 className="text-3xl font-bold text-white tracking-tight">English Bridge</h1>
        <p className="text-slate-300/80 mt-1 text-sm">{tagline}</p>
      </div>

      {/* Glass card */}
      <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl shadow-black/40">
        {children}
      </div>
    </div>
  </div>
);

export const LoginPage: React.FC = () => {
  return (
    <AuthShell tagline="Welcome back — log in to keep learning">
      <LoginForm />
    </AuthShell>
  );
};
