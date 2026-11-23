'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pill',
  className,
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 select-none',
        variant === 'pill' && 'p-1 bg-slate-100/80 rounded-xl border border-slate-200/60',
        variant === 'line' && 'border-b border-slate-200 gap-6',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 text-xs font-semibold tracking-tight transition-colors cursor-pointer outline-none',
              variant === 'pill' &&
                'px-3.5 py-1.5 rounded-lg z-10 ' +
                (isActive ? 'text-navy-950 font-bold' : 'text-muted-500 hover:text-navy-800'),
              variant === 'line' &&
                'pb-3 ' +
                (isActive ? 'text-royal-700' : 'text-muted-500 hover:text-navy-900'),
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                  isActive
                    ? 'bg-royal-100 text-royal-800'
                    : 'bg-slate-200/70 text-muted-600',
                )}
              >
                {tab.badge}
              </span>
            )}

            {isActive && variant === 'pill' && (
              <motion.div
                layoutId="activeTabPill"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute inset-0 bg-white rounded-lg shadow-card-subtle -z-10 border border-slate-200/60"
              />
            )}

            {isActive && variant === 'line' && (
              <motion.div
                layoutId="activeTabLine"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-royal-700"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
