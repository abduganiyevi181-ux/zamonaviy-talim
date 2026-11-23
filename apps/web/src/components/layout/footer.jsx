'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  Send,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';

export function Footer() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    (pathname && pathname.startsWith('/verify-'));
  const isAdminPage = pathname && pathname.startsWith('/admin');
  const isLearnPage = pathname && pathname.includes('/learn');

  if (isAuthPage || isAdminPage || isLearnPage) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: 'Noto‘g‘ri email',
        description: 'Iltimos, haqiqiy elektron pochta manzilini kiriting.',
        type: 'warning',
      });
      return;
    }
    setIsSubscribed(true);
    toast({
      title: 'Muvaffaqiyatli obuna bo‘ldingiz!',
      description: 'Eng so‘nggi darslar va yangiliklar pochtangizga yuboriladi.',
      type: 'success',
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#070E22] bg-navy-950 text-white border-t border-navy-900 mt-auto">
      {/* Top Banner */}
      <div className="border-b border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs uppercase font-bold tracking-widest text-turquoise-400">
                Yangiliklardan birinchi bo‘lib xabardor bo‘ling
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Yangi kurslar, chegirmalar va bepul masterclasslar
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
                O‘zbekistondagi eng dolzarb IT va taʼlim materiallarini bevosita pochtangizga yetkazamiz. Hech qanday spam yo‘q.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Elektron pochtangiz..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 text-xs sm:text-sm text-navy-900 bg-white rounded-xl outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-turquoise-400 font-medium"
                />
                <Button
                  type="submit"
                  variant="turquoise"
                  size="md"
                  rightIcon={isSubscribed ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  className="shrink-0"
                >
                  {isSubscribed ? 'Obuna bo‘lindi' : 'Obuna bo‘lish'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6 text-turquoise-400" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                TAʼLIM<span className="text-royal-400 font-light">DIZAYNI</span>
              </span>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              O‘zbekiston yoshlari va mutaxassislari uchun yaratilgan premium taʼlim platformasi. Xalqaro darajadagi bilim va amaliy tajriba uyg‘unligi.
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-300 text-xs">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ishonchli Taʼlim Standarti</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-200">
              Platforma
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Barcha Kurslar
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-white transition-colors">
                  Tajribali Ustozlar
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Yo‘nalishlar Katalogi
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Biz Haqimizda
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-200">
              Yo‘nalishlar
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
              <li>
                <Link href="/courses?category=dasturlash" className="hover:text-white transition-colors">
                  Dasturlash & IT
                </Link>
              </li>
              <li>
                <Link href="/courses?category=dizayn" className="hover:text-white transition-colors">
                  UI/UX & Grafik Dizayn
                </Link>
              </li>
              <li>
                <Link href="/courses?category=data-science" className="hover:text-white transition-colors">
                  Sunʼiy Intellekt & Data
                </Link>
              </li>
              <li>
                <Link href="/courses?category=tillar" className="hover:text-white transition-colors">
                  Xorijiy Tillar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-200">
              Bog‘lanish
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-turquoise-400 shrink-0 mt-0.5" />
                <span>Toshkent shahri, Amir Temur shox ko‘chasi, 107-bino</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-turquoise-400 shrink-0" />
                <span>info@talimdizayni.uz</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-turquoise-400 shrink-0" />
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @talimdizayni_bot
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-turquoise-400 hover:underline inline-block pt-1">
                  Murojaat yuborish &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Zamonaviy Taʼlim Dizayni. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-6">
            <Link href="/faq" className="hover:text-slate-200 transition-colors">
              Ko‘p so‘raladigan savollar
            </Link>
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              Maxfiylik siyosati
            </Link>
            <Link href="/contact" className="hover:text-slate-200 transition-colors">
              Qo‘llab-quvvatlash
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
