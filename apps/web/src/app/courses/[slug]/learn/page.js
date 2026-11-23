'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  HelpCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Award,
  Clock,
  BookOpen,
  Volume2,
  Maximize2,
  Play,
  Pause,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button, Badge, Card, useToast, LoadingSpinner } from '@/components/ui';
import { COURSES } from '@/data/mock-data';
import { api } from '@/lib/api';

// Demo curriculum lessons with rich content, materials, and quizzes
const DETAILED_LESSONS = [
  {
    id: 'lesson-1',
    title: '1. Kirish: Zamonaviy Taʼlim Platformasi Arxitekturasi',
    duration: '14:20',
    durationSec: 860,
    moduleTitle: '1-Modul: Loyiha Poydevori va Arxitektura',
    isFree: true,
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    content: `
# Kirish va Loyiha Arxitekturasi

Ushbu amaliy darsda biz O‘zbekiston taʼlim bozori uchun mo‘ljallangan ultra-zamonaviy, yuqori unumdorlikka ega platforma arxitekturasini loyihalashtiramiz.

### Asosiy Tamoyillar:
- **Monorepo yondashuvi**: Frontend (Next.js App Router) va Backend (NestJS) bitta boshqaruv muhitida.
- **Tizim xavfsizligi**: JWT tokenlar, refresh-token rotation, OTP verification tizimi.
- **Doimiy tezlik**: PostgreSQL indeksatsiyasi va Redis orqali yuqori yuklamali keshlash.

> **Eslatma**: Arxitekturadagi har bir qaror real ishlab chiqarish (production) talablaridan kelib chiqib qabul qilinadi.
    `,
    materials: [
      {
        id: 'mat-1',
        title: 'Loyiha Arxitekturasi Slaydlari (PDF)',
        fileSize: '3.4 MB',
        type: 'PDF',
      },
      {
        id: 'mat-2',
        title: 'Texnik Spetsifikatsiya va Loyiha Xaritasi',
        fileSize: '1.2 MB',
        type: 'DOC',
      },
    ],
    quiz: {
      id: 'quiz-1',
      title: '1-Dars Bilimini Sinash Testi',
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'Loyiha arxitekturasida qaysi monorepo vositasidan foydalanilmoqda?',
          options: [
            { id: 'opt1-1', text: 'npm workspaces', isCorrect: true },
            { id: 'opt1-2', text: 'Bower', isCorrect: false },
            { id: 'opt1-3', text: 'Grunt', isCorrect: false },
          ],
          explanation: 'Loyiha bitta repoda frontend va backendni boshqarish uchun npm workspaces standartidan foydalanadi.',
        },
        {
          id: 'q2',
          question: 'Next.js 14 da sahifalar sukut bo‘yicha qanday render qilinadi?',
          options: [
            { id: 'opt2-1', text: 'Server Components orqali', isCorrect: true },
            { id: 'opt2-2', text: 'Faqat Client-side SPA', isCorrect: false },
            { id: 'opt2-3', text: 'Faqat Static HTML', isCorrect: false },
          ],
          explanation: 'Next.js App Router-da har bir sahifa va komponent sukut bo‘yicha React Server Component (RSC) sifatida ishlaydi.',
        },
      ],
    },
  },
  {
    id: 'lesson-2',
    title: '2. Next.js App Router va JavaScript Arxitekturasi',
    duration: '22:45',
    durationSec: 1365,
    moduleTitle: '1-Modul: Loyiha Poydevori va Arxitektura',
    isFree: false,
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    content: `
# Next.js App Router va Server Komponentlar

Next.js App Router anʼanaviy Pages Router-dan tubdan farq qiladi. Biz server va klient chegaralarini to‘g‘ri belgilaymiz.

### O‘rganiladigan Mavzular:
1. Server Components vs Client Components.
2. \`use client\` direktivasidan qachon va qanday to‘g‘ri foydalanish.
3. Streaming SSR va React Suspense yordamida tezkor yuklanish.
4. Layouts, Templates va Dynamic Route segmentlari.

\`\`\`javascript
// Server Component namunasi
export default async function CoursesList() {
  const courses = await getPublishedCourses();
  return (
    <div className="grid grid-cols-3 gap-6">
      {courses.map(course => <CourseCard key={course.id} course={course} />)}
    </div>
  );
}
\`\`\`
    `,
    materials: [
      {
        id: 'mat-3',
        title: 'App Router Cheat Sheet (PDF)',
        fileSize: '2.1 MB',
        type: 'PDF',
      },
      {
        id: 'mat-4',
        title: 'Darsdagi manba kodlari (ZIP)',
        fileSize: '4.8 MB',
        type: 'ZIP',
      },
    ],
    quiz: {
      id: 'quiz-2',
      title: 'App Router va Server Komponentlar Testi',
      passingScore: 70,
      questions: [
        {
          id: 'q2-1',
          question: 'React Server Component (RSC) klient brauzeriga qanday formatda uzatiladi?',
          options: [
            { id: 'opt2-1a', text: 'Maxsus RSC Stream / JSON formatida', isCorrect: true },
            { id: 'opt2-1b', text: 'Barcha JavaScript fayllari bilan birga', isCorrect: false },
            { id: 'opt2-1c', text: 'Faqat iframe orqali', isCorrect: false },
          ],
          explanation: 'RSC klient brauzeriga ortiqcha JS paketlarini yubormasdan, maxsus oqim (stream) formatida uzatiladi.',
        },
      ],
    },
  },
  {
    id: 'lesson-3',
    title: '3. NestJS REST API va Prisma ORM Integratsiyasi',
    duration: '28:10',
    durationSec: 1690,
    moduleTitle: '2-Modul: Maʼlumotlar Bazasi va Prisma ORM',
    isFree: false,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    content: `
# NestJS Backend va Prisma ORM

NestJS mustahkam korporativ arxitektura qurish imkonini beradi. Ushbu darsda biz PostgreSQL sxemalarini Prisma orqali boshqaramiz.

### Asosiy qadamlar:
- Modul, Kontroller va Servislar tuzilmasi.
- DTO (Data Transfer Objects) va kiruvchi so‘rovlarni tekshirish.
- Prisma Client generatsiyasi va avtomatlashtirilgan migratsiyalar.
- Ko‘p jadvalli munosabatlar (Relations, Indexes, Unique Constraints).
    `,
    materials: [
      {
        id: 'mat-5',
        title: 'Prisma Schema va SQL DDL Skriptlari',
        fileSize: '1.8 MB',
        type: 'SQL',
      },
    ],
    quiz: {
      id: 'quiz-3',
      title: 'NestJS va Prisma Bilim Sinovi',
      passingScore: 70,
      questions: [
        {
          id: 'q3-1',
          question: 'Prisma ORM da sxemani o‘zgartirgach yangi migratsiya yaratish buyrug‘i qaysi?',
          options: [
            { id: 'opt3-1a', text: 'prisma migrate dev', isCorrect: true },
            { id: 'opt3-1b', text: 'prisma build schema', isCorrect: false },
            { id: 'opt3-1c', text: 'prisma run update', isCorrect: false },
          ],
          explanation: 'prisma migrate dev buyrug‘i yangi SQL migratsiya faylini hosil qiladi va bazaga qo‘llaydi.',
        },
      ],
    },
  },
];

