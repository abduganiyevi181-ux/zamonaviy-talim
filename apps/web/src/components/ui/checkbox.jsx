'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Checkbox = React.forwardRef(function Checkbox(
  {
    className,
    checked,
    defaultChecked,
    onChange,
    label,
    description,
    error,
    disabled,
    id,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  const [isChecked, setIsChecked] = React.useState(
    checked !== undefined ? checked : defaultChecked || false,
  );

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const toggle = (e) => {
    if (disabled) return;
    const nextVal = !isChecked;
    if (checked === undefined) {
      setIsChecked(nextVal);
    }
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, checked: nextVal },
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="flex items-start gap-3 select-none">
      <div className="relative flex items-center pt-0.5">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={isChecked}
          onChange={toggle}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <motion.div
          whileTap={disabled ? {} : { scale: 0.9 }}
          onClick={toggle}
          role="checkbox"
          aria-checked={isChecked}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              toggle(e);
            }
          }}
          className={cn(
            'w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors',
            'focus-visible:ring-2 focus-visible:ring-royal-500 focus-visible:ring-offset-2',
            isChecked
              ? 'bg-royal-700 border-royal-700 text-white'
              : 'bg-white border-slate-300 hover:border-slate-400',
            error && 'border-rose-500',
            disabled && 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60',
            className,
          )}
        >
          {isChecked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={checkboxId}
              onClick={toggle}
              className={cn(
                'text-sm font-medium text-navy-900 cursor-pointer',
                disabled && 'cursor-not-allowed text-slate-400',
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-500 mt-0.5">{description}</p>
          )}
          {error && <p className="text-xs text-rose-600 mt-0.5">{error}</p>}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
