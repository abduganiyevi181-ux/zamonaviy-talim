'use client';

import React from 'react';
import Link from 'next/link';
import {
  Code,
  Palette,
  TrendingUp,
  Languages,
  Database,
  Compass,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { CATEGORIES } from '@/data/mock-data';

export default function CategoriesPage() {
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-7 h-7 text-royal-700" />;
      case 'Palette':
        return <Palette className="w-7 h-7 text-royal-700" />;
      case 'TrendingUp':
        return <TrendingUp className="w-7 h-7 text-royal-700" />;
      case 'Languages':
        return <Languages className="w-7 h-7 text-royal-700" />;
      case 'Database':
        return <Database className="w-7 h-7 text-royal-700" />;
      case 'Compass':
        return <Compass className="w-7 h-7 text-royal-700" />;
      default:
        return <BookOpen className="w-7 h-7 text-royal-700" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex flex-col gap-10">
      <div>
        <Badge variant="navy" size="sm" dot className="mb-2">
          Katalog
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 dark:text-white tracking-tight">
          Barcha Taʼlim Yo‘nalishlari
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1 max-w-2xl">
          Zamonaviy IT, dizayn, sunʼiy intellekt, biznes va xorijiy tillar bo‘yicha tizimli dasturlar ro‘yxati.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/courses?category=${cat.slug}`} prefetch={true}>
            <Card interactive className="p-6 sm:p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-royal-50 dark:bg-navy-900 border border-royal-100 dark:border-navy-800 flex items-center justify-center">
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  {cat.badge && (
                    <Badge variant="turquoise" size="sm">
                      {cat.badge}
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-navy-950 dark:text-white tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-navy-800 text-xs font-semibold text-royal-700 dark:text-royal-400">
                <span>{cat.coursesCount} ta darslik & amaliy loyiha</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Kurslarni ko‘rish &rarr;
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
