'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { FAQ_ITEMS } from '@/data/mock-data';

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState(['faq-1']);

  const toggleItem = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const filteredFaq = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex flex-col gap-10">
      {/* Header */}
      <div className="text-center flex flex-col items-center">
        <Badge variant="navy" size="sm" dot className="mb-2">
          Yordam Markazi
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
          Ko‘p Beriladigan Savollar
        </h1>
        <p className="text-xs sm:text-sm text-muted-500 mt-2 max-w-xl">
          Platformadan foydalanish, to‘lovlar, sertifikatlar va taʼlim jarayoni bo‘yicha barcha kerakli maʼlumotlar.
        </p>

        {/* Search Input */}
        <div className="relative w-full max-w-lg mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Savolingizni izlang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm text-navy-950 bg-white border border-slate-300 rounded-xl outline-none shadow-card-subtle placeholder:text-slate-500 focus:border-royal-600"
          />
        </div>
      </div>

      {/* Accordion list */}
      <div className="flex flex-col gap-3">
        {filteredFaq.length > 0 ? (
          filteredFaq.map((item) => {
            const isOpen = openItems.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-card-subtle transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-navy-950"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-royal-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-muted-500">
            Savol topilmadi. Iltimos, boshqa kalit so‘z bilan izlab ko‘ring.
          </div>
        )}
      </div>

      {/* Still have questions? */}
      <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-card-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-royal-50 border border-royal-100 flex items-center justify-center text-royal-700 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy-950">
              Savolingizga javob topmadingizmi?
            </h4>
            <p className="text-xs text-muted-500">
              Qo‘llab-quvvatlash xizmatimiz haftaning barcha kunlarida javob beradi.
            </p>
          </div>
        </div>

        <Link href="/contact">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Murojaat qilish
          </Button>
        </Link>
      </div>
    </div>
  );
}
