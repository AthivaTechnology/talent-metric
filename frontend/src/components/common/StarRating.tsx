import { useState } from 'react';
import clsx from 'clsx';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const displayed = hovered || value;

  return (
    <div className={clsx('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={clsx(
            'transition-transform duration-100',
            !readonly && 'cursor-pointer hover:scale-110 focus:outline-none',
            readonly && 'cursor-default'
          )}
        >
          <svg
            className={clsx(
              sizeClasses[size],
              star <= displayed
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 fill-slate-300'
            )}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {!readonly && (
        <span className="ml-2 text-sm text-slate-500">
          {displayed > 0 ? `${displayed}/5` : ''}
        </span>
      )}
    </div>
  );
}
