'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star,
  Users,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  MessageSquare,
  Send,
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Avatar,
  Modal,
  ModalFooter,
  Input,
  Textarea,
  useToast,
} from '@/components/ui';
import { TEACHERS, COURSES } from '@/data/mock-data';
import { formatNumber } from '@/lib/utils';

export default function TeacherProfilePage() {
  const params = useParams();
  const slug = params?.slug;
  const { toast } = useToast();

  const teacher = TEACHERS.find((t) => t.slug === slug) || TEACHERS[0];
  const teacherCourses = COURSES.filter((c) => c.instructor.id === teacher.id);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex flex-col gap-10">
      {/* Mentor Header Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card-subtle flex flex-col md:flex-row items-center md:items-start gap-8">
        <Avatar
          src={teacher.avatar}
          name={teacher.name}
          size="xl"
          status="online"
          className="w-28 h-28 sm:w-36 sm:h-36 text-2xl ring-4 ring-slate-100 shrink-0"
        />

        <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Badge variant="turquoise" size="sm">
              {teacher.specialty}
            </Badge>
            <Badge variant="navy" size="sm">
              {teacher.experience} tajriba
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            {teacher.name}
          </h1>

          <p className="text-xs sm:text-sm text-royal-700 font-semibold">
            {teacher.title}
          </p>

          <p className="text-xs sm:text-sm text-muted-500 max-w-2xl leading-relaxed">
            {teacher.bio}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{teacher.rating} ball</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-navy-800">
              <Users className="w-4 h-4 text-royal-700" />
              <span>{teacher.studentsCount} ta o‘quvchi</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-navy-800">
              <BookOpen className="w-4 h-4 text-royal-700" />
              <span>{teacher.coursesCount} ta mualliflik kursi</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
          <Button
            variant="primary"
            size="md"
            leftIcon={<MessageSquare className="w-4 h-4" />}
            onClick={() => setIsContactModalOpen(true)}
            className="w-full justify-center"
          >
            Ustozga savol yo‘llash
          </Button>
        </div>
      </div>

      {/* Courses by this Teacher */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-950 tracking-tight">
            {teacher.name} tomonidan yaratilgan kurslar
          </h2>
          <p className="text-xs text-muted-500 mt-1">
            Ushbu ustoz boshchiligidagi barcha mavjud taʼlim dasturlari
          </p>
        </div>

        {teacherCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`}>
                <Card interactive className="h-full flex flex-col justify-between overflow-hidden">
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="navy" size="sm">
                        {course.level}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-navy-950 tracking-tight line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-500 mt-1.5 line-clamp-2">
                        {course.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                      <span className="text-sm font-extrabold text-navy-950">
                        {formatNumber(course.price)} so‘m
                      </span>
                      <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Batafsil
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-muted-500">
            Hozirda yangi kurslar tayyorlanmoqda.
          </div>
        )}
      </div>

      {/* Contact Teacher Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={`${teacher.name} bilan bog‘lanish`}
        description="Ustozga shaxsiy savol yoki hamkorlik taklifini yuboring."
      >
        <div className="flex flex-col gap-4">
          <Input label="Ismingiz" placeholder="To‘liq ismingizni kiriting" />
          <Input label="Telefon yoki Telegram username" placeholder="@username yoki +998..." />
          <Textarea
            label="Savolingiz yoki xabaringiz"
            placeholder="Ustozga qanday savolingiz bor?..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={() => setIsContactModalOpen(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<Send className="w-3.5 h-3.5" />}
            onClick={() => {
              setIsContactModalOpen(false);
              setMessage('');
              toast({
                title: 'Xabar yuborildi!',
                description: 'Ustoz siz bilan tez orada bog‘lanadi.',
                type: 'success',
              });
            }}
          >
            Yuborish
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
