'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Edit,
  Video,
  Users,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Eye,
  Trash2,
  Upload,
  Globe,
  Sparkles,
  AlertCircle,
  Search,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Avatar,
  Input,
  Modal,
  ModalFooter,
  useToast,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/data/mock-data';
import { formatNumber } from '@/lib/utils';

const TEACHER_SECTIONS = [
  { id: 'overview', label: 'Umumiy ko‘rinish', icon: LayoutDashboard },
  { id: 'courses', label: 'Mening kurslarim', icon: BookOpen },
  { id: 'create-course', label: 'Yangi kurs yaratish', icon: PlusCircle },
  { id: 'edit-course', label: 'Kursni tahrirlash', icon: Edit },
  { id: 'lessons', label: 'Darslar boshqaruvi', icon: Video },
  { id: 'students', label: 'Talabalarim', icon: Users },
  { id: 'analytics', label: 'Tahlil va Analitika', icon: BarChart3 },
  { id: 'reviews', label: 'Fikr-mulohazalar', icon: MessageSquare },
  { id: 'verification', label: 'Verifikatsiya', icon: ShieldCheck },
  { id: 'profile', label: 'Ustoz profili', icon: UserCheck },
];

function TeacherDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Teacher Profile & Stats
  const [teacherProfile, setTeacherProfile] = useState({
    fullName: 'Anvar Karimov',
    headline: 'Senior Software Architect & EdTech Muhandisi',
    specialty: 'Dasturlash & Web Arxitektura',
    bio: '10+ yillik amaliy tajribaga ega arxitektor va mentor.',
    experienceYears: 10,
    rating: 4.95,
    isVerified: true,
  });

  const [stats, setStats] = useState({
    totalCourses: 2,
    publishedCourses: 1,
    draftCourses: 1,
    totalStudents: 1240,
    totalLessons: 48,
    estimatedEarnings: 607600000,
    averageRating: 4.95,
  });

  // Courses List
  const [courses, setCourses] = useState([
    {
      id: 'course-1',
      title: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
      slug: 'nextjs-va-nestjs-bilan-zamonaviy-platforma',
      status: 'PUBLISHED',
      price: 490000,
      originalPrice: 750000,
      level: 'O‘rta / Yuqori',
      categoryName: 'Dasturlash & IT',
      studentsCount: 1240,
      lessonsCount: 48,
      rating: 4.95,
      createdAt: '2026-10-15',
    },
    {
      id: 'course-2',
      title: 'Fullstack JavaScript va Docker Masterclass',
      slug: 'fullstack-javascript-va-docker',
      status: 'DRAFT',
      price: 550000,
      originalPrice: 800000,
      level: 'Yuqori',
      categoryName: 'Dasturlash & IT',
      studentsCount: 0,
      lessonsCount: 12,
      rating: 5.0,
      createdAt: '2026-11-01',
    },
  ]);

  // Selected Course for Editing / Lessons
  const [selectedCourseId, setSelectedCourseId] = useState('course-1');
  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Lessons State for selected course
  const [lessons, setLessons] = useState([
    {
      id: 'les-1',
      title: '1. Kirish va Monorepo Loyihalash',
      moduleTitle: '1-Modul: Loyiha Poydevori',
      duration: '14:20',
      durationSec: 860,
      isFree: true,
      order: 1,
    },
    {
      id: 'les-2',
      title: '2. Next.js App Router va RSC',
      moduleTitle: '1-Modul: Loyiha Poydevori',
      duration: '22:45',
      durationSec: 1365,
      isFree: false,
      order: 2,
    },
    {
      id: 'les-3',
      title: '3. NestJS Backend va Prisma ORM',
      moduleTitle: '2-Modul: Maʼlumotlar Bazasi',
      duration: '28:10',
      durationSec: 1690,
      isFree: false,
      order: 3,
    },
  ]);

  // Students enrolled
  const [students, setStudents] = useState([
    {
      id: 'enr-1',
      studentName: 'Nodir Zokirov',
      email: 'nodir@mail.uz',
      phone: '+998 90 111 22 33',
      courseTitle: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
      progressPct: 65,
      enrolledAt: '2026-11-10',
    },
    {
      id: 'enr-2',
      studentName: 'Madina Usmanova',
      email: 'madina@mail.uz',
      phone: '+998 93 444 55 66',
      courseTitle: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
      progressPct: 100,
      enrolledAt: '2026-11-02',
    },
    {
      id: 'enr-3',
      studentName: 'Aziz Rahimov',
      email: 'aziz@mail.uz',
      phone: '+998 97 777 88 99',
      courseTitle: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
      progressPct: 35,
      enrolledAt: '2026-11-14',
    },
  ]);

  // Reviews
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      studentName: 'Nodir Zokirov',
      courseTitle: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
      rating: 5,
      comment: 'Arxitektura va kod sifati juda aʼlo darajada tushuntirilgan. Rahmat!',
      createdAt: '2 kun oldin',
    },
    {
      id: 'rev-2',
      studentName: 'Madina Usmanova',
      courseTitle: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
      rating: 5,
      comment: 'Barcha modullar amaliy loyiha asosida berilgan. Tavsiya qilaman!',
      createdAt: '1 hafta oldin',
    },
  ]);

  // Create Course Form State
  const [newCourse, setNewCourse] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Dasturlash & IT',
    level: 'Boshlang‘ich',
    language: 'uz',
    price: '',
    originalPrice: '',
    isFree: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  });

  // Edit Course Form State
  const [editCourseData, setEditCourseData] = useState({ ...selectedCourse });

  useEffect(() => {
    if (selectedCourse) {
      setEditCourseData({ ...selectedCourse });
    }
  }, [selectedCourse]);

  // New Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    moduleTitle: '1-Modul: Asoslar',
    durationSec: 900,
    videoUrl: 'https://video.stream/sample.mp4',
    content: '',
    isFree: false,
  });

  // Verification Form State
  const [verificationForm, setVerificationForm] = useState({
    headline: 'Senior Fullstack Dasturchi',
    specialty: 'Dasturlash va Veb Texnologiyalar',
    experienceYears: 8,
    documentUrl: 'https://cdn.talim.uz/docs/passport.pdf',
    certificateUrl: 'https://cdn.talim.uz/certs/diploma.pdf',
  });

  // Fetch Teacher Data from Backend
  useEffect(() => {
    async function loadTeacherData() {
      setLoading(true);
      try {
        const res = await api.teacher.getDashboard();
        if (res.success && res.data) {
          if (res.data.profile) setTeacherProfile((p) => ({ ...p, ...res.data.profile }));
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.courses?.length > 0) setCourses(res.data.courses);
          if (res.data.recentEnrollments?.length > 0) setStudents(res.data.recentEnrollments);
          if (res.data.recentReviews?.length > 0) setReviews(res.data.recentReviews);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeacherData();
  }, []);

  const handleTabChange = (id) => {
    setActiveTab(id);
    router.replace(`/teacher/dashboard?tab=${id}`);
  };

  // Toggle Course Publish
  const handleTogglePublish = async (courseId, currentStatus) => {
    const isPublishing = currentStatus !== 'PUBLISHED';
    try {
      if (courseId && !courseId.startsWith('course-demo') && !courseId.startsWith('c-')) {
        await api.teacher.togglePublish(courseId, isPublishing);
      }
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, status: isPublishing ? 'PUBLISHED' : 'DRAFT' } : c
        )
      );
      toast({
        title: isPublishing ? 'Kurs chop etildi!' : 'Kurs qoralamaga o‘tkazildi',
        description: isPublishing
          ? 'Kurs ommaviy katalogda ko‘rinadigan bo‘ldi.'
          : 'Kurs endi faqat sizga ko‘rinadi.',
        type: 'success',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  // Create Course Action
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title.trim()) {
      toast({ title: 'Xatolik', description: 'Kurs nomini kiriting', type: 'error' });
      return;
    }

    try {
      const apiRes = await api.teacher.createCourse({
        title: newCourse.title,
        subtitle: newCourse.subtitle,
        description: newCourse.description || newCourse.title,
        price: Number(newCourse.price) || 0,
        originalPrice: Number(newCourse.originalPrice) || null,
        level: newCourse.level,
        language: newCourse.language || 'uz',
        isFree: newCourse.isFree,
      });

      const created = {
        id: apiRes.data?.id || `course-${Date.now()}`,
        title: newCourse.title,
        slug: apiRes.data?.slug || newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: 'DRAFT',
        price: Number(newCourse.price) || 0,
        originalPrice: Number(newCourse.originalPrice) || null,
        level: newCourse.level,
        categoryName: newCourse.category,
        studentsCount: 0,
        lessonsCount: 0,
        rating: 5.0,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setCourses([created, ...courses]);
      setStats((s) => ({ ...s, totalCourses: s.totalCourses + 1, draftCourses: s.draftCourses + 1 }));

      toast({
        title: 'Kurs yaratildi!',
        description: 'Yangi kurs bazada qoralama sifatida saqlandi.',
        type: 'success',
      });

      handleTabChange('courses');
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  // Edit Course Action
  const handleSaveCourseEdit = async (e) => {
    e.preventDefault();
    try {
      if (editCourseData.id && !editCourseData.id.startsWith('course-demo')) {
        await api.teacher.updateCourse(editCourseData.id, editCourseData);
      }
      setCourses((prev) =>
        prev.map((c) => (c.id === editCourseData.id ? { ...c, ...editCourseData } : c))
      );
      toast({
        title: 'Kurs yangilandi',
        description: 'Kurs maʼlumotlari muvaffaqiyatli saqlandi.',
        type: 'success',
      });
      handleTabChange('courses');
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  // Add Lesson Action
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title.trim()) return;

    try {
      const apiRes = await api.teacher.createLesson({
        courseId: selectedCourseId,
        title: newLesson.title,
        moduleTitle: newLesson.moduleTitle,
        durationSec: newLesson.durationSec,
        videoUrl: newLesson.videoUrl,
        content: newLesson.content,
        isFree: newLesson.isFree,
      });

      const createdLesson = {
        id: apiRes.data?.id || `les-${Date.now()}`,
        title: newLesson.title,
        moduleTitle: newLesson.moduleTitle,
        duration: `${Math.floor(newLesson.durationSec / 60)}:00`,
        durationSec: newLesson.durationSec,
        isFree: newLesson.isFree,
        order: lessons.length + 1,
      };

      setLessons([...lessons, createdLesson]);
      setIsLessonModalOpen(false);
      setNewLesson({
        title: '',
        moduleTitle: '1-Modul: Asoslar',
        durationSec: 900,
        videoUrl: 'https://video.stream/sample.mp4',
        content: '',
        isFree: false,
      });

      toast({
        title: 'Dars qo‘shildi!',
        description: 'Yangi dars kurs mundarijasiga biriktirildi.',
        type: 'success',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId) => {
    try {
      if (lessonId && !lessonId.startsWith('les-demo') && !lessonId.startsWith('les-1')) {
        await api.teacher.deleteLesson(lessonId);
      }
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      toast({
        title: 'Dars o‘chirildi',
        description: 'Tanlangan dars kursdan olib tashlandi.',
        type: 'info',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  // Verification Submit
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.teacher.applyVerification(verificationForm);
      toast({
        title: 'Ariza topshirildi!',
        description: 'Hujjatlaringiz moderatorlar tomonidan ko‘rib chiqiladi.',
        type: 'success',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#070E22] pb-20">
      {/* Top Banner */}
      <section className="bg-navy-950 dark:bg-[#040816] text-white border-b border-navy-900 dark:border-navy-900/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={teacherProfile.fullName} size="xl" className="border-2 border-turquoise-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {teacherProfile.fullName}
                  </h1>
                  {teacherProfile.isVerified ? (
                    <Badge variant="turquoise" size="xs">
                      Tasdiqlangan Ustoz
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="xs">
                      Kutilmoqda
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-200 mt-0.5">{teacherProfile.headline}</p>
                <div className="flex items-center gap-4 text-xs text-slate-200 mt-1 font-medium">
                  <span>Mutaxassislik: {teacherProfile.specialty}</span>
                  <span>•</span>
                  <span>Tajriba: {teacherProfile.experienceYears} yil</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-300" /> {teacherProfile.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={() => handleTabChange('create-course')}
                className="bg-royal-600 hover:bg-royal-700 text-white shadow-md shadow-royal-600/30"
              >
                Yangi Kurs Yaratish
              </Button>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-royal-700 hover:bg-royal-800 text-white border-royal-600 dark:bg-royal-600 dark:hover:bg-royal-700 dark:text-white dark:border-royal-500 shadow-sm"
                >
                  Talaba Kabineti
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white dark:bg-[#0B1536] p-3 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle sticky top-28">
            <nav className="flex flex-col gap-1">
              {TEACHER_SECTIONS.map((sec) => {
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
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Workspace Stage */}
          <main className="lg:col-span-9 flex flex-col gap-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">Jami O‘quvchilar</span>
                    <span className="text-2xl font-extrabold text-navy-950 dark:text-white mt-1">
                      {formatNumber(stats.totalStudents)} ta
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                      +45 ta bu oyda
                    </span>
                  </div>

                  <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">Mening Kurslarim</span>
                    <span className="text-2xl font-extrabold text-royal-600 dark:text-royal-400 mt-1">
                      {stats.totalCourses} ta
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                      {stats.publishedCourses} faol • {stats.draftCourses} qoralama
                    </span>
                  </div>

                  <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">Taxminiy Daromad</span>
                    <span className="text-2xl font-extrabold text-navy-950 dark:text-white mt-1 truncate">
                      {(stats.estimatedEarnings / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">so‘m (brutto)</span>
                  </div>

                  <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">O‘rtacha Reyting</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-2xl font-extrabold text-amber-500">
                        {stats.averageRating}
                      </span>
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Aʼlo fikrlar</span>
                  </div>
                </div>

                {/* Recent Students Table */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-navy-950">So‘nggi aʼzo bo‘lgan talabalar</h3>
                    <button
                      type="button"
                      onClick={() => handleTabChange('students')}
                      className="text-xs text-royal-700 font-semibold hover:underline"
                    >
                      Barcha talabalar
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider pb-2">
                          <th className="py-2.5 font-bold">Talaba</th>
                          <th className="py-2.5 font-bold">Kurs</th>
                          <th className="py-2.5 font-bold">Progress</th>
                          <th className="py-2.5 font-bold">Sana</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.slice(0, 4).map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-semibold text-navy-950 flex items-center gap-2.5">
                              <Avatar name={s.studentName} size="xs" />
                              <span>{s.studentName}</span>
                            </td>
                            <td className="py-3 text-slate-700 font-medium line-clamp-1">{s.courseTitle}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${s.progressPct}%` }}
                                  />
                                </div>
                                <span className="font-mono text-xs font-bold text-navy-900">
                                  {s.progressPct}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-600 font-mono text-xs font-medium">
                              {s.enrolledAt}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Recent Reviews */}
                <Card className="p-5">
                  <h3 className="text-sm font-bold text-navy-950 mb-3">O‘quvchilar fikrlari</h3>
                  <div className="flex flex-col gap-3">
                    {reviews.slice(0, 2).map((r) => (
                      <div key={r.id} className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-navy-950">{r.studentName}</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-500">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* 2. MY COURSES TAB */}
            {activeTab === 'courses' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-navy-950">Barcha Kurslarim</h2>
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<PlusCircle className="w-4 h-4" />}
                    onClick={() => handleTabChange('create-course')}
                  >
                    Kurs yaratish
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {courses.map((course) => (
                    <Card key={course.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant={course.status === 'PUBLISHED' ? 'turquoise' : 'warning'}
                            size="xs"
                          >
                            {course.status === 'PUBLISHED' ? 'Chop etilgan' : 'Qoralama (Draft)'}
                          </Badge>
                          <Badge variant="outline" size="xs">
                            {course.categoryName}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-600">{course.level}</span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-navy-950">
                          {course.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium mt-2">
                          <span>{course.studentsCount} ta o‘quvchi</span>
                          <span>•</span>
                          <span>{course.lessonsCount} ta dars</span>
                          <span>•</span>
                          <span className="font-bold text-navy-900">
                            {formatNumber(course.price)} so‘m
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            handleTabChange('lessons');
                          }}
                        >
                          Darslar ({course.lessonsCount})
                        </Button>

                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            handleTabChange('edit-course');
                          }}
                        >
                          Tahrirlash
                        </Button>

                        <Button
                          size="xs"
                          variant={course.status === 'PUBLISHED' ? 'secondary' : 'primary'}
                          onClick={() => handleTogglePublish(course.id, course.status)}
                        >
                          {course.status === 'PUBLISHED' ? 'Qoralamaga olish' : 'Chop etish'}
                        </Button>

                        <Link href={`/courses/${course.slug}`}>
                          <Button size="xs" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            Saytda
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 3. CREATE COURSE TAB */}
            {activeTab === 'create-course' && (
              <Card className="p-6">
                <h2 className="text-base font-bold text-navy-950 mb-1">Yangi Kurs Yaratish</h2>
                <p className="text-xs text-muted-500 mb-6">
                  Kurs yaratilgach darhol Qoralama (Draft) rejimida saqlanadi. Darslar to‘liq yuklangach uni chop etishingiz mumkin.
                </p>

                <form onSubmit={handleCreateCourse} className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">Kurs Nomi</label>
                    <input
                      type="text"
                      placeholder="Masalan: Next.js va NestJS bilan Zamonaviy Platforma"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">Qisqa Subtitr</label>
                    <input
                      type="text"
                      placeholder="Masalan: Noldan professional darajagacha amaliy loyiha"
                      value={newCourse.subtitle}
                      onChange={(e) => setNewCourse({ ...newCourse, subtitle: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Yo‘nalish (Kategoriya)</label>
                      <select
                        value={newCourse.category}
                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-navy-950"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Daraja</label>
                      <select
                        value={newCourse.level}
                        onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-navy-950"
                      >
                        <option value="Boshlang‘ich">Boshlang‘ich</option>
                        <option value="O‘rta">O‘rta daraja</option>
                        <option value="Yuqori">Yuqori daraja</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Narxi (so‘m)</label>
                      <input
                        type="number"
                        placeholder="Masalan: 490000"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">Kurs Haqida To‘liq Tavsif</label>
                    <textarea
                      rows={4}
                      placeholder="Kursning maqsadi, o‘rganiladigan texnologiyalar va kutilayotgan natijalar..."
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <Button type="button" variant="secondary" size="sm" onClick={() => handleTabChange('courses')}>
                      Bekor qilish
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Kursni Qoralama Sifatida Saqlash
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* 4. EDIT COURSE TAB */}
            {activeTab === 'edit-course' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-navy-950">Kurs Maʼlumotlarini Tahrirlash</h2>
                    <p className="text-xs text-muted-500">Kurs: {editCourseData.title}</p>
                  </div>

                  {/* Course Picker */}
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleSaveCourseEdit} className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">Sarlavha</label>
                    <input
                      type="text"
                      value={editCourseData.title || ''}
                      onChange={(e) => setEditCourseData({ ...editCourseData, title: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Narxi (so‘m)</label>
                      <input
                        type="number"
                        value={editCourseData.price || 0}
                        onChange={(e) =>
                          setEditCourseData({ ...editCourseData, price: Number(e.target.value) })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Holati</label>
                      <select
                        value={editCourseData.status}
                        onChange={(e) => setEditCourseData({ ...editCourseData, status: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <option value="DRAFT">Qoralama (Draft)</option>
                        <option value="PUBLISHED">Chop etilgan (Published)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="sm">
                      O‘zgarishlarni Saqlash
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* 5. LESSONS TAB */}
            {activeTab === 'lessons' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-navy-950">Darslar Mundarijasini Boshqarish</h2>
                    <p className="text-xs text-muted-500">Tanlangan kurs: {selectedCourse.title}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                      onClick={() => setIsLessonModalOpen(true)}
                    >
                      Dars qo‘shish
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-card-subtle flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-royal-50 text-royal-700 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-navy-950 block">{lesson.title}</span>
                          <span className="text-xs text-slate-600 font-medium">
                            {lesson.moduleTitle} • {lesson.duration} •{' '}
                            {lesson.isFree ? (
                              <strong className="text-emerald-700 font-bold">Bepul preview</strong>
                            ) : (
                              'Pullik dars'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. STUDENTS TAB */}
            {activeTab === 'students' && (
              <Card className="p-5">
                <h2 className="text-base font-bold text-navy-950 mb-3">Kurslarimga Aʼzo O‘quvchilar</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider pb-2">
                        <th className="py-2.5 font-bold">Talaba</th>
                        <th className="py-2.5 font-bold">Bog‘lanish</th>
                        <th className="py-2.5 font-bold">Kurs Nomi</th>
                        <th className="py-2.5 font-bold">Progress</th>
                        <th className="py-2.5 font-bold">Aʼzo bo‘lgan sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-semibold text-navy-950 flex items-center gap-2.5">
                            <Avatar name={s.studentName} size="xs" />
                            <span>{s.studentName}</span>
                          </td>
                          <td className="py-3 text-slate-700 font-medium">
                            <span>{s.email}</span>
                            <span className="block text-xs text-slate-600 font-mono mt-0.5">{s.phone}</span>
                          </td>
                          <td className="py-3 text-navy-950 font-semibold">{s.courseTitle}</td>
                          <td className="py-3">
                            <span className="font-bold text-emerald-700 font-mono">{s.progressPct}%</span>
                          </td>
                          <td className="py-3 text-slate-600 font-mono text-xs font-medium">{s.enrolledAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* 7. ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-base font-bold text-navy-950">Ustoz Ko‘rsatkichlari va Analitika</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
                    <span className="text-xs text-slate-700 font-semibold block">Jami Talabalar Bazasi</span>
                    <span className="text-2xl font-extrabold text-navy-950 mt-1 block">1,240 ta</span>
                    <span className="text-xs text-emerald-700 mt-0.5 block font-semibold">92% faol tinglovchilar</span>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
                    <span className="text-xs text-slate-700 font-semibold block">Kurslarni Tugatish Ko‘rsatkichi</span>
                    <span className="text-2xl font-extrabold text-royal-700 mt-1 block">78.4%</span>
                    <span className="text-xs text-slate-600 font-medium mt-0.5 block">Bozor o‘rtachasidan yuqori</span>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
                    <span className="text-xs text-slate-700 font-semibold block">Sharhlar Reytingi</span>
                    <span className="text-2xl font-extrabold text-amber-500 mt-1 block">4.95 / 5.0</span>
                    <span className="text-xs text-slate-600 font-medium mt-0.5 block">184 ta ijobiy baho</span>
                  </div>
                </div>
              </div>
            )}

            {/* 8. REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-navy-950">O‘quvchilar Sharhlari</h2>
                <div className="flex flex-col gap-3">
                  {reviews.map((r) => (
                    <Card key={r.id} className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar name={r.studentName} size="xs" />
                          <div>
                            <span className="text-xs font-bold text-navy-950 block">{r.studentName}</span>
                            <span className="text-xs text-slate-600 font-medium">{r.courseTitle}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-navy-800 mt-1 leading-relaxed">{r.comment}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 9. VERIFICATION TAB */}
            {activeTab === 'verification' && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-turquoise-50 text-turquoise-600 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-navy-950">Ustozlik Verifikatsiyasi</h2>
                    <span className="text-xs text-emerald-600 font-semibold block">
                      Holat: {teacherProfile.isVerified ? 'Muvaffaqiyatli Tasdiqlangan' : 'Kutilmoqda'}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">Mutaxassislik va Yo‘nalish</label>
                    <input
                      type="text"
                      value={verificationForm.specialty}
                      onChange={(e) => setVerificationForm({ ...verificationForm, specialty: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Tajriba (yillarda)</label>
                      <input
                        type="number"
                        value={verificationForm.experienceYears}
                        onChange={(e) =>
                          setVerificationForm({
                            ...verificationForm,
                            experienceYears: Number(e.target.value),
                          })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-navy-900 block mb-1">Diplom yoki Sertifikat Havolasi</label>
                      <input
                        type="text"
                        value={verificationForm.certificateUrl}
                        onChange={(e) =>
                          setVerificationForm({ ...verificationForm, certificateUrl: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="sm">
                      Arizani yangilash
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* 10. PROFILE TAB */}
            {activeTab === 'profile' && (
              <Card className="p-6">
                <h2 className="text-base font-bold text-navy-950 mb-4">Ustoz Profilini Tahrirlash</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast({ title: 'Profil saqlandi', type: 'success' });
                  }}
                  className="flex flex-col gap-4 text-xs"
                >
                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">To‘liq Ismingiz</label>
                    <input
                      type="text"
                      value={teacherProfile.fullName}
                      onChange={(e) => setTeacherProfile({ ...teacherProfile, fullName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">Sarlavha (Headline)</label>
                    <input
                      type="text"
                      value={teacherProfile.headline}
                      onChange={(e) => setTeacherProfile({ ...teacherProfile, headline: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-navy-900 block mb-1">Biografiya va Tajriba</label>
                    <textarea
                      rows={3}
                      value={teacherProfile.bio}
                      onChange={(e) => setTeacherProfile({ ...teacherProfile, bio: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="sm">
                      Saqlash
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title="Yangi Dars Qo‘shish"
        description={`${selectedCourse.title} kursiga amaliy dars biriktirish.`}
      >
        <form onSubmit={handleAddLesson} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="font-semibold text-navy-900 block mb-1">Dars Nomi</label>
            <input
              type="text"
              placeholder="Masalan: 4. Redis bilan keshlash"
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-navy-900 block mb-1">Modul Nomi</label>
              <input
                type="text"
                value={newLesson.moduleTitle}
                onChange={(e) => setNewLesson({ ...newLesson, moduleTitle: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
              />
            </div>
            <div>
              <label className="font-semibold text-navy-900 block mb-1">Davomiyligi (sekundda)</label>
              <input
                type="number"
                value={newLesson.durationSec}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, durationSec: Number(e.target.value) })
                }
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-navy-900 block mb-1">Video Havolasi (URL)</label>
            <input
              type="text"
              value={newLesson.videoUrl}
              onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isFreeLesson"
              checked={newLesson.isFree}
              onChange={(e) => setNewLesson({ ...newLesson, isFree: e.target.checked })}
              className="w-4 h-4 accent-royal-600 cursor-pointer"
            />
            <label htmlFor="isFreeLesson" className="text-xs text-navy-900 cursor-pointer">
              Ushbu dars bepul tanishtiruv (preview) sifatida ochiq bo‘lsin
            </label>
          </div>

          <ModalFooter>
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsLessonModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Darsni Saqlash
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

export default function TeacherDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-muted-500">Ustoz kabineti yuklanmoqda...</span>
        </div>
      }
    >
      <TeacherDashboardContent />
    </Suspense>
  );
}
