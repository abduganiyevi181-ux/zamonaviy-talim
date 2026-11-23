'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import {
  Button,
  Input,
  useToast,
} from '@/components/ui';
import { formatUzPhone, cleanPhoneForApi } from '@/lib/phone';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    if (/^\+?\d/.test(val) && !val.includes('@')) {
      setIdentifier(formatUzPhone(val));
    } else {
      setIdentifier(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({
        title: 'Maydonni to‘ldiring',
        description: 'Iltimos, telefon raqamingiz yoki elektron pochtangizni kiriting.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const cleaned = identifier.includes('@')
        ? identifier.trim().toLowerCase()
        : cleanPhoneForApi(identifier);

      const res = await api.auth.forgotPassword(cleaned);

      setIsSubmitted(true);
      toast({
        title: 'Tasdiqlash kodi yuborildi',
        description: `${identifier} manziliga parolni yangilash kodi yuborildi.${
          res.data?.devOtp ? ` (Test kodi: ${res.data.devOtp})` : ''
        }`,
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Xatolik',
        description: err.message || 'Kodni yuborishda xatolik yuz berdi',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="w-7 h-7 text-turquoise-400 stroke-[1.8]" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">
            Parolni Tiklash
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Parolni tiklash uchun hisobingizga biriktirilgan telefon yoki emailni kiriting.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col gap-5">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Telefon raqami yoki Email"
                placeholder="+998 (90) 123-45-67 yoki email"
                value={identifier}
                onChange={handleIdentifierChange}
                hint="Ushbu manzilga 6 xonali tasdiqlash kodi yuboriladi"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Tiklash Kodini Yuborish
              </Button>

              <div className="text-center pt-3 border-t border-slate-100">
                <Link
                  href="/login"
                  className="text-xs text-slate-600 hover:text-navy-950 flex items-center justify-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kirish sahifasiga qaytish</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center gap-4 py-3">
              <div className="w-14 h-14 rounded-2xl bg-royal-50 border border-royal-200 flex items-center justify-center text-royal-700">
                <KeyRound className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-navy-950">
                  Ko‘rsatmalar Yuborildi!
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1 max-w-xs leading-relaxed">
                  <strong className="text-navy-900">{identifier}</strong> manziliga 6 xonali tiklash kodi jo‘natildi.
                </p>
              </div>

              <Link
                href={`/reset-password?identifier=${encodeURIComponent(identifier)}`}
                className="w-full mt-2"
              >
                <Button variant="primary" size="md" className="w-full justify-center">
                  Yangi Parol O‘rnatish &rarr;
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-muted-500 hover:text-navy-900 font-semibold"
              >
                Boshqa manzil kiritish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
