'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function ErrorState({
  title = "Xatolik yuz berdi",
  message = "Ma'lumotlarni yuklashda kutilmagan nosozlik paydo bo'ldi. Iltimos, qaytadan urinib ko'ring.",
  onRetry,
  retryText = "Qaytadan urinish",
  secondaryActionText,
  onSecondaryAction,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'w-full p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-rose-50/40 border border-rose-200/80 rounded-2xl',
        className,
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <AlertCircle className="w-7 h-7 stroke-[1.5]" />
      </div>

      <h4 className="text-base font-semibold text-navy-900 tracking-tight">
        {title}
      </h4>

      <p className="text-xs text-rose-700/80 max-w-sm mt-1.5 leading-relaxed">
        {message}
      </p>

      {(onRetry || onSecondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {onRetry && (
            <Button
              size="sm"
              variant="destructive"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={onRetry}
            >
              {retryText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onSecondaryAction}
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
