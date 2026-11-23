'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title = "Ma'lumot topilmadi",
  description = "Hozircha bu yerda hech qanday ma'lumot mavjud emas.",
  actionText,
  onAction,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'w-full p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-2xl shadow-card-subtle',
        className,
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-ivory-300/80 border border-ivory-400/60 flex items-center justify-center text-royal-700 mb-4 shadow-sm">
        {icon || <Inbox className="w-7 h-7 stroke-[1.5]" />}
      </div>

      <h4 className="text-base font-semibold text-navy-900 tracking-tight">
        {title}
      </h4>

      <p className="text-xs text-muted-500 max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <div className="mt-5">
          <Button size="sm" variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
