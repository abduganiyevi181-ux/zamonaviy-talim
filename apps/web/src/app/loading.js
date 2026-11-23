import { LoadingSpinner } from '@/components/ui';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-300">
        <LoadingSpinner size="lg" />
        <span className="text-xs font-semibold">Sahifa yuklanmoqda...</span>
      </div>
    </div>
  );
}
