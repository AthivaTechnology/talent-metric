import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import api, { getErrorMessage } from '@services/api';
import LoadingSpinner from '@components/common/LoadingSpinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Something went wrong. Please try again.'));
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

        {sent ? (
          <div className="card">
            <div className="card-body text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
              <p className="text-sm text-slate-500">
                If an account exists for <strong>{email}</strong>, a password reset link has been sent. It expires in 1 hour.
              </p>
              <Link to="/login" className="btn-secondary w-full mt-2 inline-block text-center">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Forgot your password?</h2>
              <p className="text-slate-500 mt-2">Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={isLoading} className="btn-primary w-full h-11 text-base">
                {isLoading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
