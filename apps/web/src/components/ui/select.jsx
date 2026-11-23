'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = React.forwardRef(function Select(
  {
    className,
    label,
    error,
    hint,
    id,
    placeholder = 'Tanlang...',
    options = [],
    children,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const selectId = id || generatedId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-bold uppercase tracking-wider text-navy-950"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            'w-full h-11 pl-3.5 pr-10 py-2 text-sm text-navy-950 bg-white border rounded-xl appearance-none cursor-pointer',
            'transition-all duration-150 outline-none',
            'border-slate-300 shadow-card-subtle',
            'focus:border-royal-600 focus:ring-2 focus:ring-royal-100',
            error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-100',
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3.5 pointer-events-none text-slate-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600 mt-0.5">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-600 font-medium mt-0.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
