'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef(function Textarea(
  {
    className,
    label,
    error,
    hint,
    id,
    rows = 4,
    maxLength,
    showCount = false,
    value,
    defaultValue,
    onChange,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const textareaId = id || generatedId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;

  const [currentVal, setCurrentVal] = React.useState(value || defaultValue || '');

  const handleChange = (e) => {
    setCurrentVal(e.target.value);
    if (onChange) onChange(e);
  };

  const length = typeof value === 'string' ? value.length : String(currentVal).length;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-bold uppercase tracking-wider text-navy-950"
          >
            {label}
          </label>
        )}
        {showCount && maxLength && (
          <span className="text-xs text-slate-500 font-medium font-mono">
            {length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'w-full px-3.5 py-2.5 text-sm text-navy-950 bg-white border rounded-xl',
          'placeholder:text-slate-500 transition-all duration-150 outline-none resize-y',
          'border-slate-300 shadow-card-subtle',
          'focus:border-royal-600 focus:ring-2 focus:ring-royal-100',
          error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-100',
          disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200',
          className,
        )}
        {...props}
      />

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

Textarea.displayName = 'Textarea';
