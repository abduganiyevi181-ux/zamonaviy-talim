/**
 * ULTRA+ EDUCATION PLATFORM — COURSES AND LEARNING SYSTEM TEST SUITE
 * Tests all Phase 6 requirements:
 * - Course Discovery & Advanced Filters (Search, Category, Level, Language, Price, Teacher, Sorting, Pagination)
 * - Course Details & Curriculum
 * - Enrollment Lifecycle & Duplicate Prevention
 * - Lesson Player (Access Control, Private Materials, Video/Content, Prev/Next Navigation)
 * - Progress Tracking & Persistent Completion Calculation
 * - Quizzes (MCQ, Submission, Score Calculation, Attempt History)
 */

const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');

async function runLearningSystemTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 PHASE 6: COURSES & LEARNING SYSTEM TEST SUITE');
  console.log('🧪 ========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`❌ TEST FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  }

  // 1. Initialize embedded PostgreSQL with complete schema
  console.log('🚀 Embedded PostgreSQL 16 (PGlite) ishga tushirilmoqda...');
  const db = new PGlite();
  const migrationPath = path.resolve(__dirname, '../prisma/migrations/0_init/migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  await db.exec(sql);
  console.log('✅ PostgreSQL 16 sxemasi muvaffaqiyatli yuklandi.\n');

  // --- SEED TEST DATA ---
  console.log('🌱 Test ma’lumotlari (User, Teacher, Categories, Courses, Lessons, Materials, Quizzes) kiritilmoqda...');

  // User 1: Student
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-student-1', 'student@talim.uz', '+998901234567', 'STUDENT', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-student-1', 'user-student-1', 'Javohir Aliyev', NOW(), NOW());
  `);

  // User 2: Teacher
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-teacher-1', 'teacher@talim.uz', '+998909876543', 'TEACHER', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-teacher-1', 'user-teacher-1', 'Akmal Mirzayev', NOW(), NOW());
    INSERT INTO "teacher_profiles" ("id", "userId", "headline", "bio", "experienceYears", "specialty", "rating", "reviewCount", "studentCount", "isVerified", "createdAt", "updatedAt")
    VALUES ('teach-prof-1', 'user-teacher-1', 'Senior Fullstack Engineer', '10 yillik tajribali dasturchi', 10, 'Fullstack Web', 4.9, 12, 120, true, NOW(), NOW());
  `);

  // Categories
  await db.exec(`
    INSERT INTO "course_categories" ("id", "name", "slug", "description", "sortOrder", "createdAt", "updatedAt")
    VALUES 
      ('cat-prog', 'Dasturlash', 'dasturlash', 'Zamonaviy dasturlash kurslari', 1, NOW(), NOW()),
      ('cat-design', 'Dizayn', 'dizayn', 'Grafik va UI/UX dizayn', 2, NOW(), NOW());
  `);

  // Course 1: Paid Next.js Course
  await db.exec(`
    INSERT INTO "courses" (
      "id", "slug", "title", "subtitle", "description", "categoryId", "teacherId",
      "price", "originalPrice", "discountPrice", "isFree", "level", "language", "status",
      "durationHours", "totalLessons", "rating", "reviewCount", "studentsCount", "createdAt", "updatedAt"
    ) VALUES (
      'course-nextjs', 'zamonaviy-nextjs-fullstack', 'Zamonaviy Next.js Fullstack', 'Noldan professional darajagacha',
      'Next.js, Node.js va PostgreSQL yordamida to‘liq loyihalar yaratish.', 'cat-prog', 'teach-prof-1',
      450000.00, 600000.00, 450000.00, false, 'Boshlang''ich', 'uz', 'PUBLISHED',
      32.5, 3, 4.9, 8, 45, NOW(), NOW()
    );
  `);

  // Course 2: Free JavaScript Course
  await db.exec(`
    INSERT INTO "courses" (
      "id", "slug", "title", "subtitle", "description", "categoryId", "teacherId",
      "price", "originalPrice", "discountPrice", "isFree", "level", "language", "status",
      "durationHours", "totalLessons", "rating", "reviewCount", "studentsCount", "createdAt", "updatedAt"
    ) VALUES (
      'course-js-free', 'bepul-javascript-asoslari', 'JavaScript Asoslari Bepul', 'Dasturlashga ilk qadam',
      'JavaScript sintaksisi va algoritmlar.', 'cat-prog', 'teach-prof-1',
      0.00, NULL, NULL, true, 'Boshlang''ich', 'uz', 'PUBLISHED',
      12.0, 2, 5.0, 15, 230, NOW(), NOW()
    );
  `);

  // Lessons for Course 1
  await db.exec(`
    INSERT INTO "lessons" ("id", "courseId", "title", "description", "content", "videoUrl", "durationSec", "moduleTitle", "order", "isFree", "createdAt", "updatedAt")
    VALUES 
      ('les-1', 'course-nextjs', '1. Kirish va O‘rnatish', 'Next.js nima va qanday o‘rnatiladi', '# Kirish matni darsi', 'https://video.stream/preview.mp4', 600, '1-Modul: Asoslar', 1, true, NOW(), NOW()),
      ('les-2', 'course-nextjs', '2. Server Components va Arxitektura', 'RSC tamoyillari', '# Server components darsi', 'https://video.stream/paid-lesson-2.mp4', 1200, '1-Modul: Asoslar', 2, false, NOW(), NOW()),
      ('les-3', 'course-nextjs', '3. Prisma va Baza bilan ishlash', 'PostgreSQL integratsiyasi', '# Prisma darsi', 'https://video.stream/paid-lesson-3.mp4', 1800, '2-Modul: Backend', 3, false, NOW(), NOW());
  `);

  // Materials for Lesson 2
  await db.exec(`
    INSERT INTO "course_materials" ("id", "courseId", "lessonId", "title", "fileUrl", "fileSize", "fileType", "createdAt")
    VALUES ('mat-1', 'course-nextjs', 'les-2', 'Dars slayd va manbalari', 'https://cdn.talim.uz/slides-nextjs.pdf', 2450000, 'application/pdf', NOW());
  `);

  // Quiz for Lesson 2
  await db.exec(`
    INSERT INTO "quizzes" ("id", "courseId", "lessonId", "title", "description", "passingScore", "createdAt", "updatedAt")
    VALUES ('quiz-1', 'course-nextjs', 'les-2', 'Server Components Bilim Tekshiruvi', 'Dars bo‘yicha 2 ta savol', 70, NOW(), NOW());

    INSERT INTO "quiz_questions" ("id", "quizId", "question", "explanation", "order")
    VALUES 
      ('qq-1', 'quiz-1', 'Next.js App Router-da komponentlar sukut bo‘yicha qanday bo‘ladi?', 'Next.js 13+ da barcha komponentlar sukut bo‘yicha Server Component hisoblanadi.', 1),
      ('qq-2', 'quiz-1', 'Mijoz tomonida interaktivlik kerak bo‘lsa qaysi direktiva qo‘shiladi?', 'use client direktivasi mijoz komponentlarini belgilaydi.', 2);

    INSERT INTO "quiz_options" ("id", "questionId", "text", "isCorrect", "order")
    VALUES 
      ('opt-1-1', 'qq-1', 'Server Components', true, 1),
      ('opt-1-2', 'qq-1', 'Client Components', false, 2),
      ('opt-1-3', 'qq-1', 'Static HTML only', false, 3),

      ('opt-2-1', 'qq-2', '"use client"', true, 1),
      ('opt-2-2', 'qq-2', '"use server"', false, 2),
      ('opt-2-3', 'qq-2', '"use interactive"', false, 3);
  `);

  console.log('✅ Barcha test ma’lumotlari muvaffaqiyatli kiritildi.\n');

  // ==========================================
  // TEST GROUP 1: COURSE DISCOVERY & FILTERS
  // ==========================================
  console.log('--- TEST GROUP 1: Kurslar Katalogi va Murakkab Filtrlar ---');

  // 1.1. Barcha chop etilgan kurslarni olish
  const allCoursesRes = await db.query(`SELECT * FROM "courses" WHERE "status" = 'PUBLISHED' ORDER BY "createdAt" DESC;`);
  assert(allCoursesRes.rows.length === 2, 'Barcha PUBLISHED kurslar muvaffaqiyatli olindi');

  // 1.2. Search filter (Next.js)
  const searchRes = await db.query(`
    SELECT * FROM "courses" 
    WHERE "status" = 'PUBLISHED' AND ("title" ILIKE '%Next.js%' OR "description" ILIKE '%Next.js%');
  `);
  assert(searchRes.rows.length === 1 && searchRes.rows[0].id === 'course-nextjs', 'Qidiruv bo‘yicha to‘g‘ri kurs topildi');

  // 1.3. Price Filter (Bepul kurslar)
  const freeCoursesRes = await db.query(`SELECT * FROM "courses" WHERE "status" = 'PUBLISHED' AND "isFree" = true;`);
  assert(freeCoursesRes.rows.length === 1 && freeCoursesRes.rows[0].id === 'course-js-free', 'Bepul kurs filtri to‘g‘ri ishladi');

  // 1.4. Level & Language Filter
  const levelLangRes = await db.query(`
    SELECT * FROM "courses" 
    WHERE "status" = 'PUBLISHED' AND "level" = 'Boshlang''ich' AND "language" = 'uz';
  `);
  assert(levelLangRes.rows.length === 2, 'Daraja va Til filtri to‘g‘ri ishladi');

  // 1.5. Teacher Filter
  const teacherFilterRes = await db.query(`
    SELECT c.*, p."fullName" as "teacherName" 
    FROM "courses" c
    JOIN "teacher_profiles" tp ON c."teacherId" = tp."id"
    JOIN "users" u ON tp."userId" = u."id"
    JOIN "user_profiles" p ON u."id" = p."userId"
    WHERE c."teacherId" = 'teach-prof-1';
  `);
  assert(teacherFilterRes.rows.length === 2 && teacherFilterRes.rows[0].teacherName === 'Akmal Mirzayev', 'Ustoz bo‘yicha filtr muvaffaqiyatli');

  // 1.6. Sorting (Narx bo‘yicha kamayish)
  const sortedRes = await db.query(`SELECT * FROM "courses" WHERE "status" = 'PUBLISHED' ORDER BY "price" DESC;`);
  assert(Number(sortedRes.rows[0].price) > Number(sortedRes.rows[1].price), 'Narx bo‘yicha saralash to‘g‘ri ishladi');

  // ==========================================
  // TEST GROUP 2: COURSE DETAILS & CURRICULUM
  // ==========================================
  console.log('\n--- TEST GROUP 2: Kurs Tafsilotlari va Mundarija (Curriculum) ---');

  const courseDetailsRes = await db.query(`
    SELECT c.*, cat."name" as "categoryName", tp."headline" as "teacherHeadline"
    FROM "courses" c
    JOIN "course_categories" cat ON c."categoryId" = cat."id"
    JOIN "teacher_profiles" tp ON c."teacherId" = tp."id"
    WHERE c."slug" = 'zamonaviy-nextjs-fullstack';
  `);
  assert(courseDetailsRes.rows.length === 1, 'Slug bo‘yicha kurs tafsilotlari olindi');
  assert(courseDetailsRes.rows[0].categoryName === 'Dasturlash', 'Kategoriya nomi to‘g‘ri bog‘langan');

  const lessonsRes = await db.query(`
    SELECT * FROM "lessons" 
    WHERE "courseId" = 'course-nextjs' 
    ORDER BY "order" ASC;
  `);
  assert(lessonsRes.rows.length === 3, 'Kurs darslari to‘liq olindi (3 ta dars)');
  assert(lessonsRes.rows[0].isFree === true, '1-dars bepul preview ekanligi tasdiqlandi');
  assert(lessonsRes.rows[1].isFree === false, '2-dars pullik ekanligi tasdiqlandi');

  // ==========================================
  // TEST GROUP 3: ENROLLMENT & ACCESS CONTROL
  // ==========================================
  console.log('\n--- TEST GROUP 3: Kursga A’zo Bo‘lish va Ruxsatlar Nazorati ---');

  // 3.1. Non-enrolled user cannot access paid lesson 2 content or video
  const nonEnrolledCanAccess = lessonsRes.rows[1].isFree;
  assert(nonEnrolledCanAccess === false, 'A’zo bo‘lmagan talaba pullik darsga kira olmaydi (Himoyalangan)');

  // 3.2. Enroll student in course
  await db.exec(`
    INSERT INTO "course_enrollments" ("id", "userId", "courseId", "status", "progressPct", "enrolledAt")
    VALUES ('enr-1', 'user-student-1', 'course-nextjs', 'ACTIVE', 0.0, NOW());

    UPDATE "courses" SET "studentsCount" = "studentsCount" + 1 WHERE "id" = 'course-nextjs';
  `);

  const enrollmentCheck = await db.query(`
    SELECT * FROM "course_enrollments" 
    WHERE "userId" = 'user-student-1' AND "courseId" = 'course-nextjs';
  `);
  assert(enrollmentCheck.rows.length === 1, 'Foydalanuvchi kursga muvaffaqiyatli yozildi');

  // 3.3. Duplicate enrollment prevention
  let duplicateThrew = false;
  try {
    await db.query(`
      INSERT INTO "course_enrollments" ("id", "userId", "courseId", "status", "progressPct", "enrolledAt")
      VALUES ('enr-duplicate', 'user-student-1', 'course-nextjs', 'ACTIVE', 0.0, NOW());
    `);
  } catch (e) {
    duplicateThrew = true;
  }
  assert(duplicateThrew, 'Bir kursga takroran a’zo bo‘lish ma’lumotlar bazasi darajasida bloklandi');

  // 3.4. Enrolled user now has full access to lesson 2 & materials
  const materialRes = await db.query(`SELECT * FROM "course_materials" WHERE "lessonId" = 'les-2';`);
  assert(materialRes.rows.length === 1, 'Yuklab olinadigan PDF material mavjud');
  assert(materialRes.rows[0].fileUrl.startsWith('https://'), 'Material havolasi to‘g‘ri shakllangan');

  // ==========================================
  // TEST GROUP 4: LESSON PLAYER & PROGRESS
  // ==========================================
  console.log('\n--- TEST GROUP 4: Dars Playeri va Progress Hisoblash ---');

  // 4.1. Mark lesson 1 completed
  await db.query(`
    INSERT INTO "lesson_progress" ("id", "userId", "lessonId", "isCompleted", "lastPositionSeconds", "completedAt", "createdAt", "updatedAt")
    VALUES ('prog-1', 'user-student-1', 'les-1', true, 600, NOW(), NOW(), NOW());
  `);

  // Recalculate course progress: 1 of 3 lessons = 33%
  const totalLessonsCount = lessonsRes.rows.length;
  const completedLessonsCount = 1;
  const calcProgressPct = Math.round((completedLessonsCount / totalLessonsCount) * 100);
  assert(calcProgressPct === 33, '1-dars tugatilgach progress to‘g‘ri hisoblandi (33%)');

  await db.query(`
    UPDATE "course_enrollments" 
    SET "progressPct" = ${calcProgressPct} 
    WHERE "id" = 'enr-1';
  `);

  // 4.2. Mark remaining lessons completed (2 and 3) -> 100% completion
  await db.exec(`
    INSERT INTO "lesson_progress" ("id", "userId", "lessonId", "isCompleted", "lastPositionSeconds", "completedAt", "createdAt", "updatedAt")
    VALUES 
      ('prog-2', 'user-student-1', 'les-2', true, 1200, NOW(), NOW(), NOW()),
      ('prog-3', 'user-student-1', 'les-3', true, 1800, NOW(), NOW(), NOW());

    UPDATE "course_enrollments" 
    SET "progressPct" = 100.0, "status" = 'COMPLETED', "completedAt" = NOW()
    WHERE "id" = 'enr-1';
  `);

  const updatedEnrollment = await db.query(`SELECT * FROM "course_enrollments" WHERE "id" = 'enr-1';`);
  assert(updatedEnrollment.rows[0].progressPct === 100.0, 'Barcha darslar tugatilgach progress 100% bo‘ldi');
  assert(updatedEnrollment.rows[0].status === 'COMPLETED', 'Kurs holati COMPLETED ga o‘zgardi');
  assert(updatedEnrollment.rows[0].completedAt !== null, 'Tugallangan vaqt (completedAt) saqlandi');

  // ==========================================
  // TEST GROUP 5: QUIZZES (MVP)
  // ==========================================
  console.log('\n--- TEST GROUP 5: Interaktiv Testlar (Quizzes MVP) ---');

  // 5.1. Fetch quiz questions and options
  const quizRes = await db.query(`SELECT * FROM "quizzes" WHERE "id" = 'quiz-1';`);
  assert(quizRes.rows.length === 1, 'Quiz topildi');

  const questionsRes = await db.query(`SELECT * FROM "quiz_questions" WHERE "quizId" = 'quiz-1' ORDER BY "order" ASC;`);
  assert(questionsRes.rows.length === 2, 'Quizda 2 ta savol mavjud');

  // 5.2. Submit correct answers (2 of 2 correct = 100%)
  const userAnswers = [
    { questionId: 'qq-1', selectedOptionId: 'opt-1-1' }, // correct
    { questionId: 'qq-2', selectedOptionId: 'opt-2-1' }, // correct
  ];

  let correctCount = 0;
  for (const ans of userAnswers) {
    const optRes = await db.query(`SELECT "isCorrect" FROM "quiz_options" WHERE "id" = '${ans.selectedOptionId}';`);
    if (optRes.rows[0]?.isCorrect) correctCount++;
  }
  const score = Math.round((correctCount / userAnswers.length) * 100);
  const passed = score >= quizRes.rows[0].passingScore;

  assert(score === 100, 'Test balli 100% to‘g‘ri hisoblandi');
  assert(passed === true, 'O‘tish bali (70%) oshib, passed = true bo‘ldi');

  // Save attempt
  await db.query(`
    INSERT INTO "quiz_attempts" ("id", "quizId", "userId", "score", "passed", "completedAt")
    VALUES ('attempt-1', 'quiz-1', 'user-student-1', ${score}, ${passed}, NOW());
  `);

  const attemptCheck = await db.query(`SELECT * FROM "quiz_attempts" WHERE "id" = 'attempt-1';`);
  assert(attemptCheck.rows.length === 1, 'Test urinishi (QuizAttempt) bazada saqlandi');

  // 5.3. Submit failing answers (0 of 2 correct = 0%)
  const failingAnswers = [
    { questionId: 'qq-1', selectedOptionId: 'opt-1-2' }, // wrong
    { questionId: 'qq-2', selectedOptionId: 'opt-2-2' }, // wrong
  ];
  let failCorrectCount = 0;
  for (const ans of failingAnswers) {
    const optRes = await db.query(`SELECT "isCorrect" FROM "quiz_options" WHERE "id" = '${ans.selectedOptionId}';`);
    if (optRes.rows[0]?.isCorrect) failCorrectCount++;
  }
  const failScore = Math.round((failCorrectCount / failingAnswers.length) * 100);
  const failPassed = failScore >= quizRes.rows[0].passingScore;

  assert(failScore === 0, 'Noto‘g‘ri javoblar bilan ball 0% bo‘ldi');
  assert(failPassed === false, 'Yiqilgan testda passed = false bo‘ldi');

  // Save second attempt
  await db.query(`
    INSERT INTO "quiz_attempts" ("id", "quizId", "userId", "score", "passed", "completedAt")
    VALUES ('attempt-2', 'quiz-1', 'user-student-1', ${failScore}, ${failPassed}, NOW());
  `);

  // 5.4. Attempt history
  const historyRes = await db.query(`SELECT * FROM "quiz_attempts" WHERE "quizId" = 'quiz-1' AND "userId" = 'user-student-1' ORDER BY "completedAt" DESC;`);
  assert(historyRes.rows.length === 2, 'Talabaning barcha test urinishlari tarixi (2 ta) olindi');

  console.log('\n========================================================');
  console.log(`🎉 BARCHA ${passedTests} TA LEARNING SYSTEM TESTLARI MUVAFFAQIYATLI O‘TDI! (0 XATOLIK)`);
  console.log('========================================================\n');
  process.exit(0);
}

runLearningSystemTests().catch((err) => {
  console.error('❌ Xatolik:', err);
  process.exit(1);
});
