'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Target,
  Eye,
  ShieldCheck,
  Zap,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';

export default function AboutPage() {
  const values = [
    {
      title: 'Amaliy Natija',
      description: 'Quruq nazariyadan xoli, o‘quvchining real ish bozorida o‘z o‘rnini topishiga xizmat qiladigan amaliy mashg‘ulotlar.',
      icon: <Target className="w-6 h-6 text-royal-700" />,
    },
    {
      title: 'Xalqaro Standartlar',
      description: 'Dunyodagi eng ilg‘or taʼlim metodikasi va zamonaviy texnologiyalarni O‘zbekiston yoshlariga qulay formatda yetkazish.',
      icon: <Eye className="w-6 h-6 text-royal-700" />,
    },
    {
      title: 'Ishonch va Masʼuliyat',
      description: 'Har bir o‘quvchining taʼlim sifati va sarflagan vaqtini yuksak qadrlaymiz, faqat sinovdan o‘tgan materiallarni taqdim etamiz.',
      icon: <ShieldCheck className="w-6 h-6 text-royal-700" />,
    },
    {
      title: 'Innovatsion Rivojlanish',
      description: 'Dasturlash, sunʼiy intellekt va raqamli iqtisodiyotning eng dolzarb yo‘nalishlariga doimiy urg‘u berish.',
      icon: <Zap className="w-6 h-6 text-royal-700" />,
    },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-20">
      {/* Hero */}
      <section className="bg-[#070E22] bg-navy-950 text-white py-16 sm:py-24 border-b border-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <Badge variant="turquoise" size="sm" className="mb-4">
            Biz Haqimizda
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            O‘zbekistonda Zamonaviy Taʼlim Madaniyatini Yaratamiz
          </h1>
          <p className="text-xs sm:text-base text-slate-200 mt-4 leading-relaxed max-w-2xl font-medium">
            Bizning vazifamiz — har bir iqtidorli yoshga geografik yoki moliyaviy to‘siqlarsiz eng yuqori darajadagi zamonaviy bilimlarni taqdim etishdir.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card-subtle flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-royal-700">
                Bizning Missiyamiz
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy-950 tracking-tight mt-2">
                Har bir inson uchun sifatli bilim
              </h2>
              <p className="text-xs sm:text-sm text-muted-500 mt-3 leading-relaxed">
                Zamonaviy mehnat bozorida eng talabgir ko‘nikmalarni o‘rgatish orqali yoshlarimizning munosib karyera qurishiga va mamlakatimiz raqamli salohiyatini oshirishga hissa qo‘shish.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card-subtle flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-turquoise-600">
                Bizning Qarashimiz
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy-950 tracking-tight mt-2">
                Kelajak taʼlimining yetakchi platformasi
              </h2>
              <p className="text-xs sm:text-sm text-muted-500 mt-3 leading-relaxed">
                O‘zbekiston va Markaziy Osiyo hududida eng ishonchli, zamonaviy va natijaga yo‘naltirilgan taʼlim SaaS ekotizimiga aylanish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-royal-700">
            Tamoyillarimiz
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight mt-1">
            Biz Amal Qiladigan Qadriyatlar
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <Card key={i} className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-royal-50 border border-royal-100 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="text-base font-bold text-navy-950">{v.title}</h3>
                <p className="text-xs text-muted-500 mt-2 leading-relaxed">
                  {v.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/80 shadow-card-subtle flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-xl font-bold text-navy-950">
              Bizning jamoaga qo‘shilishni xohlaysizmi?
            </h3>
            <p className="text-xs text-muted-500 mt-1">
              Ustoz, mentor yoki metodist sifatida hamkorlik qilish uchun ariza qoldiring.
            </p>
          </div>
          <Link href="/contact?role=teacher">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Bog‘lanish
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
