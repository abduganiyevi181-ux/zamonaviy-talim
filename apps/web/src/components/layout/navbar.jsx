'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  Users,
  Grid,
  Info,
  HelpCircle,
  PhoneCall,
  LogIn,
  LogOut,
  User,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getUser, clearAuth, api } from '@/lib/api';
import { useTheme } from '@/components/theme-provider';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const navigate = (href) => {
    if (href === pathname) {
      setMobileMenuOpen(false);
      return;
    }
    setNavigatingTo(href);
    setMobileMenuOpen(false);
  };

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    (pathname && pathname.startsWith('/verify-'));
  const isAdminPage = pathname && pathname.startsWith('/admin');
  const isLearnPage = pathname && pathname.includes('/learn');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentUser(getUser());
  }, [pathname]);

  if (isAuthPage || isAdminPage || isLearnPage) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    clearAuth();
    setCurrentUser(null);
    window.location.href = '/';
  };

  const getDashboardHref = () => {
    if (!currentUser) return '/dashboard';
    if (currentUser.role === 'ADMIN') return '/admin';
    if (currentUser.role === 'TEACHER') return '/teacher/dashboard';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (!currentUser) return 'Kabinet';
    if (currentUser.role === 'ADMIN') return 'Admin Panel';
    if (currentUser.role === 'TEACHER') return 'Ustoz Kabineti';
    return 'Kabinetim';
  };

  const navLinks = [
    { href: '/', label: 'Bosh sahifa' },
    { href: '/courses', label: 'Kurslar' },
    { href: '/teachers', label: 'Ustozlar' },
    { href: '/categories', label: 'Yo‘nalishlar' },
    { href: '/about', label: 'Biz haqimizda' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Bog‘lanish' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200 select-none',
        isScrolled
          ? 'bg-white/90 dark:bg-[#070E22]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800 shadow-card-subtle'
          : 'bg-white dark:bg-[#070E22] border-b border-slate-100 dark:border-navy-900',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" prefetch={true} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="w-6 h-6 text-turquoise-400 stroke-[1.8]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-navy-950 dark:text-white font-sans">
                TAʼLIM<span className="text-royal-600 dark:text-royal-400 font-light">DIZAYNI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 -mt-1">
                Zamonaviy Taʼlim Platformasi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                prefetch={true}
                onClick={() => navigate(link.href)}
                  className={cn(
                    'px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors',
                  isActive || navigatingTo === link.href
                      ? 'text-royal-700 dark:text-royal-400 bg-royal-50/80 dark:bg-royal-950/60 font-bold'
                      : 'text-navy-800 dark:text-slate-200 hover:text-royal-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-navy-900',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Tungi / Kunduzgi rejim"
              title={theme === 'dark' ? 'Kunduzgi rejimga o‘tish' : 'Tungi rejimga o‘tish'}
              className="p-2 rounded-xl text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-navy-900 border border-slate-200 dark:border-navy-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-navy-900" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardHref()} prefetch={true}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="dark:text-slate-200 dark:hover:bg-navy-900"
                    leftIcon={
                      currentUser.role === 'ADMIN' ? (
                        <Shield className="w-3.5 h-3.5 text-royal-600 dark:text-royal-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-royal-600 dark:text-royal-400" />
                      )
                    }
                  >
                    <span>{getDashboardLabel()}</span>
                    {currentUser.role !== 'STUDENT' && (
                      <Badge variant="navy" size="xs" className="ml-1">
                        {currentUser.role}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-navy-900"
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
                >
                  Chiqish
                </Button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={true}
                  className="h-10 px-4 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-2 bg-white dark:bg-navy-900 text-navy-900 dark:text-slate-100 border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 shadow-card-subtle transition-colors cursor-pointer select-none"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Kirish</span>
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  className="h-10 px-4 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-2 bg-royal-600 hover:bg-royal-700 text-white shadow-sm transition-all cursor-pointer select-none active:scale-[0.98]"
                >
                  <span>Ro‘yxatdan o‘tish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Tungi / Kunduzgi rejim"
              className="p-2 rounded-xl text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-navy-900 border border-slate-200 dark:border-navy-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-navy-900" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menyu"
              className="p-2 text-navy-900 dark:text-white hover:bg-slate-100 dark:hover:bg-navy-900 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-b border-slate-200 dark:border-navy-800 bg-white dark:bg-[#070E22] shadow-modal overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-3">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-royal-50 dark:bg-royal-950/60 text-royal-700 dark:text-royal-400 font-bold'
                          : 'text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900',
                      )}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </Link>
                  );
                })}
              </nav>

              <div className="h-px bg-slate-100 dark:bg-navy-800 my-2" />

              <div className="flex flex-col gap-2 pt-1">
                {currentUser ? (
                  <>
                    <Link href={getDashboardHref()} prefetch={true} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="md" className="w-full justify-center dark:border-slate-700 dark:text-slate-100">
                        {getDashboardLabel()}
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full justify-center text-rose-600 dark:bg-navy-900 dark:border-navy-800"
                    >
                      Tizimdan chiqish
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-11 px-4 text-xs font-semibold rounded-xl w-full flex items-center justify-center gap-2 bg-white dark:bg-navy-900 text-navy-900 dark:text-slate-100 border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 shadow-card-subtle transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Kirish</span>
                    </Link>
                    <Link
                      href="/register"
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-11 px-4 text-xs font-semibold rounded-xl w-full flex items-center justify-center gap-2 bg-royal-600 hover:bg-royal-700 text-white shadow-sm transition-all cursor-pointer"
                    >
                      <span>Ro‘yxatdan o‘tish</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
