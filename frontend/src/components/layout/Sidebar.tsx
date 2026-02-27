import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@context/AuthContext';
import type { UserRole } from '@/types/index';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: HomeIcon,
  },
  {
    label: 'Appraisals',
    to: '/appraisals',
    icon: ClipboardDocumentListIcon,
  },
  {
    label: 'Team',
    to: '/team',
    icon: UserGroupIcon,
    roles: ['manager', 'tech_lead'],
  },
  {
    label: 'Analytics',
    to: '/analytics',
    icon: ChartBarIcon,
    roles: ['admin', 'manager', 'tech_lead'],
  },
  {
    label: 'Users',
    to: '/users',
    icon: UsersIcon,
    roles: ['admin'],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600">
          <ChartBarIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">Talent Metric</p>
          <p className="text-xs text-slate-500 leading-tight">Appraisal System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  )}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize truncate">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
