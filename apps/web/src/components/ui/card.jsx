'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Card({
  className,
  variant = 'default',
  interactive = false,
  children,
  ...props
}) {
  const variants = {
    default: 'bg-white dark:bg-[#0B1536] border-slate-200/80 dark:border-navy-800 shadow-card-subtle text-navy-950 dark:text-slate-100',
    ivory: 'bg-ivory-100 dark:bg-[#0B1536] border-ivory-300 dark:border-navy-800 shadow-card-subtle text-navy-950 dark:text-slate-100',
    bordered: 'bg-white dark:bg-[#0B1536] border-slate-300 dark:border-navy-800 shadow-none text-navy-950 dark:text-slate-100',
    editorial: 'bg-white dark:bg-[#0B1536] border-slate-200/80 dark:border-navy-800 shadow-card-subtle relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-royal-600 before:rounded-t-2xl text-navy-950 dark:text-slate-100',
  };

  const Component = interactive ? motion.div : 'div';
  const interactiveProps = interactive
    ? {
        whileHover: { y: -3, transition: { duration: 0.2 } },
        className: cn(
          'rounded-2xl border transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
          variants[variant] || variants.default,
          className,
        ),
      }
    : {
        className: cn(
          'rounded-2xl border overflow-hidden',
          variants[variant] || variants.default,
          className,
        ),
      };

  return (
    <Component {...interactiveProps} {...props}>
      {children}
    </Component>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('p-6 pb-4 flex flex-col gap-1', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h3
      className={cn(
        'text-base font-semibold text-navy-900 dark:text-white tracking-tight',
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }) {
  return (
    <p className={cn('text-xs text-muted-500 dark:text-slate-400 leading-relaxed', className)}>
      {children}
    </p>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div
      className={cn(
        'p-6 pt-4 border-t border-slate-100 flex items-center justify-between',
        className,
      )}
    >
      {children}
    </div>
  );
}
