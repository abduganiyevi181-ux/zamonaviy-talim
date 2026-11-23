'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Award,
  Clock,
  Laptop,
  CheckCircle2,
  Star,
  ChevronDown,
  Layers,
  Code,
  Palette,
  TrendingUp,
  Languages,
  Database,
  Compass,
  Check,
  ShieldCheck,
  GraduationCap,
  Flame,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Avatar,
  AvatarGroup,
} from '@/components/ui';
import {
  CATEGORIES,
  TEACHERS,
  COURSES,
  PLATFORM_BENEFITS,
  HOW_IT_WORKS,
  FAQ_ITEMS,
} from '@/data/mock-data';
import { formatNumber } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState('faq-1');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/courses');
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-6 h-6 text-royal-600 dark:text-royal-400" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-royal-600 dark:text-royal-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-royal-600 dark:text-royal-400" />;
      case 'Languages':
        return <Languages className="w-6 h-6 text-royal-600 dark:text-royal-400" />;
      case 'Database':
        return <Database className="w-6 h-6 text-royal-600 dark:text-royal-400" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-royal-600 dark:text-royal-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-royal-600 dark:text-royal-400" />;
    }
  };

  const getBenefitIcon = (iconName) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop className="w-6 h-6 text-turquoise-600 dark:text-turquoise-400" />;
      case 'Award':
        return <Award className="w-6 h-6 text-turquoise-600 dark:text-turquoise-400" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-turquoise-600 dark:text-turquoise-400" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-6 h-6 text-turquoise-600 dark:text-turquoise-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-turquoise-600 dark:text-turquoise-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-24">
      {/* 1. HERO SECTION - REDESIGNED 2-COLUMN SPLIT WITH HIGH-RES HERO VISUAL & FLOATING BADGES */}
      <section className="relative pt-8 sm:pt-16 pb-16 overflow-hidden bg-gradient-to-b from-royal-50/50 via-white to-slate-50/80 dark:from-[#060D20] dark:via-[#081232] dark:to-[#060D20] border-b border-slate-200/70 dark:border-navy-900">
        {/* Subtle decorative background ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-royal-400/10 dark:bg-royal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-turquoise-400/10 dark:bg-turquoise-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Punchy headline, Trust, Search & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Dynamic Live Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-royal-50 dark:bg-navy-900/90 border border-royal-200/70 dark:border-royal-800/80 text-royal-700 dark:text-royal-300 text-xs font-semibold shadow-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-royal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-royal-600" />
                </span>
                <span>O‘zbekiston Yangi Avlod Onlayn Taʼlim Ekotizimi</span>
              </div>

              {/* Main Headline with multi-tone gradient highlight */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-navy-950 dark:text-white tracking-tight leading-[1.14]">
                Kelajak kasblarini{' '}
                <span className="bg-gradient-to-r from-royal-600 via-blue-500 to-turquoise-500 bg-clip-text text-transparent">
                  amaliy loyihalar
                </span>{' '}
                bilan o‘rganing.
              </h1>

              {/* Persuasive Subtitle */}
              <p className="text-base sm:text-lg text-muted-500 dark:text-slate-300 mt-5 leading-relaxed font-normal max-w-xl">
                Nazariyadan to‘g‘ridan-to‘g‘ri amaliyotga: zamonaviy IT, dizayn va biznes ko‘nikmalarini yetakchi soha mutaxassislari bilan o‘zlashtirib, portfolio yarating.
              </p>

              {/* Quick Inline Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center w-full max-w-lg mt-7"
              >
                <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Qanday sohani o‘rganmoqchisiz? (masalan: React, Python...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-13 pl-12 pr-28 sm:pr-32 py-3.5 text-sm rounded-2xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-[#0B1536] text-navy-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-royal-500 shadow-md font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 sm:px-5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>Qidirish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Trending tag shortcuts */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Ommabop:</span>
                {['Next.js', 'UI/UX Dizayn', 'Python', 'IELTS 8.0+'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      router.push(`/courses?q=${encodeURIComponent(tag)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-royal-50 hover:text-royal-600 dark:bg-navy-900/90 dark:hover:bg-navy-800 dark:text-slate-300 text-slate-700 font-medium transition-colors border border-slate-200/80 dark:border-navy-700 text-[11px]"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Key Value Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-7 w-full max-w-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Xalqaro Sertifikat</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-royal-600 dark:text-royal-400 shrink-0" />
                  <span>Real Amaliy Loyihalar</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-turquoise-600 dark:text-turquoise-400 shrink-0" />
                  <span>24/7 Mentor Ko‘magi</span>
                </div>
              </div>

              {/* Trust Avatars & Rating */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-200/80 dark:border-navy-800 w-full max-w-lg">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-navy-900 object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Talaba"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-navy-900 object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Talaba"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-navy-900 object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                    alt="Talaba"
                  />
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-navy-900 object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                    alt="Talaba"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-navy-950 dark:text-white ml-1">4.95</span>
                  </div>
                  <p className="text-xs text-muted-500 dark:text-slate-400 font-medium mt-0.5">
                    <span className="font-bold text-navy-900 dark:text-slate-200">10,000+</span> o‘quvchi ishonchi
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MODERN HERO SHOWCASE VISUAL + FLOATING GLASS BADGES */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Background Radiant Blur */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-royal-600 via-blue-500 to-turquoise-400 rounded-3xl blur-2xl opacity-25 dark:opacity-40" />

                {/* Main Hero Card Container */}
                <div className="relative rounded-3xl overflow-hidden bg-navy-950 border-2 border-slate-200/90 dark:border-navy-700/80 shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"
                    alt="Zamonaviy ta'lim amaliyoti va talabalar"
                    className="w-full h-[380px] sm:h-[440px] lg:h-[480px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Subtle dark gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />

                  {/* Overlaid Banner at Bottom of Photo */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/10 dark:bg-navy-950/80 backdrop-blur-md border border-white/20 dark:border-navy-700/70 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span className="text-xs uppercase tracking-wider font-bold text-turquoise-300">
                            Amaliy Taʼlim Muhiti
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                          Har bir mavzuda real keyslar & amaliyot
                        </h4>
                      </div>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Jonli darslar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Glassmorphism Badge 1 - Top Left */}
                <div className="absolute -top-5 -left-4 sm:-left-6 bg-white/95 dark:bg-[#0E1A3D]/95 backdrop-blur-md border border-slate-200/90 dark:border-navy-700 shadow-xl rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 z-20">
                  <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                    <Star className="w-5 sm:w-6 h-5 sm:h-6 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm sm:text-base font-extrabold text-navy-950 dark:text-white">4.95</span>
                      <span className="text-xs text-amber-500 font-bold">★★★★★</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">1,240+ Aʼlo baholar</p>
                  </div>
                </div>

                {/* Floating Glassmorphism Badge 2 - Bottom Right */}
                <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white/95 dark:bg-[#0E1A3D]/95 backdrop-blur-md border border-slate-200/90 dark:border-navy-700 shadow-xl rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 z-20">
                  <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-turquoise-50 dark:bg-turquoise-950/60 border border-turquoise-200 dark:border-turquoise-800 flex items-center justify-center shrink-0">
                    <Award className="w-5 sm:w-6 h-5 sm:h-6 text-turquoise-600 dark:text-turquoise-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-navy-950 dark:text-white">Rasmiy Sertifikat</h5>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Xalqaro darajada tan olingan</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* 4-METRICS STATS ROW ACROSS FULL WIDTH */}
          <div className="mt-16 pt-10 border-t border-slate-200/80 dark:border-navy-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-royal-600 to-blue-500 bg-clip-text text-transparent">
                10,000+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-navy-900 dark:text-slate-200 mt-1">
                Faol O‘quvchilar
              </span>
              <span className="text-[11px] text-muted-500 dark:text-slate-400 font-medium">
                Respublika bo‘ylab
              </span>
            </div>

            <div className="flex flex-col items-center border-l border-slate-200/60 dark:border-navy-800 pl-4 sm:pl-6">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-turquoise-600 to-cyan-500 bg-clip-text text-transparent">
                50+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-navy-900 dark:text-slate-200 mt-1">
                Amaliy Kurslar
              </span>
              <span className="text-[11px] text-muted-500 dark:text-slate-400 font-medium">
                Boshlang‘ich va chuqur daraja
              </span>
            </div>

            <div className="flex flex-col items-center border-l border-slate-200/60 dark:border-navy-800 pl-4 sm:pl-6">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                98%
              </span>
              <span className="text-xs sm:text-sm font-semibold text-navy-900 dark:text-slate-200 mt-1">
                Ijobiy Natija
              </span>
              <span className="text-[11px] text-muted-500 dark:text-slate-400 font-medium">
                Muvaffaqiyatli bitiruvchilar
              </span>
            </div>

            <div className="flex flex-col items-center border-l border-slate-200/60 dark:border-navy-800 pl-4 sm:pl-6">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                24/7
              </span>
              <span className="text-xs sm:text-sm font-semibold text-navy-900 dark:text-slate-200 mt-1">
                Mentorlik Ko‘magi
              </span>
              <span className="text-[11px] text-muted-500 dark:text-slate-400 font-medium">
                Savollarga tezkor yechim
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY QUICK-NAV & DISCOVERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6">
        <div className="bg-white dark:bg-[#0B1536] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-navy-800 shadow-card-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-royal-50 dark:bg-navy-900 border border-royal-100 dark:border-navy-800 flex items-center justify-center text-royal-600 dark:text-royal-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-950 dark:text-white">Yo‘nalishlar bo‘yicha saralash</h3>
              <p className="text-xs text-muted-500 dark:text-slate-400">Qiziqqan sohangizdagi eng yangi kurslarni darhol toping</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                if (e.target.value !== 'all') {
                  router.push(`/courses?category=${e.target.value}`);
                } else {
                  router.push('/courses');
                }
              }}
              className="h-11 px-4 text-xs font-semibold text-navy-800 dark:text-slate-200 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl outline-none cursor-pointer flex-1 md:flex-initial"
            >
              <option value="all">Barcha yo‘nalishlar katalogi</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name} ({cat.coursesCount} kurs)
                </option>
              ))}
            </select>

            <Link href="/courses">
              <Button
                variant="primary"
                size="md"
                className="h-11 px-5 shrink-0 bg-royal-600 hover:bg-royal-700 text-white"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Katalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-royal-600 dark:text-royal-400">
              Yo‘nalishlar bo‘yicha taʼlim
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight mt-1">
              Ommabop Taʼlim Yo‘nalishlari
            </h2>
          </div>
          <Link href="/categories">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Barcha yo‘nalishlarni ko‘rish
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/courses?category=${cat.slug}`}>
              <Card interactive className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-royal-50 dark:bg-navy-900 border border-royal-100 dark:border-navy-800 flex items-center justify-center">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    {cat.badge && (
                      <Badge variant="turquoise" size="sm">
                        {cat.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-white tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100 dark:border-navy-800 text-xs font-semibold text-royal-600 dark:text-royal-400">
                  <span>{cat.coursesCount} ta amaliy kurs</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED COURSES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-royal-600 dark:text-royal-400">
              Saralangan Dasturlar
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight mt-1">
              Tavsiya Etilayotgan Kurslar
            </h2>
          </div>
          <Link href="/courses">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Barcha kurslar katalogi
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COURSES.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`}>
              <Card interactive className="h-full flex flex-col overflow-hidden">
                {/* Course Thumbnail */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-navy-900 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="navy" size="sm">
                      {course.badge || course.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-navy-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-semibold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-turquoise-400" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium mb-2">
                      <span>{course.category}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{course.rating}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">({course.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-navy-950 dark:text-white tracking-tight line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                      <Avatar name={course.instructor.name} size="xs" />
                      <span className="text-xs font-semibold text-navy-800 dark:text-slate-200 truncate">
                        {course.instructor.name}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-navy-800">
                    <div>
                      <span className="text-sm font-extrabold text-navy-950 dark:text-white">
                        {formatNumber(course.price)} so‘m
                      </span>
                      {course.originalPrice && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium line-through block -mt-0.5">
                          {formatNumber(course.originalPrice)} so‘m
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-royal-600 dark:text-royal-400 flex items-center gap-1">
                      Batafsil &rarr;
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. POPULAR TEACHERS SECTION */}
      <section className="bg-white dark:bg-[#070E22] py-16 border-y border-slate-200/80 dark:border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-royal-600 dark:text-royal-400">
                Yetakchi Mutaxassislar
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight mt-1">
                Tajribali Ustozlarimiz
              </h2>
            </div>
            <Link href="/teachers">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Barcha ustozlar bilan tanishish
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEACHERS.map((teacher) => (
              <Link key={teacher.id} href={`/teachers/${teacher.slug}`}>
                <Card interactive className="p-6 h-full flex flex-col justify-between text-center items-center">
                  <div className="flex flex-col items-center">
                    <Avatar
                      src={teacher.avatar}
                      name={teacher.name}
                      size="xl"
                      status="online"
                      className="mb-4 ring-4 ring-slate-100 dark:ring-navy-800"
                    />
                    <h3 className="text-base font-bold text-navy-950 dark:text-white tracking-tight">
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-semibold text-royal-600 dark:text-royal-400 mt-0.5">
                      {teacher.specialty}
                    </p>
                    <p className="text-xs text-muted-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {teacher.title}
                    </p>
                  </div>

                  <div className="w-full pt-4 mt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-around text-xs">
                    <div>
                      <span className="font-bold text-navy-950 dark:text-white block">{teacher.studentsCount}+</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">O‘quvchi</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-navy-800" />
                    <div>
                      <span className="font-bold text-navy-950 dark:text-white flex items-center gap-0.5 justify-center">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {teacher.rating}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reyting</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PLATFORM BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="turquoise" size="sm" className="mb-2">
            Afzalliklar
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
            Nega Aynan Zamonaviy Taʼlim Platformasi?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-2">
            O‘zbekiston yoshlariga jahon andozalariga mos, sifatli va amaliyotga yo‘naltirilgan bilim berish bizning bosh maqsadimizdir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORM_BENEFITS.map((b) => (
            <div
              key={b.id}
              className="p-6 bg-white dark:bg-[#0B1536] border border-slate-200/80 dark:border-navy-800 rounded-2xl shadow-card-subtle flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center mb-4">
                {getBenefitIcon(b.iconName)}
              </div>
              <h3 className="text-base font-bold text-navy-950 dark:text-white tracking-tight">
                {b.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-14 bg-[#070E22] bg-navy-950 text-white rounded-3xl relative overflow-hidden shadow-modal border border-navy-900">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-turquoise-400">
              Oddiy va Tushunarli Qadamlar
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Taʼlim Qanday Tashkil Qilinadi?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="flex flex-col relative">
                <span className="text-3xl sm:text-4xl font-extrabold text-turquoise-500/40 mb-2 font-mono">
                  {step.step}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12 pt-8 border-t border-navy-800">
            <Link href="/register">
              <Button variant="turquoise" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Hoziroq bepul ro‘yxatdan o‘tish
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-royal-600 dark:text-royal-400">
            Savollarga Javoblar
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight mt-1">
            Ko‘p Beriladigan Savollar
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2">
            Platformadan foydalanish, to‘lovlar va sertifikatlar bo‘yicha tez-tez beriladigan savollar.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-[#0B1536] border border-slate-200/80 dark:border-navy-800 rounded-2xl overflow-hidden shadow-card-subtle transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-navy-950 dark:text-white"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-royal-600 dark:text-royal-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-navy-800 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/faq" className="text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline">
            Barcha savol-javoblarni ko‘rish &rarr;
          </Link>
        </div>
      </section>

      {/* 9. BOTTOM TEACHER INVITATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-royal-800 to-navy-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-card-hover border border-royal-700">
          <div className="max-w-xl">
            <Badge variant="turquoise" size="sm" className="mb-2">
              Hamkorlik
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              O‘z bilimingizni ulashing va daromad toping
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
              Siz o‘z sohangizda tajribali mutaxassismisiz? Platformamizda kurslaringizni joylashtiring va minglab iqtidorli o‘quvchilarga taʼlim bering.
            </p>
          </div>

          <Link href="/contact?role=teacher" className="shrink-0">
            <Button
              variant="turquoise"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ustoz sifatida ariza topshirish
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