const COURSE_LESSONS = {
  'nextjs-va-nestjs-bilan-zamonaviy-platforma': [
    DETAILED_LESSONS[0],
    DETAILED_LESSONS[1],
    DETAILED_LESSONS[2],
  ],
  'professional-figma-va-ui-ux-dizayn': [
    {
      id: 'figma-lesson-1',
      title: '1. Figma interfeysi va dizayn asoslari',
      duration: '18:20',
      durationSec: 1100,
      moduleTitle: '1-Modul: UI Dizayn Asoslari',
      isFree: true,
      videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
      content: '# Figma interfeysi\n\nFrames, shape tool, tipografika, ranglar va bo‘shliq tizimlarini amaliyotda o‘rganamiz.',
      materials: [{ id: 'figma-mat-1', title: 'Figma boshlang‘ich qo‘llanma', fileSize: '1.8 MB', type: 'PDF' }],
      quiz: { id: 'figma-quiz-1', title: 'Figma asoslari testi', passingScore: 70, questions: [] },
    },
    {
      id: 'figma-lesson-2',
      title: '2. Auto-layout va komponentlar',
      duration: '24:10',
      durationSec: 1450,
      moduleTitle: '1-Modul: UI Dizayn Asoslari',
      isFree: false,
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      content: '# Auto-layout va komponentlar\n\nMoslashuvchan layout, komponentlar, variantlar va amaliy UI elementlarini quramiz.',
      materials: [{ id: 'figma-mat-2', title: 'Komponentlar checklist', fileSize: '900 KB', type: 'PDF' }],
      quiz: { id: 'figma-quiz-2', title: 'Auto-layout testi', passingScore: 70, questions: [] },
    },
  ],
  'python-va-suniy-intellekt-asoslari': [
    {
      id: 'python-lesson-1',
      title: '1. Python sintaksisi va o‘zgaruvchilar',
      duration: '16:45',
      durationSec: 1005,
      moduleTitle: '1-Modul: Python Asoslari',
      isFree: true,
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      content: '# Python asoslari\n\nPython sintaksisi, o‘zgaruvchilar, shartlar, sikllar va funksiyalar amaliy misollarda.',
      materials: [{ id: 'python-mat-1', title: 'Python amaliy topshiriqlar', fileSize: '1.1 MB', type: 'PDF' }],
      quiz: { id: 'python-quiz-1', title: 'Python asoslari testi', passingScore: 70, questions: [] },
    },
  ],
  'ielts-masterclass-akademik-tayyorgarlik': [
    {
      id: 'ielts-lesson-1',
      title: '1. IELTS Listening: kalit so‘zlar strategiyasi',
      duration: '21:30',
      durationSec: 1290,
      moduleTitle: '1-Modul: Listening & Reading',
      isFree: true,
      videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
      content: '# IELTS Listening\n\nKalit so‘zlar, sinonimlar, audio savollar va Listening strategiyalarini amaliy mashq qilamiz.',
      materials: [{ id: 'ielts-mat-1', title: 'Listening amaliy testlar', fileSize: '2.4 MB', type: 'PDF' }],
      quiz: { id: 'ielts-quiz-1', title: 'Listening strategiyasi testi', passingScore: 70, questions: [] },
    },
    {
      id: 'ielts-lesson-2',
      title: '2. Reading: tezkor o‘qish va chalg‘ituvchi savollar',
      duration: '23:15',
      durationSec: 1395,
      moduleTitle: '1-Modul: Listening & Reading',
      isFree: false,
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      content: '# IELTS Reading\n\nSkimming, scanning va True/False/Not Given savollarini yechish usullarini o‘rganamiz.',
      materials: [{ id: 'ielts-mat-2', title: 'Reading topshiriqlari', fileSize: '2.0 MB', type: 'PDF' }],
      quiz: { id: 'ielts-quiz-2', title: 'Reading testi', passingScore: 70, questions: [] },
    },
  ],
};

function LessonPlayerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const slug = params?.slug;
  const course = COURSES.find((c) => c.slug === slug) || COURSES[0];
  const lessonCatalog = COURSE_LESSONS[slug] || COURSE_LESSONS[COURSES[0].slug];

  const initialLessonIndex = Number(searchParams.get('lesson')) || 0;
  const [currentIdx, setCurrentIdx] = useState(
    initialLessonIndex >= 0 && initialLessonIndex < lessonCatalog.length
      ? initialLessonIndex
      : 0
  );

  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'text' | 'quiz' | 'materials'
  const [completedLessons, setCompletedLessons] = useState(new Set(['lesson-1']));
  const [isPlaying, setIsPlaying] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState([]);

  const currentLesson = lessonCatalog[currentIdx];

  // Calculate course progress
  const progressPct = useMemo(() => {
    return Math.round((completedLessons.size / lessonCatalog.length) * 100);
  }, [completedLessons, lessonCatalog]);

  const handleSelectLesson = (idx) => {
    setCurrentIdx(idx);
    setQuizResult(null);
    setQuizAnswers({});
    setIsPlaying(false);
    router.replace(`/courses/${slug}/learn?lesson=${idx}`);
  };

  const handleToggleComplete = async () => {
    const updated = new Set(completedLessons);
    const isCompletedNow = !updated.has(currentLesson.id);

    if (!isCompletedNow) {
      updated.delete(currentLesson.id);
      toast({
        title: 'Holat yangilandi',
        description: 'Dars tugallanmagan holatga qaytarildi.',
        type: 'info',
      });
    } else {
      updated.add(currentLesson.id);
      toast({
        title: 'Tabriklaymiz!',
        description: 'Dars muvaffaqiyatli yakunlandi.',
        type: 'success',
      });
    }
    setCompletedLessons(updated);

    // Sync with real backend progress API if authenticated
    try {
      if (currentLesson.id && !currentLesson.id.startsWith('demo-')) {
        await api.progress.updateLessonProgress(currentLesson.id, {
          isCompleted: isCompletedNow,
          lastPositionSeconds: 0,
        });
      }
    } catch (e) {
      // ignore
    }
  };

  const handleQuizAnswer = (qId, optId) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmitQuiz = () => {
    const quiz = currentLesson.quiz;
    if (!quiz) return;

    const unanswered = quiz.questions.filter((q) => !quizAnswers[q.id]);
    if (unanswered.length > 0) {
      toast({
        title: 'Diqqat',
        description: 'Barcha savollarga javob belgilashingiz kerak.',
        type: 'warning',
      });
      return;
    }

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      const selectedId = quizAnswers[q.id];
      const selectedOpt = q.options.find((o) => o.id === selectedId);
      if (selectedOpt && selectedOpt.isCorrect) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = {
      id: `att-${Date.now()}`,
      date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      score,
      passed,
      correctCount,
      totalCount: quiz.questions.length,
    };

    setQuizResult({
      score,
      passed,
      correctCount,
      totalCount: quiz.questions.length,
    });

    setAttemptHistory((prev) => [attempt, ...prev]);

    if (passed) {
      // Auto-complete lesson
      const updated = new Set(completedLessons);
      updated.add(currentLesson.id);
      setCompletedLessons(updated);

      toast({
        title: `Aʼlo natija: ${score}%!`,
        description: 'Testdan muvaffaqiyatli o‘tdingiz va dars yakunlandi.',
        type: 'success',
      });
    } else {
      toast({
        title: `Natija: ${score}%`,
        description: `O‘tish bali ${quiz.passingScore}%. Qayta urinib ko‘ring.`,
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Learning Navigation Bar */}
      <header className="h-16 bg-navy-950 border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${slug}`}
            className="p-2 hover:bg-navy-900 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kursga qaytish</span>
          </Link>
          <div className="h-5 w-px bg-navy-800 hidden sm:block" />
          <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
            {course.title}
          </h1>
        </div>

        {/* Course Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-slate-300 font-medium">
              Umumiy progress:{' '}
              <strong className="text-turquoise-400 font-bold">{progressPct}%</strong>
            </span>
            <div className="w-28 sm:w-36 h-2 bg-navy-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-royal-600 to-turquoise-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          {progressPct === 100 && (
            <Badge variant="turquoise" size="sm" className="hidden md:inline-flex">
              Tugatildi
            </Badge>
          )}
        </div>
      </header>

      {/* Main Learning Space */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Active Lesson Stage */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Media Player Area */}
          <div className="w-full bg-black flex items-center justify-center relative aspect-video max-h-[65vh]">
            {activeTab === 'video' ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                <video
                  src={currentLesson.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            ) : activeTab === 'text' ? (
              <div className="w-full h-full bg-navy-950 p-6 sm:p-10 overflow-y-auto text-left text-slate-200">
                <div className="max-w-3xl mx-auto flex flex-col gap-4 text-xs sm:text-sm leading-relaxed">
                  <Badge variant="navy" size="sm" className="self-start">
                    Dars Konspekti
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {currentLesson.title}
                  </h2>
                  <div className="whitespace-pre-line text-slate-300 font-sans">
                    {currentLesson.content}
                  </div>
                </div>
              </div>
            ) : activeTab === 'quiz' ? (
              <div className="w-full h-full bg-navy-950 p-6 sm:p-10 overflow-y-auto text-left text-slate-200">
                <div className="max-w-2xl mx-auto flex flex-col gap-6">
                  <div>
                    <Badge variant="warning" size="sm" className="mb-2">
                      Bilim Sinovi (Quiz)
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {currentLesson.quiz?.title || 'Dars Testi'}
                    </h2>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      O‘tish bali: {currentLesson.quiz?.passingScore || 70}%. Har bir savolga to‘g‘ri javobni tanlang.
                    </p>
                  </div>

                  {quizResult && (
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        quizResult.passed
                          ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-200'
                          : 'bg-rose-950/60 border-rose-600/50 text-rose-200'
                      }`}
                    >
                      {quizResult.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-sm block">
                          {quizResult.passed
                            ? `Muvaffaqiyatli: ${quizResult.score}% to‘plandi!`
                            : `Sinovdan o‘ta olmadingiz: ${quizResult.score}%`}
                        </span>
                        <span className="block mt-0.5 text-slate-200">
                          {quizResult.correctCount} / {quizResult.totalCount} ta to‘g‘ri javob.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  <div className="flex flex-col gap-6">
                    {currentLesson.quiz?.questions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="bg-navy-900/90 p-5 rounded-xl border border-navy-800 flex flex-col gap-3"
                      >
                        <span className="text-xs font-bold text-slate-100">
                          {qIdx + 1}-Savol: {q.question}
                        </span>

                        <div className="flex flex-col gap-2">
                          {q.options.map((opt) => {
                            const isSelected = quizAnswers[q.id] === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleQuizAnswer(q.id, opt.id)}
                                className={`text-left p-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-royal-600/30 border-royal-500 text-white'
                                    : 'bg-navy-950/50 border-navy-800 text-slate-300 hover:border-slate-600'
                                }`}
                              >
                                <span>{opt.text}</span>
                                {isSelected ? (
                                  <div className="w-4 h-4 rounded-full bg-royal-500 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizResult && (
                          <div className="text-[11px] text-slate-400 bg-navy-950 p-3 rounded-lg border border-navy-800/80">
                            <strong>Izoh:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmitQuiz}
                    >
                      Javoblarni Tekshirish
                    </Button>

                    {quizResult && !quizResult.passed && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setQuizResult(null);
                          setQuizAnswers({});
                        }}
                      >
                        Qayta topshirish
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Materials Tab */
              <div className="w-full h-full bg-navy-950 p-6 sm:p-10 overflow-y-auto text-left text-slate-200">
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                  <div>
                    <Badge variant="turquoise" size="sm" className="mb-2">
                      Fayllar va Resurslar
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Darsga tegishli materiallar
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Dars davomida ko‘rsatilgan barcha manbalar va qo‘llanmalar.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    {currentLesson.materials?.map((mat) => (
                      <div
                        key={mat.id}
                        className="bg-navy-900 p-4 rounded-xl border border-navy-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-navy-950 rounded-lg text-turquoise-400">
                            <Download className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              {mat.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Hajmi: {mat.fileSize} • Turi: {mat.type}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => {
                            toast({
                              title: 'Yuklab olinmoqda',
                              description: `${mat.title} muvaffaqiyatli saqlandi.`,
                              type: 'success',
                            });
                          }}
                        >
                          Yuklab olish
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action and Switcher Bar */}
          <div className="bg-navy-950 border-y border-navy-800 p-4 flex flex-wrap items-center justify-between gap-3">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-navy-900/90 p-1 rounded-xl border border-navy-800">
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'video'
                    ? 'bg-royal-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'text'
                    ? 'bg-royal-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Matn / Konspekt</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'quiz'
                    ? 'bg-royal-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz / Test</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('materials')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'materials'
                    ? 'bg-royal-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Materiallar</span>
              </button>
            </div>

            {/* Navigation and Completion Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentIdx === 0}
                onClick={() => handleSelectLesson(currentIdx - 1)}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Oldingi
              </Button>

              <Button
                variant={completedLessons.has(currentLesson.id) ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleToggleComplete}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              >
                {completedLessons.has(currentLesson.id)
                  ? 'Tugallangan'
                  : 'Darsni yakunlash'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={currentIdx === lessonCatalog.length - 1}
                onClick={() => handleSelectLesson(currentIdx + 1)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Keyingi
              </Button>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Curriculum Drawer */}
        <aside className="w-full lg:w-80 xl:w-96 bg-navy-950 border-t lg:border-t-0 lg:border-l border-navy-800 flex flex-col h-auto lg:h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-navy-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Kurs Mundarijasi
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {completedLessons.size} / {lessonCatalog.length} tugatildi
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-navy-900/60 p-2">
            {lessonCatalog.map((lesson, idx) => {
              const isCurrent = idx === currentIdx;
              const isCompleted = completedLessons.has(lesson.id);

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => handleSelectLesson(idx)}
                  className={`w-full p-3.5 rounded-xl text-left flex items-start gap-3 transition-colors ${
                    isCurrent
                      ? 'bg-navy-900 border border-royal-500/40 text-white'
                      : 'hover:bg-navy-900/50 text-slate-300'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <PlayCircle className="w-4 h-4 text-turquoise-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs block font-semibold leading-snug line-clamp-2 ${
                        isCurrent ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {lesson.title}
                    </span>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </span>
                      <span>•</span>
                      <span>{lesson.isFree ? 'Bepul' : 'Aʼzolar uchun'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function LessonPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-white">
          <LoadingSpinner size="lg" />
          <span className="text-xs text-slate-400">Dars muhiti yuklanmoqda...</span>
        </div>
      }
    >
      <LessonPlayerContent />
    </Suspense>
  );
}
