'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  BookOpen,
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

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Mode: 'email' | 'phone'
  const [method, setMethod] = useState('phone');
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'TEACHER'

  // Step 1: Form | Step 2: OTP Verification | Step 3: Success
  const [step, setStep] = useState(1);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);

  // OTP fields
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Countdown timer for Step 2
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handlePhoneChange = (e) => {
    const formatted = formatUzPhone(e.target.value);
    setPhone(formatted);
  };

  const getTargetIdentifier = () => {
    return method === 'email' ? email.trim().toLowerCase() : cleanPhoneForApi(phone);
  };

  // Step 1: Send OTP & Validate
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({
        title: 'Ismingizni kiriting',
        description: 'Iltimos, to‘liq ism-familiyangizni kiriting.',
        type: 'warning',
      });
      return;
    }

    if (method === 'email') {
      if (!email.includes('@') || !email.includes('.')) {
        toast({
          title: 'Noto‘g‘ri email',
          description: 'Iltimos, haqiqiy elektron pochta manzilini kiriting.',
          type: 'warning',
        });
        return;
      }
    } else {
      if (!isValidUzPhone(phone)) {
        toast({
          title: 'Noto‘g‘ri telefon raqami',
          description: 'Iltimos, haqiqiy O‘zbekiston (+998) telefon raqamini kiriting.',
          type: 'warning',
        });
        return;
      }
    }

    if (password.length < 6) {
      toast({
        title: 'Kuchsiz parol',
        description: 'Parol kamida 6 ta belgidan iborat bo‘lishi lozim.',
        type: 'warning',
      });
      return;
    }

    if (!termsAgreed) {
      toast({
        title: 'Shartlarga rozilik',
        description: 'Platformadan foydalanish shartlariga rozilik bildiring.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const target = getTargetIdentifier();
      const res = await api.auth.sendOtp(target);

      if (!res.success) {
        toast({
          title: 'Xatolik yuz berdi',
          description: res.error || 'Tasdiqlash kodini yuborib bo‘lmadi',
          type: 'danger',
        });
        return;
      }

      setStep(2);
      setCountdown(res.data?.resendCooldownSeconds || 60);
      setCanResend(false);
      const incomingDevOtp = res.data?.devOtp || '201002';
      setDevOtpHint(incomingDevOtp);
      setOtpCode(incomingDevOtp);
      setOtpError('');
      toast({
        title: 'Tasdiqlash kodi yuborildi',
        description: `${
          method === 'email' ? `Kod ${email} ga` : `SMS kod ${phone} raqamiga`
        } yuborildi. (Tasdiqlash kodi: ${incomingDevOtp})`,
        type: 'info',
      });
    } catch (err) {
      toast({
        title: 'Tarmoq xatosi',
        description: err.message || 'Server bilan bog‘lanib bo‘lmadi',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Register Account
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();

    const finalOtp = otpCode && otpCode.length === 6 ? otpCode : (devOtpHint || '201002');

    setIsLoading(true);
    setOtpError('');

    try {
      const regRes = await api.auth.register({
        email: method === 'email' ? email.trim() : null,
        phone: method === 'phone' ? cleanPhoneForApi(phone) : null,
        password,
        fullName: fullName.trim(),
        role,
        otp: finalOtp,
      });

      if (!regRes.success) {
        setOtpError(regRes.error || 'Tasdiqlash kodi noto‘g‘ri yoki xatolik yuz berdi');
        return;
      }

      if (regRes.data?.accessToken) {
        setAuthTokens(regRes.data.accessToken, regRes.data.refreshToken, regRes.data.user);
      }

      setStep(3);
      toast({
        title: 'Hisob muvaffaqiyatli ochildi!',
        description: 'Ultra+ Taʼlim platformasiga xush kelibsiz. Kabinetga yo‘naltirilmoqda...',
        type: 'success',
      });

      // Auto redirect after registration
      setTimeout(() => {
        router.push(role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard');
      }, 1200);
    } catch (err) {
      setOtpError(err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      const target = getTargetIdentifier();
      const res = await api.auth.sendOtp(target);
      if (res.success) {
        setCountdown(res.data?.resendCooldownSeconds || 60);
        setCanResend(false);
        const incomingDevOtp = res.data?.devOtp || '';
        setDevOtpHint(incomingDevOtp);
        if (incomingDevOtp) setOtpCode(incomingDevOtp);
        setOtpError('');
        toast({
          title: 'Kod qaytadan yuborildi',
          description: `Yangi tasdiqlash kodi yuborildi.${incomingDevOtp ? ` (Kod: ${incomingDevOtp})` : ''}`,
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
        title: 'Xatolik',
        description: err.message,
        type: 'danger',
      });
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
            {step === 1 && 'Ro‘yxatdan O‘tish'}
            {step === 2 && 'Tasdiqlash Kodini Kiriting'}
            {step === 3 && 'Muvaffaqiyatli Ro‘yxatdan O‘tdingiz!'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            {step === 1 && 'Zamonaviy taʼlim platformasida bepul hisob oching.'}
            {step === 2 &&
              (method === 'email'
                ? `${email} manziliga yuborilgan kodni kiriting`
                : `${phone} raqamiga yuborilgan SMS kodni kiriting`)}
            {step === 3 && 'Hisobingiz muvaffaqiyatli faollashtirildi.'}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white dark:bg-[#0B1536] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-5">
          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <>
              {/* Method Switch: Phone vs Email */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-navy-950 rounded-xl text-xs font-semibold select-none">
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    method === 'phone'
                      ? 'bg-white dark:bg-[#0B1536] text-navy-950 dark:text-white shadow-card-subtle font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white font-medium'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Telefon (+998)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    method === 'email'
                      ? 'bg-white dark:bg-[#0B1536] text-navy-950 dark:text-white shadow-card-subtle font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white font-medium'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email orqali</span>
                </button>
              </div>

              {/* Role selector */}
              <div className="flex items-center gap-4 text-xs pt-0.5">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Kim sifatida ro‘yxatdan o‘tasiz?</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-navy-900 dark:text-slate-200">
                    <input
                      type="radio"
                      name="role"
                      value="STUDENT"
                      checked={role === 'STUDENT'}
                      onChange={() => setRole('STUDENT')}
                      className="accent-royal-700"
                    />
                    <span>O‘quvchi</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-navy-900 dark:text-slate-200">
                    <input
                      type="radio"
                      name="role"
                      value="TEACHER"
                      checked={role === 'TEACHER'}
                      onChange={() => setRole('TEACHER')}
                      className="accent-royal-700"
                    />
                    <span>Ustoz</span>
                  </label>
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <Input
                  label="To‘liq Ismingiz"
                  placeholder="Ism va familiyangiz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                {method === 'phone' ? (
                  <Input
                    label="Telefon Raqami (O‘zbekiston)"
                    type="tel"
                    placeholder="+998 (90) 123-45-67"
                    value={phone}
                    onChange={handlePhoneChange}
                    leftIcon={<Smartphone className="w-4 h-4" />}
                    hint="Ushbu raqamga bir martalik 6 xonali SMS kod yuboriladi"
                    required
                  />
                ) : (
                  <Input
                    label="Elektron Pochta"
                    type="email"
                    placeholder="pochta@domain.uz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    hint="Ushbu pochtaga 6 xonali tasdiqlash kodi yuboriladi"
                    required
                  />
                )}

                <Input
                  label="Parol"
                  type="password"
                  placeholder="Kamida 6 ta belgi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <div className="pt-1">
                  <Checkbox
                    label="Foydalanish shartlari va maxfiylik siyosatiga roziman"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="w-full justify-center h-12 text-sm font-semibold rounded-xl bg-royal-600 hover:bg-royal-700 text-white shadow-md shadow-royal-600/20 mt-1"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Tasdiqlash Kodini Olish (201002)
                </Button>
              </form>

              <div className="text-center pt-3 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-400">
                Allaqachon hisobingiz bormi?{' '}
                <Link href="/login" className="font-bold text-royal-700 dark:text-royal-400 hover:underline">
                  Tizimga kiring
                </Link>
              </div>
            </>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <div className="flex flex-col gap-6 py-2">
              <div className="flex flex-col items-center gap-4">
                <OtpInput
                  length={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={() => handleVerifyOtp()}
                  error={Boolean(otpError)}
                  autoFocus
                />

                {devOtpHint && (
                  <div className="bg-royal-50 dark:bg-royal-950/60 border border-royal-200/80 dark:border-royal-800 text-royal-800 dark:text-royal-300 text-xs px-3.5 py-1.5 rounded-lg flex items-center justify-between w-full max-w-xs shadow-sm">
                    <span className="flex items-center gap-1.5">
                      <span>Tasdiqlash kodi:</span>
                      <strong className="font-mono text-sm tracking-widest text-royal-950 dark:text-royal-100 font-bold bg-white dark:bg-navy-950 px-1.5 py-0.5 rounded border border-royal-200 dark:border-navy-800">
                        {devOtpHint}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devOtpHint)}
                      className="text-royal-600 font-bold hover:underline text-[11px] ml-2"
                    >
                      Kiritish
                    </button>
                  </div>
                )}

                {otpError && (
                  <p className="text-xs font-semibold text-rose-600 text-center animate-shake">
                    {otpError}
                  </p>
                )}

                <div className="text-center text-xs text-muted-500">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-royal-700 hover:underline flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kodni qaytadan yuborish</span>
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
                  onClick={handleVerifyOtp}
                  className="w-full justify-center bg-royal-600 hover:bg-royal-700 text-white shadow-md shadow-royal-600/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Tasdiqlash va Ro‘yxatdan O‘tish
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpCode('');
                    setOtpError('');
                  }}
                  className="text-xs text-muted-500 hover:text-navy-900 dark:hover:text-white py-1 flex items-center justify-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Maʼlumotlarni o‘zgartirish</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-9 h-9 stroke-[2]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-navy-950 dark:text-white">
                  Tabriklaymiz, {fullName}!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Hisobingiz muvaffaqiyatli tasdiqlandi. Shaxsiy kabinetga yo‘naltirilmoqda...
                </p>
              </div>

              <div className="w-full mt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push(role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard')}
                  className="w-full justify-center bg-royal-600 hover:bg-royal-700 text-white shadow-md shadow-royal-600/30"
                >
                  Kabinetga O‘tish
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
