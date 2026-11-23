'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Card,
  useToast,
  LoadingSpinner,
} from '@/components/ui';

function ContactContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role');

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: initialRole === 'teacher' ? 'teacher' : 'general',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Maydonlarni to‘ldiring',
        description: 'Iltimos, ismingiz, email va xabar matnini kiriting.',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Murojaatingiz qabul qilindi!',
        description: 'Tez orada mutaxassislarimiz siz bilan bog‘lanishadi.',
        type: 'success',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
      });
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex flex-col gap-10">
      <div>
        <Badge variant="navy" size="sm" dot className="mb-2">
          Aloqa
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
          Biz Bilan Bog‘laning
        </h1>
        <p className="text-xs sm:text-sm text-muted-500 mt-1 max-w-2xl">
          Kurslar, to‘lovlar, hamkorlik yoki platformada ustoz sifatida ishlash bo‘yicha savollaringiz bo‘lsa, bizga xabar qoldiring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card-subtle">
          <h2 className="text-lg font-bold text-navy-950 mb-1">
            Xabar Yuborish
          </h2>
          <p className="text-xs text-muted-500 mb-6">
            Barcha maydonlarni to‘ldiring, biz 24 soat ichida javob beramiz.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="To‘liq Ismingiz"
                placeholder="Ismingiz va familiyangiz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Elektron pochta"
                type="email"
                placeholder="pochta@domain.uz"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Telefon raqami (Ixtiyoriy)"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Select
                label="Murojaat mavzusi"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                options={[
                  { value: 'general', label: 'Umumiy maʼlumot' },
                  { value: 'courses', label: 'Kurslar va to‘lovlar' },
                  { value: 'teacher', label: 'Ustoz bo‘lish istagi' },
                  { value: 'partnership', label: 'Korporativ hamkorlik' },
                ]}
              />
            </div>

            <Textarea
              label="Xabaringiz"
              placeholder="Savolingiz yoki taklifingizni batafsil yozing..."
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
              className="mt-2 w-full sm:w-auto self-start"
            >
              Murojaatni yuborish
            </Button>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#070E22] bg-navy-950 text-white p-6 sm:p-8 rounded-3xl border border-navy-900 shadow-modal flex flex-col gap-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-turquoise-400">
                To‘g‘ridan-to‘g‘ri aloqa
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                Biz Har Doim Yordamga Tayyormiz
              </h3>
            </div>

            <div className="flex flex-col gap-5 text-xs text-slate-200 font-medium">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-turquoise-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Bosh ofisimiz:</strong>
                  <span>Toshkent shahri, Amir Temur shox ko‘chasi, 107-bino</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-turquoise-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Elektron pochta:</strong>
                  <span>info@talimdizayni.uz</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-turquoise-400 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Telegram Bot:</strong>
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noreferrer"
                    className="text-turquoise-400 hover:underline"
                  >
                    @talimdizayni_bot
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-turquoise-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Ish vaqti:</strong>
                  <span>Dushanba - Shanba, 09:00 dan 19:00 gacha</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-muted-500">Yuklanmoqda...</span>
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
