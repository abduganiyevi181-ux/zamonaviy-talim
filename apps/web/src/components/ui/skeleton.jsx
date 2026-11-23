'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  variant = 'rectangle',
  ...props
}) {
  const variants = {
    rectangle: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        'animate-pulse bg-slate-200/80',
        variants[variant] || variants.rectangle,
        className,
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-white border border-slate-200/80 rounded-2xl flex flex-col gap-4 shadow-card-subtle">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton variant="text" className="w-2/3 h-4" />
          <Skeleton variant="text" className="w-1/3 h-3" />
        </div>
      </div>
      <Skeleton variant="rectangle" className="w-full h-32" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" className="w-24 h-6" />
        <Skeleton variant="text" className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  );
}
