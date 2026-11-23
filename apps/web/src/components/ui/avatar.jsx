'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  status,
  className,
}) {
  const [hasError, setHasError] = React.useState(!src);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-400',
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          'relative flex items-center justify-center font-semibold rounded-full overflow-hidden border border-slate-200 bg-navy-100 text-navy-800 select-none',
          sizes[size] || sizes.md,
          className,
        )}
      >
        {!hasError && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white',
            statusSizes[size] || statusSizes.md,
            statusColors[status] || statusColors.offline,
          )}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ children, className, max = 4 }) {
  const childrenArray = React.Children.toArray(children);
  const visible = childrenArray.slice(0, max);
  const remaining = childrenArray.length - max;

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {visible.map((child, idx) => (
        <div key={idx} className="ring-2 ring-white rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-navy-800 text-xs font-semibold ring-2 ring-white select-none">
          +{remaining}
        </div>
      )}
    </div>
  );
}
