'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import {
  Clock,
  BookOpen,
  Star,
  CheckCircle2,
  Share2,
  Users,
  Award,
  Globe,
  ChevronDown,
  PlayCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Avatar,
  Tabs,
  Modal,
  ModalFooter,
  useToast,
} from '@/components/ui';
import { COURSES } from '@/data/mock-data';
import { api, isAuthenticated } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const { toast } = useToast();

  const fallbackCourse = COURSES.find((c) => c.slug === slug) || COURSES[0];
  const [course, setCourse] = useState(fallbackCourse);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('syllabus');
  const [openModule, setOpenModule] = useState(0);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Fetch live course details and enrollment status
  React.useEffect(() => {
    async function loadCourse() {
      try {
        const res = await api.courses.getBySlug(slug);
        if (res.success && res.data) {
          setCourse((prev) => ({
            ...prev,
            ...res.data,
            id: res.data.id || prev.id,
            title: res.data.title || prev.title,
            shortDescription: res.data.subtitle || res.data.description || prev.shortDescription,
            category: res.data.category?.name || prev.category,
            price: res.data.price ? Number(res.data.price) : prev.price,
            originalPrice: res.data.originalPrice ? Number(res.data.originalPrice) : prev.originalPrice,
          }));

          if (isAuthenticated() && res.data.id) {
            const statusRes = await api.enrollments.checkStatus(res.data.id);
            if (statusRes.success && statusRes.data?.isEnrolled) {
              setIsEnrolled(true);
            }
          }
        }
      } catch (err) {
        console.error('Course load error:', err);
      }
    }
    loadCourse();
  }, [slug]);

  const tabs = [
    { id: 'syllabus', label: 'Darslar Rejasi' },
    { id: 'about', label: 'Kurs Haqida' },
    { id: 'instructor', label: 'Ustoz Haqida' },
  ];

  return (
    <div className="pb-20">
      {/* Top Hero Banner */}
      <section className="bg-[#070E22] bg-navy-950 text-white py-12 sm:py-16 border-b border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="turquoise" size="sm">
                  {course.category}
                </Badge>
                <Badge variant="navy" size="sm">
                  {course.level}
                </Badge>
                {course.badge && (
                  <Badge variant="warning" size="sm">
                    {course.badge}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                {course.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-200">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{course.rating}</span>
                  <span className="text-slate-300 font-normal">({course.reviewsCount} sharh)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-turquoise-400" />
                  <span>{course.studentsCount} ta o‘quvchi</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-turquoise-400" />
                  <span>{course.duration} amaliy taʼlim</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-navy-900">
                <Avatar name={course.instructor.name} size="sm" />
                <span className="text-xs">
                  Muallif:{' '}
                  <Link
                    href={`/teachers/${course.instructor.slug}`}
                    className="text-turquoise-400 font-bold hover:underline"
                  >
                    {course.instructor.name}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Details & Tabs */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* What you'll learn */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-card-subtle">
              <h3 className="text-lg font-bold text-navy-950 mb-4">
                Ushbu kursda nimalarni o‘rganasiz?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {course.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-navy-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="line"
            />

            {/* Tab 1: Syllabus */}
            {activeTab === 'syllabus' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-muted-500 mb-1">
                  <span>
                    Jami modullar:{' '}
                    <strong className="text-navy-900">
                      {course.syllabus?.length || 3} ta modul
                    </strong>
                  </span>
                  <span>{course.lessonsCount} ta amaliy video dars</span>
                </div>

                {course.syllabus?.map((mod, modIdx) => {
                  const isOpen = openModule === modIdx;
                  return (
                    <div
                      key={modIdx}
                      className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-card-subtle"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenModule(isOpen ? -1 : modIdx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-navy-950 bg-slate-50/60"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-royal-700" />
                          <span>{mod.module}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform ${
                            isOpen ? 'rotate-180 text-royal-700' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 p-2">
                          {mod.lessons.map((lesson, lIdx) => (
                            <Link
                              key={lIdx}
                              href={`/courses/${course.slug}/learn?lesson=${lIdx}`}
                              className="px-4 py-3 flex items-center justify-between text-xs text-navy-800 hover:bg-slate-50/80 rounded-lg transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle className="w-4 h-4 text-royal-600 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="group-hover:text-royal-700 font-medium">{lesson}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                                  Darsni ko‘rish
                                </span>
                                <span className="text-xs text-slate-600 font-mono font-medium">
                                  15:40
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: About */}
            {activeTab === 'about' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-card-subtle flex flex-col gap-4 text-xs text-navy-800 leading-relaxed">
                <h4 className="text-base font-bold text-navy-950">
                  Kurs tavsifi va maqsadi
                </h4>
                <p>
                  Ushbu dastur zamonaviy taʼlim standartlari asosida, to‘liq amaliy tajribaga tayanib ishlab chiqilgan.
                  Har bir modul real hayotdagi loyihalar va vazifalar asosida tuzilgan bo‘lib, o‘quvchilarga qisqa muddatda mustaqil natija ko‘rsatish imkonini beradi.
                </p>
                <p>
                  Kurs davomida har bir mavzuni o‘zlashtirib, shaxsiy portfoliosingizga qo‘shish mumkin bo‘lgan real keys ustida ishlaysiz.
                </p>
              </div>
            )}

            {/* Tab 3: Instructor */}
            {activeTab === 'instructor' && (
              <Card className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <Avatar
                    src={course.instructor.avatar}
                    name={course.instructor.name}
                    size="xl"
                  />
                  <div>
                    <h4 className="text-base font-bold text-navy-950">
                      {course.instructor.name}
                    </h4>
                    <p className="text-xs text-royal-700 font-semibold mt-0.5">
                      {course.instructor.title}
                    </p>
                    <p className="text-xs text-muted-500 mt-2 leading-relaxed max-w-xl">
                      {course.instructor.bio}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Sticky Enrollment Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white border border-slate-200/80 rounded-2xl shadow-modal overflow-hidden p-6 flex flex-col gap-5">
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <Link
                  href={`/courses/${course.slug}/learn`}
                  className="absolute inset-0 flex items-center justify-center bg-navy-950/20 hover:bg-navy-950/35 transition-colors"
                  aria-label={`${course.title} kursining tanishuv videosini ko‘rish`}
                >
                  <span className="w-14 h-14 rounded-full bg-white/95 text-royal-700 flex items-center justify-center shadow-xl">
                    <PlayCircle className="w-7 h-7 fill-royal-700" />
                  </span>
                </Link>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-navy-950">
                    {formatNumber(course.price)} so‘m
                  </span>
                  {course.originalPrice && (
                    <span className="text-xs text-slate-500 font-medium line-through">
                      {formatNumber(course.originalPrice)} so‘m
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                  Bir martalik to‘lov • Cheksiz umrbod kirish
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {isEnrolled ? (
                  <Link href={`/courses/${course.slug}/learn`} className="w-full">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      leftIcon={<PlayCircle className="w-5 h-5 text-turquoise-400" />}
                    >
                      Darslarni Davom Ettirish
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => {
                      if (!isAuthenticated()) {
                        toast({
                          title: 'Tizimga kiring',
                          description: 'Kursga yozilish uchun avval hisobingizga kiring.',
                          type: 'warning',
                        });
                        router.push(`/login?redirect=/courses/${course.slug}`);
                        return;
                      }
                      setIsEnrollModalOpen(true);
                    }}
                  >
                    Kursga Yozilish
                  </Button>
                )}

                <Link href={`/courses/${course.slug}/learn`} className="w-full">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    leftIcon={<PlayCircle className="w-4 h-4 text-royal-600" />}
                  >
                    Darslar Rejasi (Player)
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 text-xs text-navy-800">
                <span className="font-bold text-navy-950 text-xs">Kurs tarkibiga kiradi:</span>
                <div className="flex items-center gap-2 text-muted-600">
                  <Clock className="w-4 h-4 text-turquoise-600" />
                  <span>{course.duration} video darslar</span>
                </div>
                <div className="flex items-center gap-2 text-muted-600">
                  <BookOpen className="w-4 h-4 text-turquoise-600" />
                  <span>{course.lessonsCount} ta amaliy mashg‘ulot</span>
                </div>
                <div className="flex items-center gap-2 text-muted-600">
                  <Award className="w-4 h-4 text-turquoise-600" />
                  <span>Rasmiy raqamli sertifikat</span>
                </div>
                <div className="flex items-center gap-2 text-muted-600">
                  <Globe className="w-4 h-4 text-turquoise-600" />
                  <span>Istalgan qurilmadan o‘rganish</span>
                </div>
                <div className="flex items-center gap-2 text-muted-600">
                  <ShieldCheck className="w-4 h-4 text-turquoise-600" />
                  <span>14 kunlik to‘lov qaytarish kafolati</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Demo Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Kursga aʼzo bo‘lish"
        description={`${course.title} kursi uchun to‘lov va ro‘yxatdan o‘tish oynasi.`}
      >
        <div className="flex flex-col gap-4 text-xs text-navy-800">
          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
            <span className="font-semibold">To‘lov summasi:</span>
            <span className="font-extrabold text-base text-navy-950">
              {formatNumber(course.price)} so‘m
            </span>
          </div>
          <p className="text-muted-500">
            Platformaning rasmiy darslariga aʼzo bo‘lish uchun quyidagi tugmani bosing. Aʼzolik tasdiqlangach darslar va amaliy materiallar darhol ochiladi.
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={() => setIsEnrollModalOpen(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isEnrolling}
            onClick={async () => {
              setIsEnrolling(true);
              try {
                const res = await api.enrollments.enroll(course.id);
                setIsEnrollModalOpen(false);
                setIsEnrolled(true);
                toast({
                  title: 'Aʼzolik tasdiqlandi!',
                  description: 'Darslar pleyeriga yo‘naltirilmoqda...',
                  type: 'success',
                });
                setTimeout(() => {
                  router.push(`/courses/${course.slug}/learn`);
                }, 400);
              } catch (err) {
                toast({
                  title: 'Xatolik',
                  description: err.message || 'Kursga yozilishda muammo yuz berdi',
                  type: 'danger',
                });
              } finally {
                setIsEnrolling(false);
              }
            }}
          >
            Aʼzolikni tasdiqlash
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
