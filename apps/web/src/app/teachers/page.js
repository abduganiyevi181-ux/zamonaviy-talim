'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Avatar,
  EmptyState,
} from '@/components/ui';
import { TEACHERS, CATEGORIES } from '@/data/mock-data';

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const filteredTeachers = useMemo(() => {
    return TEACHERS.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specialty.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === 'all' || teacher.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [searchTerm, selectedSpecialty]);

  const specialties = [
    'all',
    'Dasturlash & IT',
    'Dizayn & Kreativ',
    'Sunʼiy Intellekt & Data',
    'Xorijiy Tillar',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <Badge variant="navy" size="sm" dot className="mb-2">
          Bizning Mentorlar
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 dark:text-white tracking-tight">
          Tajribali Amaliyotchi Ustozlar
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1 max-w-2xl">
          Xalqaro va yetakchi kompaniyalarda faoliyat yuritayotgan senior mutaxassislar bilan bilim oling va tajriba orttiring.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-[#0B1536] p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-card-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Ustoz ismi yoki mutaxassisligi bo‘yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm text-navy-950 dark:text-white bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-xl outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-navy-900 focus:border-royal-600"
          />
        </div>

        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="h-10 px-3 text-xs font-medium text-navy-800 dark:text-slate-200 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Barcha sohalar</option>
          <option value="Dasturlash & IT">Dasturlash & IT</option>
          <option value="Dizayn & Kreativ">Dizayn & Kreativ</option>
          <option value="Sunʼiy Intellekt & Data">Sunʼiy Intellekt & Data</option>
          <option value="Xorijiy Tillar">Xorijiy Tillar</option>
        </select>
      </div>

      {/* Grid */}
      {filteredTeachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTeachers.map((teacher) => (
            <Link key={teacher.id} href={`/teachers/${teacher.slug}`}>
              <Card interactive className="p-6 h-full flex flex-col justify-between text-center items-center">
                <div className="flex flex-col items-center">
                  <Avatar
                    src={teacher.avatar}
                    name={teacher.name}
                    size="xl"
                    status="online"
                    className="mb-4 ring-4 ring-slate-100"
                  />
                  <h3 className="text-base font-bold text-navy-950 tracking-tight">
                    {teacher.name}
                  </h3>
                  <Badge variant="turquoise" size="sm" className="mt-1">
                    {teacher.specialty}
                  </Badge>
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {teacher.title}
                  </p>
                </div>

                <div className="w-full pt-4 mt-4 border-t border-slate-100 flex items-center justify-around text-xs">
                  <div>
                    <span className="font-bold text-navy-950 block">{teacher.studentsCount}+</span>
                    <span className="text-xs text-slate-600 font-medium">O‘quvchi</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="font-bold text-navy-950 flex items-center gap-0.5 justify-center">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {teacher.rating}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">Reyting</span>
                  </div>
                </div>

                <div className="w-full pt-3 mt-3">
                  <Button variant="secondary" size="sm" className="w-full justify-center">
                    Profilni ko‘rish
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Ustozlar topilmadi"
          description="Siz kiritgan so‘z bo‘yicha ustoz topilmadi. Qidiruv so‘zini o‘zgartirib ko‘ring."
          actionText="Barcha ustozlarni ko‘rish"
          onAction={() => {
            setSearchTerm('');
            setSelectedSpecialty('all');
          }}
        />
      )}
    </div>
  );
}
