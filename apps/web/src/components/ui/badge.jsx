'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const badgeVariants = {
  default: 'bg-royal-50 dark:bg-royal-950/60 text-royal-700 dark:text-royal-300 border-royal-200/80 dark:border-royal-800',
  navy: 'bg-navy-50 dark:bg-navy-900/60 text-navy-800 dark:text-slate-200 border-navy-200/80 dark:border-navy-700',
  turquoise: 'bg-turquoise-50 dark:bg-turquoise-950/60 text-turquoise-700 dark:text-turquoise-300 border-turquoise-200/80 dark:border-turquoise-800',
  success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800',
  warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800',
  destructive: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800',
  outline: 'bg-transparent text-navy-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
};

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const dotColors = {
    default: 'bg-royal-600',
    navy: 'bg-navy-700',
    turquoise: 'bg-turquoise-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    destructive: 'bg-rose-600',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border tracking-wide select-none',
        badgeVariants[variant] || badgeVariants.default,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0 animate-pulse',
            dotColors[variant] || dotColors.default,
          )}
        />
      )}
      {children}
    </span>
  );
}
