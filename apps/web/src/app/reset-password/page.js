'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  Button,
  Input,
  OtpInput,
  LoadingSpinner,
  useToast,
} from '@/components/ui';
import { cleanPhoneForApi } from '@/lib/phone';
import { api } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') || 'foydalanuvchi';

  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simple password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Juda kuchsiz', color: 'bg-rose-500' };
    const hasNumbers = /\d/.test(pass);
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (pass.length >= 8 && hasNumbers && hasLetters && hasSpecial) {
      return { score: 3, label: 'Kuchli parol', color: 'bg-emerald-500' };
    }
    if (pass.length >= 6 && (hasNumbers || hasLetters)) {
      return { score: 2, label: 'O‘rtacha', color: 'bg-amber-500' };
    }
    return { score: 1, label: 'Kuchsiz', color: 'bg-rose-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleReset = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast({
        title: 'Tasdiqlash kodi to‘liq emas',
        description: 'Iltimos, 6 xonali tasdiqlash kodini to‘liq kiriting.',
        type: 'warning',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Parol juda qisqa',
        description: 'Parol kamida 6 ta belgidan iborat bo‘lishi shart.',
        type: 'warning',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Parollar mos kelmadi',
        description: 'Yangi parol va tasdiqlash paroli bir xil bo‘lishi kerak.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const cleaned = identifier.includes('@')
        ? identifier.trim().toLowerCase()
        : cleanPhoneForApi(identifier);

      const res = await api.auth.resetPassword({
        emailOrPhone: cleaned,
        otp: code,
        newPassword,
      });

      if (!res.success) {
        toast({
          title: 'Parolni tiklashda xatolik',
          description: res.error || 'Tasdiqlash kodi noto‘g‘ri yoki muddati o‘tgan',
          type: 'danger',
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: 'Parol muvaffaqiyatli yangilandi!',
        description: 'Endi yangi parolingiz bilan tizimga kirishingiz mumkin.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Xatolik',
        description: err.message || 'Server bilan bog‘lanib bo‘lmadi',
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
            Yangi Parol O‘rnatish
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            {identifier} hisobingiz uchun yangi xavfsiz parol belgilang.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col gap-5">
          {!isSuccess ? (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-navy-950 block mb-2 text-center">
                  6 Xonali Tasdiqlash Kodi
                </label>
                <OtpInput
                  length={6}
                  value={code}
                  onChange={setCode}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <Input
                  label="Yangi Parol"
                  type="password"
                  placeholder="Kamida 6 belgi"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                {newPassword && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full rounded-full transition-all ${
                          strength.score >= 1 ? strength.color : 'bg-slate-200'
                        } ${strength.score === 1 ? 'w-1/3' : strength.score === 2 ? 'w-2/3' : 'w-full'}`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-500">
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <Input
                label="Parolni Tasdiqlang"
                type="password"
                placeholder="Yangi parolni qayta kiriting"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
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
                Parolni Saqlash
              </Button>

              <div className="text-center pt-3 border-t border-slate-100">
                <Link
                  href="/login"
                  className="text-xs text-muted-500 hover:text-navy-900 flex items-center justify-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kirish sahifasiga qaytish</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-9 h-9 stroke-[2]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-navy-950">
                  Parol Muvaffaqiyatli O‘zgartirildi!
                </h3>
                <p className="text-xs text-muted-500 mt-1 max-w-xs leading-relaxed">
                  Endi yangi parolingiz orqali platformaga bemalol kirishingiz mumkin.
                </p>
              </div>

              <Link href="/login" className="w-full mt-2">
                <Button variant="primary" size="md" className="w-full justify-center">
                  Tizimga Kirish
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-muted-500">Yuklanmoqda...</span>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
