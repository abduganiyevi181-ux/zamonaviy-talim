'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  TrendingUp,
  Heart,
  Bell,
  User,
  Settings,
  Clock,
  CheckCircle2,
  Award,
  ArrowRight,
  LogOut,
  Shield,
  Smartphone,
  Mail,
  Send,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Avatar,
  Input,
  useToast,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import { api } from '@/lib/api';
import { COURSES } from '@/data/mock-data';
import { formatNumber } from '@/lib/utils';

// Navigation sections
const DASHBOARD_SECTIONS = [
  { id: 'overview', label: 'Umumiy ko‘rinish', icon: LayoutDashboard },
  { id: 'my-courses', label: 'Mening kurslarim', icon: BookOpen },
  { id: 'continue', label: 'Davom ettirish', icon: PlayCircle },
  { id: 'progress', label: 'O‘quv progressi', icon: TrendingUp },
  { id: 'favorites', label: 'Sevimlilar', icon: Heart },
  { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
  { id: 'profile', label: 'Mening profilim', icon: User },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    fullName: 'Javohir Aliyev',
    email: 'student@talim.uz',
    phone: '+998 90 123 45 67',
    headline: 'Frontend dasturchi bo‘lish niyatida',
    bio: 'Zamonaviy texnologiyalar va sunʼiy intellekt vositalarini chuqur o‘rganmoqdaman.',
    avatarUrl: null,
  });

  const [stats, setStats] = useState({
    enrolledCount: 2,
    activeCount: 1,
    completedCount: 1,
    totalHoursLearned: 18.5,
    favoritesCount: 2,
  });

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [continueCourse, setContinueCourse] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Settings State
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    smsEnabled: true,
    tgEnabled: false,
  });

  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);

  // Load Dashboard Data
  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await api.student.getDashboard();
        if (res.success && res.data) {
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.continueLearning) setContinueCourse(res.data.continueLearning);
          if (res.data.enrollments?.length > 0) {
            setEnrolledCourses(res.data.enrollments);
          } else {
            // Seed default mock courses for immediate premium demo experience
            setEnrolledCourses([
              {
                id: 'enr-demo-1',
                courseId: 'course-1',
                title: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
                slug: 'nextjs-va-nestjs-bilan-zamonaviy-platforma',
                thumbnailUrl: COURSES[0].thumbnail,
                categoryName: 'Dasturlash & IT',
                teacherName: 'Anvar Karimov',
                progressPct: 65,
                status: 'ACTIVE',
                totalLessons: 48,
              },
              {
                id: 'enr-demo-2',
                courseId: 'course-2',
                title: 'Professional Figma va UI/UX Dizayn Tizimlari',
                slug: 'professional-figma-va-ui-ux-dizayn',
                thumbnailUrl: COURSES[1].thumbnail,
                categoryName: 'Dizayn & Kreativ',
                teacherName: 'Madina Usmanova',
                progressPct: 100,
                status: 'COMPLETED',
                totalLessons: 36,
              },
            ]);
            setContinueCourse({
              courseId: 'course-1',
              courseTitle: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
              courseSlug: 'nextjs-va-nestjs-bilan-zamonaviy-platforma',
              thumbnailUrl: COURSES[0].thumbnail,
              progressPct: 65,
              categoryName: 'Dasturlash & IT',
              teacherName: 'Anvar Karimov',
              totalLessons: 48,
            });
          }
        } else {
          // Fallback demo data
          setEnrolledCourses([
            {
              id: 'enr-demo-1',
              courseId: 'course-1',
              title: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
              slug: 'nextjs-va-nestjs-bilan-zamonaviy-platforma',
              thumbnailUrl: COURSES[0].thumbnail,
              categoryName: 'Dasturlash & IT',
              teacherName: 'Anvar Karimov',
              progressPct: 65,
              status: 'ACTIVE',
              totalLessons: 48,
            },
            {
              id: 'enr-demo-2',
              courseId: 'course-2',
              title: 'Professional Figma va UI/UX Dizayn Tizimlari',
              slug: 'professional-figma-va-ui-ux-dizayn',
              thumbnailUrl: COURSES[1].thumbnail,
              categoryName: 'Dizayn & Kreativ',
              teacherName: 'Madina Usmanova',
              progressPct: 100,
              status: 'COMPLETED',
              totalLessons: 36,
            },
          ]);
          setContinueCourse({
            courseId: 'course-1',
            courseTitle: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
            courseSlug: 'nextjs-va-nestjs-bilan-zamonaviy-platforma',
            thumbnailUrl: COURSES[0].thumbnail,
            progressPct: 65,
            categoryName: 'Dasturlash & IT',
            teacherName: 'Anvar Karimov',
            totalLessons: 48,
          });
        }

        // Favorites
        const favRes = await api.student.getFavorites();
        if (favRes.success && favRes.data?.length > 0) {
          setFavorites(favRes.data);
        } else {
          setFavorites([
            {
              id: 'fav-demo-1',
              courseId: 'course-2',
              title: 'Professional Figma va UI/UX Dizayn Tizimlari',
              slug: 'professional-figma-va-ui-ux-dizayn',
              thumbnailUrl: COURSES[1].thumbnail,
              price: 390000,
              rating: 4.9,
              level: 'Boshlang‘ich',
              teacherName: 'Madina Usmanova',
            },
          ]);
        }

        // Notifications
        setNotifications([
          {
            id: 'notif-1',
            title: 'Yangi dars yuklandi!',
            message: 'Next.js va NestJS kursida 3-modul darslari ochiq.',
            time: '2 soat oldin',
            isRead: false,
          },
          {
            id: 'notif-2',
            title: 'Tabriklaymiz!',
            message: 'Professional Figma kursini 100% tugatdingiz va sertifikatga ega bo‘ldingiz.',
            time: 'Kecha',
            isRead: true,
          },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const handleTabChange = (id) => {
    setActiveTab(id);
    router.replace(`/dashboard?tab=${id}`);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await api.student.updateProfile({
        fullName: userData.fullName,
        bio: userData.bio,
      });
      toast({
        title: 'Profil yangilandi',
        description: 'Shaxsiy maʼlumotlaringiz bazada muvaffaqiyatli saqlandi.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Xatolik',
        description: err.message || 'Profilni saqlab bo‘lmadi',
        type: 'danger',
      });
    }
  };

  const handlePreferencesToggle = async (key) => {
    const nextVal = !preferences[key];
    const newPrefs = { ...preferences, [key]: nextVal };
    setPreferences(newPrefs);
    try {
      await api.student.updatePreferences(newPrefs);
      toast({
        title: 'Sozlamalar saqlandi',
        description: 'Bildirishnoma sozlamalari yangilandi.',
        type: 'info',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFavorite = (courseId) => {
    setFavorites((prev) => prev.filter((f) => f.courseId !== courseId));
    toast({
      title: 'Olib tashlandi',
      description: 'Kurs sevimlilar ro‘yxatidan o‘chirildi.',
      type: 'info',
    });
  };

  const handleConnectTelegram = async () => {
    try {
      const res = await api.telegram.getLinkToken();
      if (res.success && res.data?.linkUrl) {
        window.open(res.data.linkUrl, '_blank');
        toast({
          title: 'Telegram havola ochildi',
          description: 'Botga o‘tib /start tugmasini bosing.',
          type: 'info',
        });
        setTelegramLinked(true);
        setTelegramUser('javohir_dev');
      } else {
        window.open('https://t.me/talim_platform_bot?start=link_demo', '_blank');
        setTelegramLinked(true);
        setTelegramUser('javohir_dev');
      }
    } catch (e) {
      window.open('https://t.me/talim_platform_bot?start=link_demo', '_blank');
    }
  };

  const handleUnlinkTelegram = async () => {
    await api.telegram.unlink().catch(() => null);
    setTelegramLinked(false);
    setTelegramUser(null);
    toast({
      title: 'Telegram hisobi uzildi',
      type: 'info',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#070E22] pb-20">
      {/* Dashboard Top Header */}
      <section className="bg-navy-950 dark:bg-[#040816] text-white border-b border-navy-900 dark:border-navy-900/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={userData.fullName} size="xl" className="border-2 border-turquoise-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {userData.fullName}
                  </h1>
                  <Badge variant="turquoise" size="xs">
                    Talaba
                  </Badge>
                </div>
                <p className="text-xs text-slate-200 mt-0.5">{userData.headline}</p>
                <span className="text-xs text-slate-200 font-mono mt-1 block">
                  {userData.email} • {userData.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/courses">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                  className="bg-royal-700 hover:bg-royal-800 text-white border-royal-600 dark:bg-royal-600 dark:hover:bg-royal-700 dark:border-royal-500 shadow-sm"
                >
                  Yangi kurslar
                </Button>
              </Link>
              <Link href="/teacher/dashboard">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="bg-royal-600 hover:bg-royal-700 text-white shadow-md shadow-royal-600/30"
                >
                  Ustoz Kabineti
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white dark:bg-[#0B1536] p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle sticky top-28">
            <nav className="flex flex-col gap-1">
              {DASHBOARD_SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleTabChange(sec.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-royal-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-royal-700 dark:hover:text-royal-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{sec.label}</span>
                    </div>
                    {sec.id === 'notifications' && notifications.some((n) => !n.isRead) && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Tab Content Area */}
          <main className="lg:col-span-9 flex flex-col gap-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">Mening Kurslarim</span>
                    <span className="text-2xl font-extrabold text-navy-950 dark:text-white mt-1">
                      {stats.enrolledCount} ta
                    </span>
                    <span className="text-xs text-royal-600 dark:text-royal-400 font-semibold mt-0.5">
                      Faol taʼlimda
                    </span>
                  </div>

                  <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">O‘rganilayotgan</span>
                    <span className="text-2xl font-extrabold text-amber-500 mt-1">
                      {stats.activeCount} ta
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Jarayonda</span>
                  </div>

                  <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">Tugallangan</span>
                    <span className="text-2xl font-extrabold text-emerald-500 mt-1">
                      {stats.completedCount} ta
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      Sertifikat tayyor
                    </span>
                  </div>

                  <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">O‘rganilgan vaqt</span>
                    <span className="text-2xl font-extrabold text-turquoise-500 mt-1">
                      {stats.totalHoursLearned} s
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Amaliy soat</span>
                  </div>
                </div>

                {/* Continue Learning Card */}
                {continueCourse && (
                  <Card className="p-6 bg-gradient-to-br from-navy-950 to-navy-900 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex-1">
                        <Badge variant="turquoise" size="xs" className="mb-2">
                          Darsni davom ettirish
                        </Badge>
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                          {continueCourse.courseTitle}
                        </h2>
                        <p className="text-xs text-slate-200 mt-1 font-medium">
                          Ustoz: {continueCourse.teacherName} • {continueCourse.categoryName}
                        </p>

                        <div className="mt-4 max-w-md">
                          <div className="flex items-center justify-between text-xs text-slate-200 mb-1 font-medium">
                            <span>O‘zlashtirish darajasi:</span>
                            <span className="text-turquoise-400 font-bold font-mono">
                              {continueCourse.progressPct}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-royal-500 to-turquoise-400 rounded-full transition-all duration-500"
                              style={{ width: `${continueCourse.progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <Link href={`/courses/${continueCourse.courseSlug}/learn`}>
                        <Button
                          variant="primary"
                          size="md"
                          rightIcon={<PlayCircle className="w-4 h-4" />}
                        >
                          Darsni davom ettirish
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )}

                {/* Enrolled Courses Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-navy-950">Mening faol kurslarim</h3>
                    <button
                      type="button"
                      onClick={() => handleTabChange('my-courses')}
                      className="text-xs text-royal-700 font-semibold hover:underline"
                    >
                      Barchasini ko‘rish
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrolledCourses.map((c) => (
                      <Card key={c.id} className="p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <Badge variant="navy" size="xs">
                              {c.categoryName}
                            </Badge>
                            <span className="text-[11px] font-semibold text-emerald-600">
                              {c.status === 'COMPLETED' ? 'Tugatildi' : `${c.progressPct}% o‘rganildi`}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-navy-950 line-clamp-1">
                            {c.title}
                          </h4>
                          <span className="text-[11px] text-muted-500 block mt-0.5">
                            Ustoz: {c.teacherName}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-royal-600 rounded-full"
                              style={{ width: `${c.progressPct}%` }}
                            />
                          </div>
                          <Link href={`/courses/${c.slug}/learn`}>
                            <Button size="xs" variant="secondary">
                              Darsga kirish
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. MY COURSES TAB */}
            {activeTab === 'my-courses' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-navy-950">Barcha aʼzo bo‘lingan kurslar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.map((c) => (
                    <Card key={c.id} className="overflow-hidden flex flex-col justify-between">
                      <div className="p-5">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <Badge variant={c.status === 'COMPLETED' ? 'turquoise' : 'navy'} size="xs">
                            {c.categoryName}
                          </Badge>
                          <span className="text-[11px] font-bold text-royal-700 font-mono">
                            {c.progressPct}%
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-navy-950">{c.title}</h3>
                        <p className="text-xs text-muted-500 mt-1">Muallif: {c.teacherName}</p>

                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                          <div
                            className="h-full bg-royal-600 rounded-full"
                            style={{ width: `${c.progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-muted-500">
                          {c.totalLessons || 30} ta dars
                        </span>
                        <Link href={`/courses/${c.slug}/learn`}>
                          <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            Darsni boshlash
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 3. CONTINUE LEARNING TAB */}
            {activeTab === 'continue' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-navy-950">Faol taʼlim jarayoni</h2>
                {continueCourse ? (
                  <Card className="p-6 flex flex-col gap-4">
                    <Badge variant="turquoise" size="xs" className="self-start">
                      Joriy kursingiz
                    </Badge>
                    <h3 className="text-lg font-bold text-navy-950">
                      {continueCourse.courseTitle}
                    </h3>
                    <p className="text-xs text-muted-500">
                      Siz ushbu kursning <strong>{continueCourse.progressPct}%</strong> qismini bajardingiz. Navbatdagi dars sizni kutmoqda.
                    </p>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-royal-600 rounded-full"
                        style={{ width: `${continueCourse.progressPct}%` }}
                      />
                    </div>

                    <div className="pt-2">
                      <Link href={`/courses/${continueCourse.courseSlug}/learn`}>
                        <Button variant="primary" size="md" rightIcon={<PlayCircle className="w-4 h-4" />}>
                          Lesson Playerga o‘tish
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ) : (
                  <EmptyState title="Faol kurs topilmadi" description="Hozirda boshlangan kursingiz yo‘q." />
                )}
              </div>
            )}

            {/* 4. PROGRESS TAB */}
            {activeTab === 'progress' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-base font-bold text-navy-950">O‘quv natijalari va yutuqlar</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
                    <Award className="w-6 h-6 text-turquoise-600 mb-2" />
                    <span className="text-xs text-muted-500 block">Sertifikatlar</span>
                    <span className="text-xl font-bold text-navy-950 mt-1 block">1 ta olingan</span>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
                    <span className="text-xs text-muted-500 block">Tugallangan darslar</span>
                    <span className="text-xl font-bold text-navy-950 mt-1 block">42 ta dars</span>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
                    <TrendingUp className="w-6 h-6 text-royal-600 mb-2" />
                    <span className="text-xs text-muted-500 block">O‘rtacha test bali</span>
                    <span className="text-xl font-bold text-navy-950 mt-1 block">94%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. FAVORITES TAB */}
            {activeTab === 'favorites' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-navy-950">Saqlangan kurslar</h2>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((f) => (
                      <Card key={f.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <Badge variant="outline" size="xs" className="mb-1">
                            {f.level}
                          </Badge>
                          <h4 className="text-xs font-bold text-navy-950 line-clamp-1">{f.title}</h4>
                          <span className="text-xs text-slate-600 font-medium block mt-0.5">
                            {f.teacherName} • {f.price != null ? formatNumber(f.price) : ''} so‘m
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/courses/${f.slug}`}>
                            <Button size="xs" variant="secondary">
                              Ko‘rish
                            </Button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemoveFavorite(f.courseId)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Sevimlilar ro‘yxati bo‘sh" description="Siz hali biror kursni saqlamadingiz." />
                )}
              </div>
            )}

            {/* 6. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-navy-950">Xabarnomalar</h2>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                      toast({ title: 'Barchasi o‘qildi deb belgilandi', type: 'info' });
                    }}
                  >
                    Barchasini o‘qilgan qilish
                  </Button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${
                        n.isRead
                          ? 'bg-white border-slate-200/80 text-slate-700'
                          : 'bg-royal-50/50 border-royal-200/60 text-navy-950'
                      }`}
                    >
                      <Bell className={`w-4 h-4 mt-0.5 ${n.isRead ? 'text-slate-500' : 'text-royal-600'}`} />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="font-bold">{n.title}</strong>
                          <span className="text-xs text-slate-600 font-medium font-mono">{n.time}</span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. PROFILE TAB */}
            {activeTab === 'profile' && (
              <Card className="p-6">
                <h2 className="text-base font-bold text-navy-950 mb-4">Shaxsiy Profilni Tahrirlash</h2>
                <form onSubmit={handleProfileSave} className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">To‘liq Ismingiz</label>
                    <input
                      type="text"
                      value={userData.fullName}
                      onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Email Manzili</label>
                      <input
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Telefon Raqami</label>
                      <input
                        type="text"
                        value={userData.phone}
                        disabled
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">Kasb / Qisqa Maqom</label>
                    <input
                      type="text"
                      value={userData.headline}
                      onChange={(e) => setUserData({ ...userData, headline: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">O‘zingiz haqingizda</label>
                    <textarea
                      rows={3}
                      value={userData.bio}
                      onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="sm">
                      O‘zgarishlarni saqlash
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* 8. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="flex flex-col gap-6">
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-navy-950 mb-3">Xabarnoma Kanallari</h3>
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-royal-600" />
                        <span>Email orqali yangiliklar va eslatmalar</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.emailEnabled}
                        onChange={() => handlePreferencesToggle('emailEnabled')}
                        className="w-4 h-4 accent-royal-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>SMS xabarnomalar (+998)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.smsEnabled}
                        onChange={() => handlePreferencesToggle('smsEnabled')}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <Send className="w-4 h-4 text-turquoise-600" />
                        <span>Telegram Bot orqali bildirishnomalar</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.tgEnabled}
                        onChange={() => handlePreferencesToggle('tgEnabled')}
                        className="w-4 h-4 accent-turquoise-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <Send className="w-5 h-5 text-turquoise-600" />
                      <div>
                        <h3 className="text-sm font-bold text-navy-950">Telegram Bot Integratsiyasi</h3>
                        <p className="text-xs text-muted-500">
                          Platformadagi darslar, eslatmalar va progressni Telegram bot orqali qabul qiling.
                        </p>
                      </div>
                    </div>
                    {telegramLinked ? (
                      <Badge variant="turquoise" size="xs">
                        Ulangan (@{telegramUser || 'bot'})
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="xs">
                        Ulanmagan
                      </Badge>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex-1">
                      <span className="font-semibold text-navy-900 block">
                        Xavfsiz bir martalik havola
                      </span>
                      <span className="text-muted-500 text-[11px] block mt-0.5">
                        Tugmani bosing va botga o‘tib <b>/start</b> ni yuboring. Hech qanday login yoki parol kiritish shart emas.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<Send className="w-4 h-4" />}
                        onClick={handleConnectTelegram}
                      >
                        Telegramda ochish
                      </Button>
                      {telegramLinked && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={handleUnlinkTelegram}
                        >
                          Uzish
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-bold text-navy-950 mb-3">Parolni o‘zgartirish</h3>
                  <div className="flex flex-col gap-3 text-xs max-w-md">
                    <input
                      type="password"
                      placeholder="Joriy parol"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    />
                    <input
                      type="password"
                      placeholder="Yangi parol (kamida 8 belgi)"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="self-start"
                      onClick={() =>
                        toast({ title: 'Parol yangilandi', type: 'success' })
                      }
                    >
                      Parolni yangilash
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-muted-500">Talaba kabineti yuklanmoqda...</span>
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}
