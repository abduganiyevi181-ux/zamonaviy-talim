'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Clock, Star, ArrowRight, BookOpen } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  Avatar,
  EmptyState,
  LoadingSpinner,
} from '@/components/ui';
import { COURSES, CATEGORIES } from '@/data/mock-data';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [liveCourses, setLiveCourses] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load courses and categories from backend
  React.useEffect(() => {
    async function loadBackendData() {
      setIsLoading(true);
      try {
        const [cRes, catRes] = await Promise.all([
          api.courses.list({
            search: searchTerm || undefined,
            level: selectedLevel !== 'all' ? selectedLevel : undefined,
          }),
          api.categories.list(),
        ]);

        if (cRes.success && cRes.data?.courses?.length > 0) {
          // Normalize backend courses
          const mapped = cRes.data.courses.map((c) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            shortDescription: c.subtitle || c.description,
            price: Number(c.price) || 0,
            originalPrice: c.originalPrice ? Number(c.originalPrice) : null,
            level: c.level || 'O‘rta',
            category: c.category?.name || 'IT',
            categorySlug: c.category?.slug || 'dasturlash',
            duration: `${c.durationHours || 24} soat`,
            lessonsCount: c.totalLessons || 24,
            rating: c.rating || 5.0,
            reviewsCount: c.reviewCount || 10,
            studentsCount: c.studentsCount || 100,
            thumbnail: c.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
            badge: c.isFree ? 'Bepul' : null,
            instructor: {
              name: c.teacher?.user?.profile?.fullName || 'Ustoz',
              title: c.teacher?.headline || 'Mutaxassis',
              avatar: c.teacher?.user?.profile?.avatarUrl,
            },
          }));
          setLiveCourses(mapped);
        }

        if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setLiveCategories(catRes.data);
        }
      } catch (err) {
        console.error('Course list fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBackendData();
  }, [searchTerm, selectedLevel]);

  const allAvailableCourses = liveCourses.length > 0 ? liveCourses : COURSES;

  const filteredCourses = useMemo(() => {
    return allAvailableCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || course.categorySlug === selectedCategory;

      const matchesLevel =
        selectedLevel === 'all' || course.level.includes(selectedLevel);

      return matchesSearch && matchesCategory && matchesLevel;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return b.studentsCount - a.studentsCount; // popular
    });
  }, [allAvailableCourses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <Badge variant="navy" size="sm" dot className="mb-2">
          Kurslar Katalogi
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 dark:text-white tracking-tight">
          Barcha Amaliy Kurslar
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-medium">
          Sohangiz bo‘yicha eng sara, amaliy va natijador taʼlim dasturlarini tanlang va mustaqil o‘rganing.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Kurs nomi, texnologiya yoki ustoz ismi bo‘yicha izlash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm text-navy-900 dark:text-white bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-xl outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-navy-900 focus:border-royal-600"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 text-xs font-medium text-navy-800 dark:text-slate-200 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl outline-none cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="all">Barcha yo‘nalishlar</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="h-10 px-3 text-xs font-medium text-navy-800 dark:text-slate-200 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl outline-none cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="all">Barcha darajalar</option>
            <option value="Boshlang‘ich">Boshlang‘ich</option>
            <option value="O‘rta">O‘rta daraja</option>
            <option value="Yuqori">Yuqori daraja</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 text-xs font-medium text-navy-800 dark:text-slate-200 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl outline-none cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="popular">Eng ommabop</option>
            <option value="rating">Reytingi yuqori</option>
            <option value="price-low">Narxi: Arzondan qimmatga</option>
            <option value="price-high">Narxi: Qimmatdan arzonga</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-500 dark:text-slate-400">
        <span>Topilgan kurslar: <strong className="text-navy-950 dark:text-white font-bold">{filteredCourses.length} ta</strong></span>
        {(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
            }}
            className="text-royal-600 dark:text-royal-400 hover:underline font-semibold"
          >
            Filtrlarni tozalash
          </button>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`}>
              <Card interactive className="h-full flex flex-col overflow-hidden">
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-2">
                      <Badge variant="outline" size="sm">
                        {course.level}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{course.rating}</span>
                        <span className="text-slate-600 font-medium">({course.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-navy-950 tracking-tight line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {course.shortDescription}
                    </p>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Avatar name={course.instructor.name} size="xs" />
                      <div className="flex-1 truncate">
                        <span className="text-xs font-semibold text-navy-800 block truncate">
                          {course.instructor.name}
                        </span>
                        <span className="text-xs text-slate-600 font-medium block truncate">
                          {course.instructor.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                    <div>
                      <span className="text-base font-extrabold text-navy-950">
                        {formatNumber(course.price)} so‘m
                      </span>
                      {course.originalPrice && (
                        <span className="text-xs text-slate-500 line-through block -mt-0.5 font-medium">
                          {formatNumber(course.originalPrice)} so‘m
                        </span>
                      )}
                    </div>

                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Tanlash
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Kurslar topilmadi"
          description="Siz kiritgan mezonlar bo‘yicha kurs topilmadi. Qidiruv so‘zini o‘zgartiring yoki filtrlarni tozalang."
          actionText="Barcha kurslarni ko‘rish"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedLevel('all');
          }}
        />
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-muted-500">Kurslar yuklanmoqda...</span>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
