import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  tech_lead: 'bg-blue-100 text-blue-700',
  developer: 'bg-green-100 text-green-700',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const roleLabel = user?.role.replace('_', ' ') ?? '';
  const roleColor = ROLE_COLORS[user?.role ?? ''] ?? 'bg-slate-100 text-slate-700';

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Left: hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <h1 className="hidden md:block text-base font-semibold text-slate-800">
          Talent Metric
        </h1>
      </div>

      {/* Right: notification + user menu */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative">
          <BellIcon className="w-5 h-5" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-tight">{user?.name}</p>
              <span
                className={clsx(
                  'inline-block text-xs font-medium px-1.5 py-0.5 rounded-md capitalize',
                  roleColor
                )}
              >
                {roleLabel}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <UserCircleIcon className="w-4 h-4 text-slate-400" />
                My Profile
              </Link>
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <KeyIcon className="w-4 h-4 text-slate-400" />
                Change Password
              </Link>
              <hr className="my-1 border-slate-100" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
