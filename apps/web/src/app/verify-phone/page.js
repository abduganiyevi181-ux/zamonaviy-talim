'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Smartphone,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import {
  Button,
  Badge,
  OtpInput,
  LoadingSpinner,
  useToast,
} from '@/components/ui';
import { cleanPhoneForApi } from '@/lib/phone';
import { api, setAuthTokens } from '@/lib/api';

function VerifyPhoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '+998 (90) 123-45-67';

  const { toast } = useToast();

  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0 && !isSuccess) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, isSuccess]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (otpCode.length !== 6) {
      setOtpError('Iltimos, 6 xonali SMS kodni to‘liq kiriting.');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      const cleanPhone = cleanPhoneForApi(phoneParam);
      const res = await api.auth.loginOtp({
        emailOrPhone: cleanPhone,
        otp: otpCode,
      });

      if (!res.success) {
        setOtpError(res.error || 'Tasdiqlash kodi noto‘g‘ri yoki eskirgan');
        return;
      }

      if (res.data?.accessToken) {
        setAuthTokens(res.data.accessToken, res.data.refreshToken, res.data.user);
      }

      setIsSuccess(true);
      toast({
        title: 'Telefon raqami muvaffaqiyatli tasdiqlandi!',
        description: 'Hisobingiz to‘liq faollashtirildi.',
        type: 'success',
      });
    } catch (err) {
      setOtpError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const cleanPhone = cleanPhoneForApi(phoneParam);
      const res = await api.auth.sendOtp(cleanPhone);
      if (res.success) {
        setCountdown(res.data?.resendCooldownSeconds || 60);
        setCanResend(false);
        setOtpCode('');
        setOtpError('');
        toast({
          title: 'Yangi SMS kod yuborildi',
          description: `${phoneParam} raqamiga yangi 6 xonali SMS kod yetkazildi.${
            res.data?.devOtp ? ` (Test: ${res.data.devOtp})` : ''
          }`,
          type: 'info',
        });
      } else {
        toast({
          title: 'Xatolik',
          description: res.error,
          type: 'warning',
        });
      }
    } catch (err) {
      toast({
        title: 'Tarmoq xatosi',
        description: err.message,
        type: 'danger',
      });
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
            SMS Kodni Tasdiqlash
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Quyidagi telefon raqamiga 6 xonali kod yuborildi:
            <strong className="block text-navy-900 font-semibold mt-0.5">{phoneParam}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col gap-5">
          {!isSuccess ? (
            <div className="flex flex-col gap-6 py-2">
              <div className="flex flex-col items-center gap-3">
                <OtpInput
                  length={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={() => handleVerify()}
                  error={Boolean(otpError)}
                  autoFocus
                />

                {otpError && (
                  <p className="text-xs font-semibold text-rose-600 text-center">
                    {otpError}
                  </p>
                )}

                <div className="text-center text-xs text-slate-600 font-medium pt-1">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="font-bold text-royal-700 hover:underline flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>SMS kodni qayta yuborish</span>
                    </button>
                  ) : (
                    <span>
                      Kodni qayta yuborish:{' '}
                      <strong className="text-navy-950 font-mono font-bold">
                        00:{countdown < 10 ? `0${countdown}` : countdown}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  onClick={handleVerify}
                  className="w-full justify-center"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Tasdiqlash
                </Button>

                <Link
                  href="/register"
                  className="text-xs text-muted-500 hover:text-navy-900 py-1 flex items-center justify-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Raqamni o‘zgartirish</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-9 h-9 stroke-[2]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-navy-950">
                  Telefon Tasdiqlandi!
                </h3>
                <p className="text-xs text-muted-500 mt-1 max-w-xs">
                  SMS orqali tasdiqlash muvaffaqiyatli yakunlandi.
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

export default function VerifyPhonePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-muted-500">Yuklanmoqda...</span>
        </div>
      }
    >
      <VerifyPhoneContent />
    </Suspense>
  );
}
