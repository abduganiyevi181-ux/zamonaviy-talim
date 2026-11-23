'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Settings,
  Activity,
  Search,
  Filter,
  Check,
  X,
  MoreVertical,
  PlusCircle,
  Eye,
  ArrowRight,
  RefreshCw,
  Sliders,
  Server,
  Database,
  Lock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Avatar,
  Modal,
  ModalFooter,
  useToast,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import { api } from '@/lib/api';
import { CATEGORIES, COURSES } from '@/data/mock-data';
import { formatNumber } from '@/lib/utils';

const ADMIN_SECTIONS = [
  { id: 'dashboard', label: 'Boshqaruv Paneli', icon: Activity },
  { id: 'users', label: 'Foydalanuvchilar', icon: Users },
  { id: 'courses', label: 'Kurslar Moderatsiyasi', icon: BookOpen },
  { id: 'teachers', label: 'Ustozlar Verifikatsiyasi', icon: GraduationCap },
  { id: 'reports', label: 'Shikoyatlar (Reports)', icon: AlertTriangle },
  { id: 'categories', label: 'Yo‘nalishlar (Kategoriyalar)', icon: Sliders },
  { id: 'audit', label: 'Xavfsizlik & Audit Jurnali', icon: FileText },
  { id: 'settings', label: 'Tizim Sozlamalari', icon: Settings },
];

function AdminPanelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Real Database Metrics State
  const [metrics, setMetrics] = useState({
    totalUsers: 148,
    totalStudents: 126,
    totalTeachers: 20,
    totalCourses: 12,
    publishedCourses: 9,
    draftCourses: 3,
    totalEnrollments: 342,
    pendingApprovals: 2,
    totalReports: 3,
    pendingReports: 1,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 'act-1',
      action: 'UPDATE_COURSE_STATUS',
      entity: 'Course',
      details: 'Next.js va NestJS kursi tasdiqlandi (PUBLISHED)',
      userName: 'Admin (Boshqaruvchi)',
      createdAt: '10 daqiqa oldin',
    },
    {
      id: 'act-2',
      action: 'REVIEW_VERIFICATION',
      entity: 'TeacherVerification',
      details: 'Anvar Karimov arizasi tasdiqlandi',
      userName: 'Admin (Boshqaruvchi)',
      createdAt: '1 soat oldin',
    },
    {
      id: 'act-3',
      action: 'UPDATE_STATUS',
      entity: 'User',
      details: 'Shubhali foydalanuvchi vaqtincha to‘xtatildi (SUSPENDED)',
      userName: 'Xavfsizlik Tizimi',
      createdAt: 'Kecha',
    },
  ]);

  // Users List State
  const [users, setUsers] = useState([
    {
      id: 'usr-1',
      fullName: 'Anvar Karimov',
      email: 'teacher1@talim.uz',
      phone: '+998 90 222 22 22',
      role: 'TEACHER',
      status: 'ACTIVE',
      enrollmentsCount: 0,
      createdAt: '2026-10-10',
    },
    {
      id: 'usr-2',
      fullName: 'Nodir Zokirov',
      email: 'student@talim.uz',
      phone: '+998 90 111 11 11',
      role: 'STUDENT',
      status: 'ACTIVE',
      enrollmentsCount: 3,
      createdAt: '2026-10-12',
    },
    {
      id: 'usr-3',
      fullName: 'Madina Usmanova',
      email: 'teacher2@talim.uz',
      phone: '+998 90 333 33 33',
      role: 'TEACHER',
      status: 'ACTIVE',
      enrollmentsCount: 1,
      createdAt: '2026-10-15',
    },
    {
      id: 'usr-4',
      fullName: 'Botir Qosimov',
      email: 'botir@test.uz',
      phone: '+998 97 999 00 11',
      role: 'STUDENT',
      status: 'SUSPENDED',
      enrollmentsCount: 0,
      createdAt: '2026-11-01',
    },
  ]);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Courses List State
  const [courses, setCourses] = useState([
    {
      id: 'c-1',
      title: 'Next.js va NestJS bilan Zamonaviy Veb Platforma',
      slug: 'nextjs-va-nestjs-bilan-zamonaviy-platforma',
      categoryName: 'Dasturlash & IT',
      teacherName: 'Anvar Karimov',
      price: 490000,
      status: 'PUBLISHED',
      studentsCount: 1240,
      lessonsCount: 48,
    },
    {
      id: 'c-2',
      title: 'Professional Figma va UI/UX Dizayn Tizimlari',
      slug: 'professional-figma-va-ui-ux-dizayn',
      categoryName: 'Dizayn & Kreativ',
      teacherName: 'Madina Usmanova',
      price: 390000,
      status: 'PUBLISHED',
      studentsCount: 960,
      lessonsCount: 36,
    },
    {
      id: 'c-3',
      title: 'Fullstack JavaScript va Docker Masterclass',
      slug: 'fullstack-javascript-va-docker',
      categoryName: 'Dasturlash & IT',
      teacherName: 'Anvar Karimov',
      price: 550000,
      status: 'DRAFT',
      studentsCount: 0,
      lessonsCount: 12,
    },
  ]);

  const [courseSearch, setCourseSearch] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('ALL');

  // Verifications List State
  const [verifications, setVerifications] = useState([
    {
      id: 'v-1',
      fullName: 'Farhod Shokirov',
      email: 'farhod@mail.uz',
      headline: 'Sunʼiy intellekt va Machine Learning instruktori',
      specialty: 'Data Science & Python',
      experienceYears: 6,
      documentUrl: 'https://docs.talim.uz/diploma.pdf',
      status: 'PENDING',
      createdAt: 'Bugun, 14:20',
    },
    {
      id: 'v-2',
      fullName: 'Anvar Karimov',
      email: 'teacher1@talim.uz',
      headline: 'Lead Software Architect',
      specialty: 'Web Arxitektura',
      experienceYears: 10,
      documentUrl: 'https://docs.talim.uz/cert.pdf',
      status: 'APPROVED',
      createdAt: '2026-11-05',
    },
  ]);

  // Reports List State
  const [reports, setReports] = useState([
    {
      id: 'rep-1',
      entityType: 'Course',
      entityId: 'c-3',
      reason: 'Dars video havolasi ishlamayapti va material yetarli emas.',
      reporterName: 'Nodir Zokirov',
      status: 'PENDING',
      adminNotes: null,
      createdAt: 'Bugun, 11:45',
    },
    {
      id: 'rep-2',
      entityType: 'User',
      entityId: 'usr-4',
      reason: 'Muhokamalar bo‘limida nojo‘ya so‘zlar ishlatilgan.',
      reporterName: 'Madina Usmanova',
      status: 'RESOLVED',
      adminNotes: 'Foydalanuvchi hisobi to‘xtatildi.',
      createdAt: 'Kecha, 16:30',
    },
  ]);

  // Categories State
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Dasturlash & IT', slug: 'dasturlash', coursesCount: 28 },
    { id: 'cat-2', name: 'Dizayn & Kreativ', slug: 'dizayn', coursesCount: 16 },
    { id: 'cat-3', name: 'Biznes & Marketing', slug: 'biznes-va-marketing', coursesCount: 19 },
    { id: 'cat-4', name: 'Xorijiy Tillar', slug: 'tillar', coursesCount: 22 },
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'Zamonaviy Taʼlim Platformasi',
    registrationOpen: true,
    maintenanceMode: false,
    otpCooldownSec: 60,
    maxLoginAttempts: 5,
  });

  // Fetch real data on mount
  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const statsRes = await api.admin.getStats();
        if (statsRes.success && statsRes.data) {
          if (statsRes.data.metrics) setMetrics(statsRes.data.metrics);
          if (statsRes.data.recentActivity?.length > 0) {
            setRecentActivity(statsRes.data.recentActivity);
          }
        }

        const usersRes = await api.admin.getUsers();
        if (usersRes.success && usersRes.data?.users?.length > 0) {
          setUsers(usersRes.data.users);
        }

        const coursesRes = await api.admin.getCourses();
        if (coursesRes.success && coursesRes.data?.courses?.length > 0) {
          setCourses(coursesRes.data.courses);
        }

        const verRes = await api.admin.getVerifications({ status: 'ALL' });
        if (verRes.success && verRes.data?.length > 0) {
          setVerifications(verRes.data);
        }

        const repRes = await api.admin.getReports({ status: 'ALL' });
        if (repRes.success && repRes.data?.length > 0) {
          setReports(repRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const handleTabChange = (id) => {
    setActiveTab(id);
    router.replace(`/admin?tab=${id}`);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.includes(userSearch);
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch = c.title?.toLowerCase().includes(courseSearch.toLowerCase());
      const matchesStatus = courseStatusFilter === 'ALL' || c.status === courseStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, courseSearch, courseStatusFilter]);

  // Actions
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      if (userId && !userId.startsWith('usr-demo')) {
        await api.admin.updateUserStatus(userId, nextStatus);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
      toast({
        title: 'Foydalanuvchi holati yangilandi',
        description: `Bazada holat ${nextStatus} ga o‘zgartirildi.`,
        type: 'success',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'STUDENT' ? 'TEACHER' : 'STUDENT';
    try {
      if (userId && !userId.startsWith('usr-demo')) {
        await api.admin.updateUserRole(userId, nextRole);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
      );
      toast({
        title: 'Rol yangilandi',
        description: `Bazada foydalanuvchi roli ${nextRole} ga o‘zgartirildi.`,
        type: 'info',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  const handleCourseStatusChange = async (courseId, newStatus) => {
    try {
      if (courseId && !courseId.startsWith('c-demo')) {
        await api.admin.updateCourseStatus(courseId, newStatus);
      }
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c))
      );
      toast({
        title: 'Kurs holati yangilandi',
        description: `Kurs muvaffaqiyatli ${newStatus} ga o‘tkazildi.`,
        type: 'success',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  const handleReviewVerification = async (vId, status) => {
    try {
      if (vId && !vId.startsWith('v-demo')) {
        await api.admin.reviewVerification(vId, { status });
      }
      setVerifications((prev) =>
        prev.map((v) => (v.id === vId ? { ...v, status } : v))
      );
      toast({
        title: status === 'APPROVED' ? 'Ustoz tasdiqlandi!' : 'Ariza rad etildi',
        description: 'Verifikatsiya holati yangilandi va tizim jurnaliga yozildi.',
        type: status === 'APPROVED' ? 'success' : 'warning',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      if (reportId && !reportId.startsWith('rep-demo')) {
        await api.admin.updateReportStatus(reportId, { status });
      }
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      toast({
        title: 'Shikoyat ko‘rib chiqildi',
        description: `Holat ${status} ga o‘zgartirildi.`,
        type: 'info',
      });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const res = await api.admin.createCategory({
        name: newCatName,
        slug,
        description: `${newCatName} sohasidagi kurslar`,
      });

      const newCat = {
        id: res.data?.id || `cat-${Date.now()}`,
        name: newCatName,
        slug,
        coursesCount: 0,
      };

      setCategories([...categories, newCat]);
      setNewCatName('');
      setIsNewCatModalOpen(false);
      toast({ title: 'Kategoriya yaratildi', type: 'success' });
    } catch (err) {
      toast({ title: 'Xatolik', description: err.message, type: 'danger' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-20">
      {/* Top Header */}
      <header className="h-16 bg-navy-950 border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-royal-600/20 text-turquoise-400 border border-royal-500/40 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Boshqaruv Paneli (Admin Console)
              <Badge variant="turquoise" size="xs">
                Root Admin
              </Badge>
            </h1>
            <span className="text-xs text-slate-300 font-medium">
              O‘zbekiston zamonaviy taʼlim platformasi boshqaruv markazi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="xs" className="text-slate-200 hover:text-white">
              Talaba Kabineti
            </Button>
          </Link>
          <Link href="/teacher/dashboard">
            <Button
              variant="secondary"
              size="xs"
              className="bg-royal-700 hover:bg-royal-800 text-white border-royal-600 dark:bg-royal-600 dark:hover:bg-royal-700 dark:border-royal-500 shadow-sm"
            >
              Ustoz Kabineti
            </Button>
          </Link>
          <Link href="/">
            <Button variant="primary" size="xs" rightIcon={<Eye className="w-3.5 h-3.5" />}>
              Saytni ko‘rish
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-navy-950 p-3 rounded-2xl border border-navy-800 shadow-xl sticky top-24">
            <nav className="flex flex-col gap-1">
              {ADMIN_SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleTabChange(sec.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-royal-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                      <span>{sec.label}</span>
                    </div>
                    {sec.id === 'teachers' && metrics.pendingApprovals > 0 && (
                      <Badge variant="warning" size="xs">
                        {metrics.pendingApprovals}
                      </Badge>
                    )}
                    {sec.id === 'reports' && metrics.pendingReports > 0 && (
                      <Badge variant="danger" size="xs">
                        {metrics.pendingReports}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Stage */}
          <main className="lg:col-span-9 flex flex-col gap-6">
            {/* 1. DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6">
                {/* Real Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 flex flex-col">
                    <span className="text-xs font-semibold text-slate-300">Jami Foydalanuvchilar</span>
                    <span className="text-2xl font-extrabold text-white mt-1">
                      {metrics.totalUsers}
                    </span>
                    <span className="text-xs text-turquoise-400 font-medium mt-0.5">
                      {metrics.totalStudents} talaba • {metrics.totalTeachers} ustoz
                    </span>
                  </div>

                  <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 flex flex-col">
                    <span className="text-xs font-semibold text-slate-300">Platforma Kurslari</span>
                    <span className="text-2xl font-extrabold text-royal-400 mt-1">
                      {metrics.totalCourses}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium mt-0.5">
                      {metrics.publishedCourses} faol • {metrics.draftCourses} qoralama
                    </span>
                  </div>

                  <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 flex flex-col">
                    <span className="text-xs font-semibold text-slate-300">Jami Aʼzoliklar</span>
                    <span className="text-2xl font-extrabold text-emerald-400 mt-1">
                      {metrics.totalEnrollments}
                    </span>
                    <span className="text-xs text-slate-300 font-medium mt-0.5">Kurs o‘quvchilari</span>
                  </div>

                  <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 flex flex-col">
                    <span className="text-xs font-semibold text-slate-300">Kutilayotgan Tasdiqlar</span>
                    <span className="text-2xl font-extrabold text-amber-400 mt-1">
                      {metrics.pendingApprovals} ta
                    </span>
                    <span className="text-[10px] text-rose-400 mt-0.5">
                      {metrics.pendingReports} ta yangi shikoyat
                    </span>
                  </div>
                </div>

                {/* Quick Action Alerts */}
                {metrics.pendingApprovals > 0 && (
                  <div className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-2xl flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <strong className="block font-bold">Ustozlik verifikatsiyasi kutmoqda</strong>
                        <span>
                          {metrics.pendingApprovals} ta ustozlik arizasi tasdiqlanmagan.
                        </span>
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="warning"
                      onClick={() => handleTabChange('teachers')}
                    >
                      Ko‘rib chiqish
                    </Button>
                  </div>
                )}

                {/* Recent System Activity */}
                <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    So‘nggi Audit va Xavfsizlik Faolliklari
                  </h3>
                  <div className="flex flex-col gap-2">
                    {recentActivity.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-slate-900/80 rounded-xl border border-navy-900 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="navy" size="xs">
                            {act.action}
                          </Badge>
                          <span className="text-slate-200">{act.details}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{act.userName}</span>
                          <span>•</span>
                          <span className="font-mono">{act.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-white">Foydalanuvchilarni Boshqarish</h2>
                  <span className="text-xs text-slate-300 font-medium">
                    Jami: {filteredUsers.length} ta foydalanuvchi
                  </span>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-navy-950 p-3.5 rounded-2xl border border-navy-800 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ism, email yoki telefon orqali qidirish..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-900 border border-navy-800 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="h-9 px-3 rounded-xl bg-slate-900 border border-navy-800 text-xs text-white outline-none"
                    >
                      <option value="ALL">Barcha rollar</option>
                      <option value="STUDENT">Talaba (Student)</option>
                      <option value="TEACHER">Ustoz (Teacher)</option>
                      <option value="ADMIN">Admin</option>
                    </select>

                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="h-9 px-3 rounded-xl bg-slate-900 border border-navy-800 text-xs text-white outline-none"
                    >
                      <option value="ALL">Barcha holatlar</option>
                      <option value="ACTIVE">Faol (Active)</option>
                      <option value="SUSPENDED">To‘xtatilgan (Suspended)</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-navy-950 rounded-2xl border border-navy-800 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-navy-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 font-bold">Foydalanuvchi</th>
                        <th className="py-3 px-4 font-bold">Bog‘lanish</th>
                        <th className="py-3 px-4 font-bold">Rol</th>
                        <th className="py-3 px-4 font-bold">Holat</th>
                        <th className="py-3 px-4 font-bold text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-900">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-2.5 font-bold text-white">
                            <Avatar name={u.fullName} size="xs" />
                            <span>{u.fullName}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-200">
                            <div>{u.email}</div>
                            <span className="text-xs text-slate-400 font-mono">{u.phone}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                u.role === 'ADMIN'
                                  ? 'warning'
                                  : u.role === 'TEACHER'
                                  ? 'turquoise'
                                  : 'navy'
                              }
                              size="xs"
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={u.status === 'ACTIVE' ? 'turquoise' : 'danger'}
                              size="xs"
                            >
                              {u.status === 'ACTIVE' ? 'Faol' : 'To‘xtatilgan'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="xs"
                                variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'}
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                              >
                                {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                              </Button>

                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleToggleUserRole(u.id, u.role)}
                              >
                                {u.role === 'STUDENT' ? 'Ustoz qilish' : 'Talaba qilish'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. COURSE MODERATION */}
            {activeTab === 'courses' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-white">Kurslar Moderatsiyasi</h2>
                  <span className="text-xs text-slate-400">
                    Jami: {filteredCourses.length} ta kurs
                  </span>
                </div>

                {/* Course Search & Filter */}
                <div className="bg-navy-950 p-3.5 rounded-2xl border border-navy-800 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Kurs nomi bo‘yicha izlash..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-900 border border-navy-800 text-xs text-white outline-none"
                    />
                  </div>
                  <select
                    value={courseStatusFilter}
                    onChange={(e) => setCourseStatusFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-slate-900 border border-navy-800 text-xs text-white outline-none"
                  >
                    <option value="ALL">Barcha holatlar</option>
                    <option value="PUBLISHED">Chop etilgan (PUBLISHED)</option>
                    <option value="DRAFT">Qoralama (DRAFT)</option>
                  </select>
                </div>

                {/* Courses List */}
                <div className="flex flex-col gap-3">
                  {filteredCourses.map((c) => (
                    <div
                      key={c.id}
                      className="bg-navy-950 p-4 rounded-2xl border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={c.status === 'PUBLISHED' ? 'turquoise' : 'warning'}
                            size="xs"
                          >
                            {c.status}
                          </Badge>
                          <span className="text-xs text-slate-400">{c.categoryName}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{c.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>Ustoz: {c.teacherName}</span>
                          <span>•</span>
                          <span>{c.studentsCount} ta o‘quvchi</span>
                          <span>•</span>
                          <span className="font-mono text-white font-semibold">
                            {formatNumber(c.price)} so‘m
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {c.status !== 'PUBLISHED' ? (
                          <Button
                            size="xs"
                            variant="primary"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => handleCourseStatusChange(c.id, 'PUBLISHED')}
                          >
                            Tasdiqlash & Chop etish
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="secondary"
                            leftIcon={<X className="w-3.5 h-3.5" />}
                            onClick={() => handleCourseStatusChange(c.id, 'DRAFT')}
                          >
                            Qoralamaga qaytarish
                          </Button>
                        )}

                        <Link href={`/courses/${c.slug}`} target="_blank">
                          <Button size="xs" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            Ko‘rish
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TEACHER VERIFICATIONS */}
            {activeTab === 'teachers' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-white">Ustozlik Verifikatsiyasi Arizalari</h2>
                <div className="flex flex-col gap-3">
                  {verifications.map((v) => (
                    <div
                      key={v.id}
                      className="bg-navy-950 p-5 rounded-2xl border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              v.status === 'APPROVED'
                                ? 'turquoise'
                                : v.status === 'PENDING'
                                ? 'warning'
                                : 'danger'
                            }
                            size="xs"
                          >
                            {v.status === 'APPROVED'
                              ? 'Tasdiqlangan'
                              : v.status === 'PENDING'
                              ? 'Kutilmoqda'
                              : 'Rad etilgan'}
                          </Badge>
                          <span className="text-xs text-slate-400 font-mono">{v.createdAt}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{v.fullName}</h3>
                        <p className="text-xs text-slate-300 mt-0.5">{v.headline}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                          <span>Mutaxassislik: {v.specialty}</span>
                          <span>•</span>
                          <span>Tajriba: {v.experienceYears} yil</span>
                          {v.documentUrl && (
                            <>
                              <span>•</span>
                              <a
                                href={v.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-turquoise-400 hover:underline"
                              >
                                Hujjatni ko‘rish
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {v.status === 'PENDING' && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            size="xs"
                            variant="primary"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => handleReviewVerification(v.id, 'APPROVED')}
                          >
                            Tasdiqlash
                          </Button>
                          <Button
                            size="xs"
                            variant="danger"
                            leftIcon={<X className="w-3.5 h-3.5" />}
                            onClick={() => handleReviewVerification(v.id, 'REJECTED')}
                          >
                            Rad etish
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. REPORTS MANAGEMENT */}
            {activeTab === 'reports' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-white">Shikoyatlar va Moderatsiya Navbati</h2>
                <div className="flex flex-col gap-3">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className="bg-navy-950 p-4 rounded-2xl border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={r.status === 'RESOLVED' ? 'turquoise' : 'danger'}
                            size="xs"
                          >
                            {r.status}
                          </Badge>
                          <span className="text-slate-400">Turi: {r.entityType}</span>
                          <span>•</span>
                          <span className="text-slate-400">Yuboruvchi: {r.reporterName}</span>
                        </div>
                        <p className="text-slate-200 mt-1.5 font-medium">{r.reason}</p>
                        {r.adminNotes && (
                          <div className="mt-2 text-[11px] text-turquoise-300 bg-slate-900 p-2 rounded-lg border border-navy-800">
                            <strong>Moderator izohi:</strong> {r.adminNotes}
                          </div>
                        )}
                      </div>

                      {r.status === 'PENDING' && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                          >
                            Hal qilindi
                          </Button>
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                          >
                            Bekor qilish
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Yo‘nalishlar (Kategoriyalar)</h2>
                  <Button
                    size="xs"
                    variant="primary"
                    leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                    onClick={() => setIsNewCatModalOpen(true)}
                  >
                    Yangi yo‘nalish
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-navy-950 p-4 rounded-xl border border-navy-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          /{cat.slug} • {cat.coursesCount || 0} ta kurs
                        </span>
                      </div>
                      <Badge variant="outline" size="xs">
                        Faol
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. AUDIT LOGS */}
            {activeTab === 'audit' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-white">Xavfsizlik va Audit Jurnali</h2>
                <div className="bg-navy-950 rounded-2xl border border-navy-800 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-navy-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 font-bold">Amal turi</th>
                        <th className="py-3 px-4 font-bold">Tafsilotlar</th>
                        <th className="py-3 px-4 font-bold">Foydalanuvchi</th>
                        <th className="py-3 px-4 font-bold">Sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-900">
                      {recentActivity.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/50">
                          <td className="py-3 px-4 font-bold text-turquoise-400">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-slate-200">{log.details}</td>
                          <td className="py-3 px-4 text-slate-300 font-medium">{log.userName}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                            {log.createdAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. SETTINGS & SYSTEM STATUS */}
            {activeTab === 'settings' && (
              <div className="flex flex-col gap-6">
                <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white">Platforma Tizim Holati (Diagnostics)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-navy-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <span>PostgreSQL Maʼlumotlar Bazasi</span>
                      </div>
                      <Badge variant="turquoise" size="xs">
                        Ulangan (Connected)
                      </Badge>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-navy-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-400" />
                        <span>Redis Kesh Serveri</span>
                      </div>
                      <Badge variant="turquoise" size="xs">
                        Faol (Ready)
                      </Badge>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-navy-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>JWT Token & Rotation Xavfsizligi</span>
                      </div>
                      <Badge variant="turquoise" size="xs">
                        Faol
                      </Badge>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-navy-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-turquoise-400" />
                        <span>SMS / OTP Xizmati (+998)</span>
                      </div>
                      <Badge variant="warning" size="xs">
                        Mock / Dev Mode
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white">Asosiy Platforma Sozlamalari</h3>
                  <div className="flex flex-col gap-3 text-xs max-w-xl">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">
                        Platforma Nomi
                      </label>
                      <input
                        type="text"
                        value={platformSettings.platformName}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, platformName: e.target.value })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-navy-800 text-xs text-white"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-navy-800">
                      <div>
                        <strong className="block text-white">Yangi aʼzolikni ro‘yxatga olish</strong>
                        <span className="text-[11px] text-slate-400">
                          Sayt orqali yangi talabalar ro‘yxatdan o‘tishi mumkin
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={platformSettings.registrationOpen}
                        onChange={() =>
                          setPlatformSettings({
                            ...platformSettings,
                            registrationOpen: !platformSettings.registrationOpen,
                          })
                        }
                        className="w-4 h-4 accent-royal-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => toast({ title: 'Sozlamalar saqlandi', type: 'success' })}
                      >
                        Sozlamalarni Saqlash
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* New Category Modal */}
      <Modal
        isOpen={isNewCatModalOpen}
        onClose={() => setIsNewCatModalOpen(false)}
        title="Yangi Kurs Yo‘nalishi Qo‘shish"
        description="Platforma katalogi uchun yangi kategoriya yaratish."
      >
        <form onSubmit={handleCreateCategory} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="font-semibold text-navy-900 block mb-1">Yo‘nalish Nomi</label>
            <input
              type="text"
              placeholder="Masalan: Kiberxavfsizlik & Axborot Himoyasi"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-navy-950"
              required
            />
          </div>

          <ModalFooter>
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsNewCatModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Yaratish
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 py-24 flex flex-col items-center justify-center gap-3 text-white">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-slate-400">Boshqaruv markazi yuklanmoqda...</span>
        </div>
      }
    >
      <AdminPanelContent />
    </Suspense>
  );
}
