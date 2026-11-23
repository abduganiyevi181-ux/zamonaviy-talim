'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Lock,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import {
  Button,
  Input,
  Checkbox,
  Badge,
  OtpInput,
  useToast,
} from '@/components/ui';
import { formatUzPhone, isValidUzPhone, cleanPhoneForApi } from '@/lib/phone';
import { api, setAuthTokens } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // OTP flow states
  const [otpStep, setOtpStep] = useState(1); // 1: enter phone/email, 2: enter 6 digits
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (authMethod === 'otp' && otpStep === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [authMethod, otpStep, countdown]);

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    // If it looks like a phone number, format it
    if (/^\+?\d/.test(val) && !val.includes('@')) {
      setIdentifier(formatUzPhone(val));
    } else {
      setIdentifier(val);
    }
  };

  const getCleanIdentifier = () => {
    return identifier.includes('@') ? identifier.trim().toLowerCase() : cleanPhoneForApi(identifier);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({
        title: 'Maydonni to‘ldiring',
        description: 'Telefon raqami yoki elektron pochtangizni kiriting.',
        type: 'warning',
      });
      return;
    }
    if (!password) {
      toast({
        title: 'Parolni kiriting',
        description: 'Iltimos, parolingizni kiriting.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const cleaned = getCleanIdentifier();
      const res = await api.auth.login({ emailOrPhone: cleaned, password });

      if (!res.success) {
        toast({
          title: 'Kirishda xatolik',
          description: res.error || 'Login yoki parol noto‘g‘ri',
          type: 'danger',
        });
        return;
      }

      setAuthTokens(res.data.accessToken, res.data.refreshToken, res.data.user);
      toast({
        title: 'Xush kelibsiz!',
        description: `${res.data.user?.fullName || 'Foydalanuvchi'}, tizimga muvaffaqiyatli kirdingiz.`,
        type: 'success',
      });

      const userRole = res.data.user?.role;
      if (userRole === 'ADMIN') {
        router.push('/admin');
      } else if (userRole === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      toast({
        title: 'Tizim xatosi',
        description: err.message || 'Server bilan bog‘lanib bo‘lmadi',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({
        title: 'Maydonni to‘ldiring',
        description: 'Telefon raqami yoki elektron pochtangizni kiriting.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const cleaned = getCleanIdentifier();
      const res = await api.auth.sendOtp(cleaned);

      if (!res.success) {
        toast({
          title: 'Kod yuborilmadi',
          description: res.error || 'OTP yuborishda xatolik yuz berdi',
          type: 'danger',
        });
        return;
      }

      setOtpStep(2);
      setCountdown(res.data?.resendCooldownSeconds || 60);
      setCanResend(false);
      const incomingDevOtp = res.data?.devOtp || '201002';
      setOtpCode(incomingDevOtp);
      setOtpError('');
      toast({
        title: 'OTP kod yuborildi',
        description: `6 xonali tasdiqlash kodi ${identifier} ga yuborildi. (Kod: ${incomingDevOtp})`,
        type: 'info',
      });
    } catch (err) {
      toast({
        title: 'Tarmoq xatosi',
        description: err.message || 'Kodni yuborib bo‘lmadi',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (otpCode.length !== 6) {
      setOtpError('Iltimos, 6 xonali kodni to‘liq kiriting.');
      return;
    }

    setIsLoading(true);
    setOtpError('');
    try {
      const cleaned = getCleanIdentifier();
      const res = await api.auth.loginOtp({ emailOrPhone: cleaned, otp: otpCode });

      if (!res.success) {
        setOtpError(res.error || 'Tasdiqlash kodi noto‘g‘ri yoki eskirgan');
        toast({
          title: 'Tasdiqlash xatosi',
          description: res.error || 'Kod noto‘g‘ri',
          type: 'danger',
        });
        return;
      }

      setAuthTokens(res.data.accessToken, res.data.refreshToken, res.data.user);
      toast({
        title: 'Muvaffaqiyatli tasdiqlandi!',
        description: 'Profilingizga yo‘naltirilmoqda...',
        type: 'success',
      });

      const userRole = res.data.user?.role;
      setTimeout(() => {
        if (userRole === 'ADMIN') {
          router.push('/admin');
        } else if (userRole === 'TEACHER') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 500);
    } catch (err) {
      setOtpError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070E22] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Top Header */}
        <div className="text-center flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="w-7 h-7 text-turquoise-400 stroke-[1.8]" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950 dark:text-white font-sans">
            Platformaga Kirish
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Taʼlim jarayonini davom ettirish uchun hisobingizga kiring.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white dark:bg-[#0B1536] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-5">
          {/* Method selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-navy-950 rounded-xl text-xs font-semibold select-none">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setOtpStep(1);
              }}
              className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                authMethod === 'password'
                  ? 'bg-white dark:bg-[#0B1536] text-navy-950 dark:text-white shadow-card-subtle font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white font-medium'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Parol bilan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setOtpStep(1);
              }}
              className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                authMethod === 'otp'
                  ? 'bg-white dark:bg-[#0B1536] text-navy-950 dark:text-white shadow-card-subtle font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white font-medium'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS / Email OTP</span>
            </button>
          </div>

          {/* METHOD 1: Password Login */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
              <Input
                label="Telefon yoki Elektron pochta"
                placeholder="+998 (90) 123-45-67 yoki email"
                value={identifier}
                onChange={handleIdentifierChange}
                required
              />

              <div className="flex flex-col gap-1.5">
                <Input
                  label="Parol"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <div className="flex items-center justify-between pt-1">
                  <Checkbox
                    label="Meni eslab qol"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-royal-700 hover:underline"
                  >
                    Parolni unutdingizmi?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center mt-2 bg-royal-600 hover:bg-royal-700 text-white shadow-md shadow-royal-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Kirish
              </Button>
            </form>
          )}

          {/* METHOD 2: OTP Login Step 1 */}
          {authMethod === 'otp' && otpStep === 1 && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <Input
                label="Telefon raqami yoki Email"
                placeholder="+998 (90) 123-45-67 yoki email"
                value={identifier}
                onChange={handleIdentifierChange}
                hint="Ushbu manzilga bir martalik 6 xonali tasdiqlash kodi yuboriladi"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center mt-2 bg-royal-600 hover:bg-royal-700 text-white shadow-md shadow-royal-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Bir Martalik Kod Olish (201002)
              </Button>
            </form>
          )}

          {/* METHOD 2: OTP Login Step 2 */}
          {authMethod === 'otp' && otpStep === 2 && (
            <div className="flex flex-col gap-5 py-2">
              <div className="text-center">
                <span className="text-xs text-muted-500 dark:text-slate-400">
                  Kod yuborildi: <strong className="text-navy-950 dark:text-white font-bold">{identifier}</strong>
                </span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <OtpInput
                  length={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={() => handleVerifyOtp()}
                  error={Boolean(otpError)}
                  autoFocus
                />

                <div className="bg-royal-50 dark:bg-royal-950/60 border border-royal-200/80 dark:border-royal-800 text-royal-800 dark:text-royal-300 text-xs px-3.5 py-1.5 rounded-lg flex items-center justify-between w-full max-w-xs shadow-sm">
                  <span className="flex items-center gap-1.5">
                    <span>Tasdiqlash kodi:</span>
                    <strong className="font-mono text-sm tracking-widest text-royal-950 dark:text-royal-100 font-bold bg-white dark:bg-navy-950 px-1.5 py-0.5 rounded border border-royal-200 dark:border-navy-800">
                      201002
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpCode('201002')}
                    className="text-royal-600 dark:text-royal-400 font-bold hover:underline text-[11px] ml-2"
                  >
                    Kiritish
                  </button>
                </div>

                {otpError && (
                  <p className="text-xs font-semibold text-rose-600 text-center">
                    {otpError}
                  </p>
                )}

                <div className="text-center text-xs text-muted-500 dark:text-slate-400 pt-1">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="font-bold text-royal-700 dark:text-royal-400 hover:underline flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kodni qaytadan yuborish</span>
                    </button>
                  ) : (
                    <span>
                      Kodni qayta yuborish:{' '}
                      <strong className="text-navy-950 dark:text-white font-mono font-bold">
                        00:{countdown < 10 ? `0${countdown}` : countdown}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                isLoading={isLoading}
                onClick={handleVerifyOtp}
                className="w-full justify-center mt-2 bg-royal-600 hover:bg-royal-700 text-white shadow-md shadow-royal-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Tasdiqlash va Kirish
              </Button>

              <button
                type="button"
                onClick={() => setOtpStep(1)}
                className="text-xs text-muted-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Raqamni yoki emailni o‘zgartirish</span>
              </button>
            </div>
          )}

          <div className="text-center pt-3 border-t border-slate-100 dark:border-navy-800 text-xs text-muted-500 dark:text-slate-400">
            Hali hisobingiz yo‘qmi?{' '}
            <Link href="/register" className="font-bold text-royal-700 dark:text-royal-400 hover:underline">
              Ro‘yxatdan o‘ting
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
