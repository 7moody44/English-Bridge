import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { AuthShell } from './LoginPage';
import { Lock, ArrowRight } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition';

  return (
    <AuthShell tagline="Update your account security">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
          {error}
        </div>
      )}

      {success ? (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 border border-green-400/30">
            <Lock className="w-8 h-8 text-green-300" />
          </div>
          <h2 className="text-xl font-bold text-white">Password Updated!</h2>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-purple-600 transition-all"
          >
            Back to profile <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-400 mt-1">Min 6 chars with a letter and a number.</p>
          </div>
          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmNewPassword}
            className="w-full bg-gradient-to-r from-indigo-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
};
