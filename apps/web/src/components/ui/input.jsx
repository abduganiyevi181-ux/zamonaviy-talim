'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(function Input(
  {
    className,
    type = 'text',
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    id,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-navy-950 dark:text-slate-200"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            'w-full h-11 px-3.5 py-2 text-sm text-navy-950 dark:text-white bg-white dark:bg-[#070E22] border rounded-xl',
            'placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all duration-150 outline-none',
            'border-slate-300 dark:border-slate-700 shadow-card-subtle',
            'focus:border-royal-600 dark:focus:border-royal-400 focus:ring-2 focus:ring-royal-100 dark:focus:ring-royal-950',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-100',
            disabled && 'bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-800',
            className,
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-slate-500 dark:text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
