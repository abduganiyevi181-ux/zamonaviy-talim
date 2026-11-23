'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({
  size = 'md',
  color = 'royal',
  className,
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    royal: 'text-royal-600',
    navy: 'text-navy-900',
    turquoise: 'text-turquoise-600',
    white: 'text-white',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizes[size] || sizes.md,
        colors[color] || colors.royal,
        className,
      )}
    />
  );
}

export function LoadingDots({ className }) {
  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full bg-royal-600"
          initial={{ y: 0, opacity: 0.4 }}
          animate={{ y: -4, opacity: 1 }}
          transition={{ ...dotTransition, delay: index * 0.15 }}
        />
      ))}
    </div>
  );
}

export function FullPageLoading({ text = "Yuklanmoqda..." }) {
  return (
    <div className="fixed inset-0 z-50 bg-ivory-100/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <LoadingSpinner size="xl" color="royal" />
      </div>
      <p className="text-sm font-medium text-navy-800 tracking-tight animate-pulse">
        {text}
      </p>
    </div>
  );
}
