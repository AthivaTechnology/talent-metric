import { useState, FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ChartBarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import api, { getErrorMessage } from '@services/api';
import LoadingSpinner from '@components/common/LoadingSpinner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="text-center space-y-3">
          <p className="text-slate-700 font-medium">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-indigo-600 hover:underline text-sm">Request a new one</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } });
    } catch (err) {
      setError(getErrorMessage(err, 'Reset link is invalid or has expired.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Talent Metric</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Set new password</h2>
          <p className="text-slate-500 mt-2">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="label">New password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="input pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="label">Confirm password</label>
            <input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="input"
              disabled={isLoading}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={isLoading} className="btn-primary w-full h-11 text-base">
            {isLoading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
