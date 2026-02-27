import clsx from 'clsx';
import type { AppraisalStatus } from '@/types/index';

interface StatusBadgeProps {
  status: AppraisalStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  AppraisalStatus,
  { label: string; classes: string }
> = {
  draft: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-700',
  },
  submitted: {
    label: 'Submitted',
    classes: 'bg-blue-100 text-blue-700',
  },
  tech_lead_review: {
    label: 'Tech Lead Review',
    classes: 'bg-purple-100 text-purple-700',
  },
  manager_review: {
    label: 'Manager Review',
    classes: 'bg-amber-100 text-amber-700',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-green-100 text-green-700',
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
