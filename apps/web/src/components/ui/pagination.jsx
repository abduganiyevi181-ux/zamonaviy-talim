'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('dots-left');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('dots-right');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1.5 select-none', className)}>
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Oldingi sahifa"
        className={cn(
          'h-9 px-3 rounded-lg border border-slate-200 bg-white text-navy-800 text-xs font-medium flex items-center gap-1 shadow-card-subtle transition-colors',
          'hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-royal-500',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        )}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Oldingi</span>
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === 'dots-left' || p === 'dots-right') {
            return (
              <span
                key={`dots-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-slate-500"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const isCurrent = p === currentPage;

          return (
            <button
              key={p}
              type="button"
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-colors',
                isCurrent
                  ? 'bg-royal-700 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-navy-950 hover:bg-slate-100 shadow-card-subtle',
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Keyingi sahifa"
        className={cn(
          'h-9 px-3 rounded-lg border border-slate-200 bg-white text-navy-800 text-xs font-medium flex items-center gap-1 shadow-card-subtle transition-colors',
          'hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-royal-500',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        )}
      >
        <span className="hidden sm:inline">Keyingi</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
}
