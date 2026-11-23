'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish',
  variant = 'warning',
  isLoading = false,
  children,
}) {
  const icons = {
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    destructive: <XCircle className="w-6 h-6 text-rose-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    info: <Info className="w-6 h-6 text-royal-600" />,
  };

  const iconBg = {
    warning: 'bg-amber-50 border-amber-200',
    destructive: 'bg-rose-50 border-rose-200',
    success: 'bg-emerald-50 border-emerald-200',
    info: 'bg-royal-50 border-royal-200',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-modal p-6 z-10"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl border flex items-center justify-center shrink-0',
                  iconBg[variant] || iconBg.warning,
                )}
              >
                {icons[variant] || icons.warning}
              </div>

              <div className="flex-1">
                <h4 className="text-base font-semibold text-navy-900 tracking-tight">
                  {title}
                </h4>
                {description && (
                  <p className="text-xs text-muted-500 mt-1.5 leading-relaxed">
                    {description}
                  </p>
                )}
                {children && <div className="mt-3">{children}</div>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === 'destructive' ? 'destructive' : 'primary'}
                size="sm"
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
