'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function OtpInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  error = false,
  disabled = false,
  autoFocus = true,
  className,
}) {
  const inputRefs = useRef([]);

  // Ensure inputRefs array length matches length
  inputRefs.current = inputRefs.current.slice(0, length);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanDigit = rawVal.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    const combined = newDigits.join('');

    if (onChange) {
      onChange(combined);
    }

    // Auto-focus next input if filled
    if (cleanDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (combined.length === length && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    if (onChange) {
      onChange(pasteData);
    }

    const focusIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasteData.length === length && onComplete) {
      onComplete(pasteData);
    }
  };

  return (
    <div
      className={cn('flex items-center justify-center gap-2 sm:gap-3', className)}
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, index) => {
        const val = digits[index] || '';
        const isFilled = Boolean(val);

        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={val}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
            aria-label={`${index + 1}-raqam`}
            className={cn(
              'w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono text-navy-950 dark:text-white bg-white dark:bg-[#070E22] border rounded-xl sm:rounded-2xl',
              'transition-all duration-150 outline-none select-none shadow-card-subtle',
              'focus:border-royal-600 focus:ring-4 focus:ring-royal-100 dark:focus:ring-royal-950/60',
              isFilled ? 'border-royal-400 dark:border-royal-500 bg-royal-50/20 dark:bg-royal-950/40' : 'border-slate-200 dark:border-navy-800',
              error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-100 dark:focus:ring-rose-950/60 text-rose-600',
              disabled && 'bg-slate-50 dark:bg-navy-950 text-slate-400 dark:text-slate-600 cursor-not-allowed border-slate-200 dark:border-navy-800',
            )}
          />
        );
      })}
    </div>
  );
}
