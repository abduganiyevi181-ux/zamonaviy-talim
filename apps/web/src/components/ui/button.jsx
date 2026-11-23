'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = {
  variant: {
    primary:
      'bg-royal-600 text-white hover:bg-royal-700 shadow-sm border border-transparent focus-visible:ring-royal-500 active:scale-[0.98]',
    navy:
      'bg-navy-900 dark:bg-royal-600 text-white hover:bg-navy-800 dark:hover:bg-royal-700 shadow-sm border border-navy-800 dark:border-royal-500 focus-visible:ring-navy-600',
    secondary:
      'bg-white dark:bg-royal-600 dark:hover:bg-royal-700 dark:text-white dark:border-royal-500 text-navy-900 border border-slate-200 hover:bg-slate-50 shadow-card-subtle focus-visible:ring-royal-400',
    outline:
      'border-2 border-royal-600 dark:border-royal-400 text-royal-700 dark:text-royal-300 bg-transparent hover:bg-royal-50 dark:hover:bg-royal-950/60 focus-visible:ring-royal-500',
    ghost:
      'text-navy-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-navy-900 dark:hover:text-white focus-visible:ring-slate-400',
    turquoise:
      'bg-turquoise-600 text-white hover:bg-turquoise-700 shadow-sm focus-visible:ring-turquoise-500',
    destructive:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus-visible:ring-rose-500',
  },
  size: {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5 font-medium',
    md: 'h-10 px-4 text-sm rounded-xl gap-2 font-medium',
    lg: 'h-12 px-6 text-base rounded-xl gap-2.5 font-semibold',
    icon: 'h-10 w-10 p-0 rounded-xl justify-center items-center',
  },
};

export const Button = React.forwardRef(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      whileHover={isDisabled ? {} : { scale: 1.015 }}
      whileTap={isDisabled ? {} : { scale: 0.985 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'relative inline-flex items-center justify-center font-sans tracking-tight transition-colors outline-none cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        buttonVariants.variant[variant] || buttonVariants.variant.primary,
        buttonVariants.size[size] || buttonVariants.size.md,
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
