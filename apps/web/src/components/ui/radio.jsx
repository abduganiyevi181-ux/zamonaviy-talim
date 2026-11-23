'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const RadioContext = React.createContext(null);

export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  children,
  className,
}) {
  const [selectedVal, setSelectedVal] = React.useState(
    value !== undefined ? value : defaultValue,
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedVal(value);
    }
  }, [value]);

  const select = (val) => {
    if (value === undefined) {
      setSelectedVal(val);
    }
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <RadioContext.Provider value={{ name, selectedVal, select }}>
      <div role="radiogroup" className={cn('flex flex-col gap-2.5', className)}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export const Radio = React.forwardRef(function Radio(
  {
    className,
    value,
    label,
    description,
    disabled,
    id,
    ...props
  },
  ref,
) {
  const context = React.useContext(RadioContext);
  const generatedId = React.useId();
  const radioId = id || generatedId;

  const isChecked = context ? context.selectedVal === value : props.checked;

  const handleClick = () => {
    if (disabled) return;
    if (context) {
      context.select(value);
    }
  };

  return (
    <div className="flex items-start gap-3 select-none">
      <div className="relative flex items-center pt-0.5">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          name={context?.name || props.name}
          value={value}
          checked={isChecked}
          onChange={handleClick}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <motion.div
          whileTap={disabled ? {} : { scale: 0.9 }}
          onClick={handleClick}
          role="radio"
          aria-checked={isChecked}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleClick();
            }
          }}
          className={cn(
            'w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors',
            'focus-visible:ring-2 focus-visible:ring-royal-500 focus-visible:ring-offset-2',
            isChecked
              ? 'border-royal-700 bg-white'
              : 'border-slate-300 bg-white hover:border-slate-400',
            disabled && 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60',
            className,
          )}
        >
          {isChecked && (
            <motion.div
              layoutId={context?.name ? `radio-${context.name}` : undefined}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className="w-2.5 h-2.5 rounded-full bg-royal-700"
            />
          )}
        </motion.div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={radioId}
              onClick={handleClick}
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
        </div>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';
