import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/authService';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@services/api';
import { ChartBarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@components/common/LoadingSpinner';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const token = searchParams.get('token') ?? '';
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
      return;
    }
    if (!token) {
      setTokenValid(false);
      setTokenError('No invite token found. Please use the link from your email.');
      return;
    }
    authService
      .verifyInvite(token)
      .then(({ name, email }) => {
        setUserName(name);
        setUserEmail(email);
        setTokenValid(true);
      })
      .catch((err) => {
        setTokenValid(false);
        setTokenError(getErrorMessage(err, 'Invite link is invalid or has expired. Please contact your admin.'));
      });
  }, [token, redirect, isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      const { token: jwtToken, user } = await authService.acceptInvite(token, password);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = redirect;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to set password. Please try again.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Talent Metric</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {tokenValid === null && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" label="Verifying invite link..." />
            </div>
          )}

          {tokenValid === false && (
            <div className="text-center py-4">
              <p className="text-red-600 font-medium mb-2">Invalid Invite Link</p>
              <p className="text-slate-500 text-sm">{tokenError}</p>
            </div>
          )}

          {tokenValid === true && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Welcome, {userName}!</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Set a password for <span className="font-medium text-slate-700">{userEmail}</span> to access your appraisal.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Minimum 6 characters"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Repeat your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !password || !confirmPassword}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? <LoadingSpinner size="sm" /> : 'Set Password & Start Appraisal'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
