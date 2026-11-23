'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumb({
  items = [],
  separator,
  className,
}) {
  const defaultSeparator = <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs', className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="font-medium text-slate-600 hover:text-navy-950 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    isLast ? 'font-bold text-navy-950' : 'text-slate-600 font-medium',
                  )}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span aria-hidden="true">
                  {separator || defaultSeparator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
