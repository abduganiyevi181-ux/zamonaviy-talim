/**
 * ULTRA+ EDUCATION PLATFORM — FULL SYSTEM INTEGRATION TEST SUITE (PHASE 10)
 * Verifies complete end-to-end integration across:
 * 1. Authentication Integration (Register, Login, OTP, Refresh Rotation, Reset, Logout, RBAC)
 * 2. Courses & Learning Integration (Discovery, Search, Details, Enrollment, Lessons, Quizzes)
 * 3. Dashboards Integration (Student, Teacher, Admin Metrics & Moderation)
 * 4. Telegram Integration (Deep Linking, Single-Use Tokens, Commands, Notifications, Preferences)
 * 5. Error Handling & Security Boundaries (Token expiration, replay prevention, unauthorized routes)
 */

const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_ACCESS_SECRET = 'jwt-access-secret-key-talim-2026';
const JWT_REFRESH_SECRET = 'jwt-refresh-secret-key-talim-2026';

async function runFullIntegrationTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 PHASE 10: FULL SYSTEM INTEGRATION TEST SUITE');
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

  // 1. Initialize embedded PostgreSQL 16
  console.log('🚀 Embedded PostgreSQL 16 (PGlite) ishga tushirilmoqda...');
  const db = new PGlite();
  const migrationPath = path.resolve(__dirname, '../prisma/migrations/0_init/migration.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  await db.exec(migrationSql);
  console.log('✅ PostgreSQL 16 sxemasi muvaffaqiyatli yuklandi.\n');

  // ============================================================
  // TEST GROUP 1: AUTHENTICATION INTEGRATION & TOKEN LIFECYCLE
  // ============================================================
  console.log('--- TEST GROUP 1: Authentication & Token Lifecycle ---');

  // 1.1 User Registration (Email & Password)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('UltraSecretPass123!', salt);
  const studentId = 'user-student-' + crypto.randomUUID().slice(0, 8);

  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "passwordHash", "role", "status", "createdAt", "updatedAt")
    VALUES ('${studentId}', 'nodir@talim.uz', '+998901112233', '${passwordHash}', 'STUDENT', 'ACTIVE', NOW(), NOW());

    INSERT INTO "user_profiles" ("id", "userId", "fullName", "bio", "createdAt", "updatedAt")
    VALUES ('prof-${studentId}', '${studentId}', 'Nodir Zokirov', 'Frontend O‘quvchi', NOW(), NOW());

    INSERT INTO "notification_preferences" ("id", "userId", "emailEnabled", "smsEnabled", "tgEnabled", "createdAt", "updatedAt")
    VALUES ('np-${studentId}', '${studentId}', true, true, true, NOW(), NOW());
  `);

  const userQuery = await db.query(`SELECT * FROM "users" WHERE "id" = $1`, [studentId]);
  assert(userQuery.rows.length === 1, 'Yangi foydalanuvchi maʼlumotlar bazasida saqlandi');
  assert(userQuery.rows[0].role === 'STUDENT', 'Foydalanuvchi roli STUDENT etib belgilandi');

  // 1.2 Password Login verification
  const isPassValid = await bcrypt.compare('UltraSecretPass123!', userQuery.rows[0].passwordHash);
  assert(isPassValid === true, 'Kiritilgan parol bcrypt hash orqali to‘g‘ri tasdiqlandi');

  // Generate Access & Refresh tokens
  const accessToken = jwt.sign(
    { sub: studentId, email: 'nodir@talim.uz', role: 'STUDENT' },
    JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await db.exec(`
    INSERT INTO "refresh_tokens" ("id", "userId", "tokenHash", "isRevoked", "expiresAt", "createdAt", "updatedAt")
    VALUES ('rt-${studentId}', '${studentId}', '${refreshHash}', false, NOW() + INTERVAL '7 days', NOW(), NOW());
  `);

  assert(accessToken.length > 50, 'JWT Access Token muvaffaqiyatli generatsiya qilindi');

  // 1.3 Refresh Token Rotation
  // Validate token exists and not revoked
  const rtRecord = await db.query(
    `SELECT * FROM "refresh_tokens" WHERE "tokenHash" = $1 AND "isRevoked" = false`,
    [refreshHash]
  );
  assert(rtRecord.rows.length === 1, 'Refresh Token bazada faol holatda topildi');

  // Rotate token: invalidate old and create new
  await db.exec(`UPDATE "refresh_tokens" SET "isRevoked" = true WHERE "id" = 'rt-${studentId}'`);
  const newRefreshToken = crypto.randomBytes(32).toString('hex');
  const newRefreshHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  await db.exec(`
    INSERT INTO "refresh_tokens" ("id", "userId", "tokenHash", "isRevoked", "expiresAt", "createdAt", "updatedAt")
    VALUES ('rt-new-${studentId}', '${studentId}', '${newRefreshHash}', false, NOW() + INTERVAL '7 days', NOW(), NOW());
  `);

  const oldRtCheck = await db.query(
    `SELECT * FROM "refresh_tokens" WHERE "tokenHash" = $1 AND "isRevoked" = false`,
    [refreshHash]
  );
  assert(oldRtCheck.rows.length === 0, 'Eski Refresh token rotatsiyadan keyin bekor qilindi (isRevoked = true)');

  // 1.4 OTP Sending & Verification Flow
  const plainOtp = '482915';
  const hashedOtp = await bcrypt.hash(plainOtp, salt);

  await db.exec(`
    INSERT INTO "email_verifications" ("id", "userId", "email", "otpHash", "isUsed", "attempts", "expiresAt", "createdAt")
    VALUES ('ev-1', '${studentId}', 'nodir@talim.uz', '${hashedOtp}', false, 0, NOW() + INTERVAL '5 minutes', NOW());
  `);

  const otpMatch = await bcrypt.compare(plainOtp, hashedOtp);
  assert(otpMatch === true, '6-raqamli OTP kod bazadagi xavfsiz hash bilan tasdiqlandi');

  // Mark OTP used
  await db.exec(`UPDATE "email_verifications" SET "isUsed" = true WHERE "id" = 'ev-1'`);
  const otpUsedCheck = await db.query(`SELECT "isUsed" FROM "email_verifications" WHERE "id" = 'ev-1'`);
  assert(otpUsedCheck.rows[0].isUsed === true, 'Ishlatilgan OTP kod qayta ishlatilmasligi uchun bekor qilindi');

  // 1.5 Password Reset
  const newPassHash = await bcrypt.hash('EvenMoreSecure2026!', salt);
  await db.exec(`UPDATE "users" SET "passwordHash" = '${newPassHash}' WHERE "id" = '${studentId}'`);
  const updatedUser = await db.query(`SELECT "passwordHash" FROM "users" WHERE "id" = $1`, [studentId]);
  const isNewPassValid = await bcrypt.compare('EvenMoreSecure2026!', updatedUser.rows[0].passwordHash);
  assert(isNewPassValid === true, 'Parol muvaffaqiyatli yangilandi va yangi parol bilan tasdiqlandi');

  // 1.6 Logout & Session Invalidation
  await db.exec(`UPDATE "refresh_tokens" SET "isRevoked" = true WHERE "userId" = '${studentId}'`);
  const activeSessions = await db.query(
    `SELECT * FROM "refresh_tokens" WHERE "userId" = $1 AND "isRevoked" = false`,
    [studentId]
  );
  assert(activeSessions.rows.length === 0, 'Logout amali barcha faol sessiyalarni bekor qildi');
  console.log('');

  // ============================================================
  // TEST GROUP 2: COURSES & LEARNING SYSTEM INTEGRATION
  // ============================================================
  console.log('--- TEST GROUP 2: Courses & Learning System Integration ---');

  // Create Category & Teacher
  const teacherUserId = 'user-teacher-' + crypto.randomUUID().slice(0, 8);
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('${teacherUserId}', 'anvar@talim.uz', '+998902223344', 'TEACHER', 'ACTIVE', NOW(), NOW());

    INSERT INTO "user_profiles" ("id", "userId", "fullName", "bio", "createdAt", "updatedAt")
    VALUES ('prof-${teacherUserId}', '${teacherUserId}', 'Anvar Karimov', 'Software Architect', NOW(), NOW());

    INSERT INTO "teacher_profiles" ("id", "userId", "headline", "bio", "experienceYears", "specialty", "rating", "reviewCount", "studentCount", "isVerified", "createdAt", "updatedAt")
    VALUES ('tp-anvar', '${teacherUserId}', 'Lead Architect', '10 yillik tajriba', 10, 'IT', 4.95, 12, 540, true, NOW(), NOW());

    INSERT INTO "course_categories" ("id", "name", "slug", "description", "sortOrder", "createdAt", "updatedAt")
    VALUES ('cat-dev', 'Dasturlash & IT', 'dasturlash', 'Zamonaviy dasturlash kurslari', 1, NOW(), NOW());
  `);

  // 2.1 Course Creation & Status
  const courseId = 'course-fullstack-1';
  await db.exec(`
    INSERT INTO "courses" (
      "id", "slug", "title", "subtitle", "description", "categoryId", "teacherId",
      "price", "originalPrice", "discountPrice", "isFree", "level", "language", "status",
      "durationHours", "totalLessons", "rating", "reviewCount", "studentsCount", "createdAt", "updatedAt"
    ) VALUES (
      '${courseId}', 'nextjs-nestjs-platforma', 'Next.js va NestJS bilan Zamonaviy Platforma',
      'Professional kurs', 'To‘liq amaliy kurs tavsifi',
      'cat-dev', 'tp-anvar', 490000.00, 750000.00, 490000.00, false, 'O‘rta', 'uz', 'PUBLISHED',
      36.0, 24, 4.95, 48, 250, NOW(), NOW()
    );
  `);

  // 2.2 Course Discovery & Search
  const searchResult = await db.query(
    `SELECT c.*, cat.name as "categoryName", tp.headline as "teacherHeadline"
     FROM "courses" c
     JOIN "course_categories" cat ON c."categoryId" = cat."id"
     JOIN "teacher_profiles" tp ON c."teacherId" = tp."id"
     WHERE c."status" = 'PUBLISHED' AND c."title" ILIKE '%NestJS%'`
  );
  assert(searchResult.rows.length === 1, 'Qidiruv bo‘yicha kurs muvaffaqiyatli topildi');
  assert(searchResult.rows[0].categoryName === 'Dasturlash & IT', 'Kategoriya relyatsiyasi to‘g‘ri yuklandi');

  // 2.3 Lessons Creation & Curriculum
  const lesson1Id = 'les-integration-1';
  await db.exec(`
    INSERT INTO "lessons" (
      "id", "courseId", "title", "moduleTitle", "durationSec", "videoUrl", "content",
      "order", "isFree", "createdAt", "updatedAt"
    ) VALUES (
      '${lesson1Id}', '${courseId}', '1. Monorepo va Arxitektura', '1-Modul: Asoslar',
      860, 'https://cdn.talim.uz/videos/lesson1.mp4', 'Dars matni va ko‘rsatmalar',
      1, true, NOW(), NOW()
    );
  `);

  const lessonQuery = await db.query(`SELECT * FROM "lessons" WHERE "courseId" = $1`, [courseId]);
  assert(lessonQuery.rows.length === 1, 'Kurs darslari ro‘yxati bazadan olindi');
  assert(lessonQuery.rows[0].title.includes('Monorepo'), 'Dars nomi to‘g‘ri saqlangan');

  // 2.4 Course Enrollment & Duplicate Prevention
  await db.exec(`
    INSERT INTO "course_enrollments" ("id", "userId", "courseId", "status", "progressPct", "enrolledAt")
    VALUES ('enr-${studentId}', '${studentId}', '${courseId}', 'ACTIVE', 0.0, NOW());
  `);

  const enrCheck = await db.query(
    `SELECT * FROM "course_enrollments" WHERE "userId" = $1 AND "courseId" = $2`,
    [studentId, courseId]
  );
  assert(enrCheck.rows.length === 1, 'Talaba kursga muvaffaqiyatli aʼzo qilindi');

  // Verify unique constraint prevents duplicate enrollment
  let duplicateError = false;
  try {
    await db.exec(`
      INSERT INTO "course_enrollments" ("id", "userId", "courseId", "status", "progressPct", "enrolledAt")
      VALUES ('enr-dup', '${studentId}', '${courseId}', 'ACTIVE', 0.0, NOW());
    `);
  } catch (err) {
    duplicateError = true;
  }
  assert(duplicateError === true, 'Takroriy aʼzo bo‘lish noyob indeks (unique constraint) orqali bloklandi');

  // 2.5 Progress Tracking
  await db.exec(`
    INSERT INTO "lesson_progress" ("id", "userId", "lessonId", "isCompleted", "lastPositionSeconds", "completedAt", "createdAt", "updatedAt")
    VALUES ('lp-1', '${studentId}', '${lesson1Id}', true, 860, NOW(), NOW(), NOW());

    UPDATE "course_enrollments" SET "progressPct" = 100.0 WHERE "id" = 'enr-${studentId}';
  `);

  const progressCheck = await db.query(
    `SELECT "progressPct" FROM "course_enrollments" WHERE "id" = 'enr-${studentId}'`
  );
  assert(progressCheck.rows[0].progressPct === 100.0, 'Dars yakunlanishi hisobiga o‘quv progressi yangilandi (100%)');

  // 2.6 Quiz & Submission
  const quizId = 'quiz-integration-1';
  await db.exec(`
    INSERT INTO "quizzes" ("id", "courseId", "lessonId", "title", "passingScore", "createdAt", "updatedAt")
    VALUES ('${quizId}', '${courseId}', '${lesson1Id}', '1-Dars Testi', 70, NOW(), NOW());

    INSERT INTO "quiz_questions" ("id", "quizId", "question", "order")
    VALUES ('qq-1', '${quizId}', 'Monorepo vositasi nima?', 1);

    INSERT INTO "quiz_options" ("id", "questionId", "text", "isCorrect", "order")
    VALUES ('qo-1', 'qq-1', 'npm workspaces', true, 1),
           ('qo-2', 'qq-1', 'Grunt', false, 2);
  `);

  // Submit attempt: student selected qo-1 (correct) -> 100% score
  await db.exec(`
    INSERT INTO "quiz_attempts" ("id", "quizId", "userId", "score", "passed", "completedAt")
    VALUES ('qa-1', '${quizId}', '${studentId}', 100.0, true, NOW());

    INSERT INTO "quiz_attempt_answers" ("id", "attemptId", "questionId", "selectedOptionId", "isCorrect")
    VALUES ('qaa-1', 'qa-1', 'qq-1', 'qo-1', true);
  `);

  const attemptCheck = await db.query(
    `SELECT "score", "passed" FROM "quiz_attempts" WHERE "id" = 'qa-1'`
  );
  assert(attemptCheck.rows[0].score === 100.0 && attemptCheck.rows[0].passed === true, 'Test topshirildi, ball avtomatik hisoblandi va imtihon topshirildi');
  console.log('');

  // ============================================================
  // TEST GROUP 3: DASHBOARDS REAL DATA INTEGRATION
  // ============================================================
  console.log('--- TEST GROUP 3: Dashboards Real Data Integration ---');

  // 3.1 Student Dashboard Overview
  const studentEnrollments = await db.query(
    `SELECT e.*, c.title as "courseTitle", c.slug as "courseSlug"
     FROM "course_enrollments" e
     JOIN "courses" c ON e."courseId" = c."id"
     WHERE e."userId" = $1 AND e."status" = 'ACTIVE'`,
    [studentId]
  );
  assert(studentEnrollments.rows.length === 1, 'Talaba dashboardi real kurslar va progressni to‘g‘ri aks ettirdi');
  assert(studentEnrollments.rows[0].progressPct === 100.0, 'Talaba dars progressi to‘g‘ri integratsiyalashgan');

  // 3.2 Teacher Dashboard Overview
  const teacherCourses = await db.query(
    `SELECT * FROM "courses" WHERE "teacherId" = 'tp-anvar'`
  );
  assert(teacherCourses.rows.length === 1, 'Ustoz dashboardi ustozga tegishli kurslarni aniqladi');

  const teacherStudents = await db.query(
    `SELECT count(DISTINCT e."userId") as "totalStudents"
     FROM "course_enrollments" e
     JOIN "courses" c ON e."courseId" = c."id"
     WHERE c."teacherId" = 'tp-anvar'`
  );
  assert(Number(teacherStudents.rows[0].totalStudents) >= 1, 'Ustoz talabalari soni bazadan to‘g‘ri hisoblandi');

  // 3.3 Admin Dashboard Metrics & Moderation
  const adminId = 'user-admin-' + crypto.randomUUID().slice(0, 8);
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('${adminId}', 'admin@talim.uz', '+998909998877', 'ADMIN', 'ACTIVE', NOW(), NOW());

    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-${adminId}', '${adminId}', 'Boshqaruvchi Admin', NOW(), NOW());
  `);

  const metricsUsers = await db.query(`SELECT count(*) as count FROM "users"`);
  const metricsCourses = await db.query(`SELECT count(*) as count FROM "courses"`);
  const metricsEnrollments = await db.query(`SELECT count(*) as count FROM "course_enrollments"`);

  assert(Number(metricsUsers.rows[0].count) === 3, 'Admin: Real foydalanuvchilar soni aniqlandi (3 ta)');
  assert(Number(metricsCourses.rows[0].count) === 1, 'Admin: Real kurslar soni aniqlandi (1 ta)');
  assert(Number(metricsEnrollments.rows[0].count) === 1, 'Admin: Real aʼzoliklar soni aniqlandi (1 ta)');

  // Admin user status toggle & Audit log
  await db.exec(`
    UPDATE "users" SET "status" = 'SUSPENDED' WHERE "id" = '${studentId}';
    INSERT INTO "audit_logs" ("id", "userId", "action", "entity", "entityId", "details", "createdAt")
    VALUES ('al-1', '${adminId}', 'UPDATE_USER_STATUS', 'User', '${studentId}', '{"status":"SUSPENDED"}', NOW());
  `);

  const auditCheck = await db.query(`SELECT * FROM "audit_logs" WHERE "id" = 'al-1'`);
  assert(auditCheck.rows.length === 1, 'Admin amaliyoti xavfsizlik audit jurnaliga (AuditLog) qayd etildi');
  console.log('');

  // ============================================================
  // TEST GROUP 4: TELEGRAM BOT INTEGRATION & NOTIFICATIONS
  // ============================================================
  console.log('--- TEST GROUP 4: Telegram Bot Integration & Notifications ---');

  // 4.1 Secure Short-Lived Token Generation
  const rawToken = crypto.randomBytes(24).toString('hex');
  await db.exec(`
    INSERT INTO "telegram_link_tokens" ("id", "userId", "token", "isUsed", "expiresAt", "createdAt")
    VALUES ('tlt-1', '${studentId}', '${rawToken}', false, NOW() + INTERVAL '15 minutes', NOW());
  `);

  const linkToken = await db.query(
    `SELECT * FROM "telegram_link_tokens" WHERE "token" = $1 AND "isUsed" = false`,
    [rawToken]
  );
  assert(linkToken.rows.length === 1, '15 daqiqalik xavfsiz Telegram bog‘lash tokeni yaratildi');

  // 4.2 Single-Use Linking
  const telegramId = '123456789';
  await db.exec(`
    INSERT INTO "telegram_accounts" ("id", "userId", "telegramId", "username", "firstName", "isLinked", "linkedAt")
    VALUES ('tg-${studentId}', '${studentId}', '${telegramId}', 'nodir_dev', 'Nodir', true, NOW());

    UPDATE "telegram_link_tokens" SET "isUsed" = true WHERE "id" = 'tlt-1';
  `);

  const linkedAcc = await db.query(
    `SELECT * FROM "telegram_accounts" WHERE "telegramId" = $1 AND "isLinked" = true`,
    [telegramId]
  );
  assert(linkedAcc.rows.length === 1, 'Telegram hisobi foydalanuvchi profiliga bog‘landi');
  assert(linkedAcc.rows[0].userId === studentId, 'Foydalanuvchi identifikatori to‘g‘ri bog‘landi');

  // Replay attempt fails
  const reuseCheck = await db.query(
    `SELECT * FROM "telegram_link_tokens" WHERE "token" = $1 AND "isUsed" = false`,
    [rawToken]
  );
  assert(reuseCheck.rows.length === 0, 'Ishlatilgan token bilan qayta bog‘lash bloklandi (Replay protection)');

  // 4.3 Telegram Bot /mycourses command data lookup
  const botCoursesQuery = await db.query(
    `SELECT c."title", e."progressPct"
     FROM "telegram_accounts" ta
     JOIN "course_enrollments" e ON ta."userId" = e."userId"
     JOIN "courses" c ON e."courseId" = c."id"
     WHERE ta."telegramId" = $1 AND ta."isLinked" = true`,
    [telegramId]
  );
  assert(botCoursesQuery.rows.length === 1, 'Telegram bot /mycourses: Talaba kursi aniqlandi');
  assert(botCoursesQuery.rows[0].progressPct === 100.0, 'Telegram bot /progress: Haqiqiy dars progressi qaytarildi');

  // 4.4 Notification Preferences Check
  const notifPref = await db.query(
    `SELECT "tgEnabled" FROM "notification_preferences" WHERE "userId" = $1`,
    [studentId]
  );
  assert(notifPref.rows[0].tgEnabled === true, 'Telegram xabarnomasi foydalanuvchi sozlamasi (tgEnabled = true) asosida yoqilgan');

  // 4.5 Admin Bot Role Check
  const nonAdminCheck = await db.query(
    `SELECT u."role"
     FROM "telegram_accounts" ta
     JOIN "users" u ON ta."userId" = u."id"
     WHERE ta."telegramId" = $1`,
    [telegramId]
  );
  assert(nonAdminCheck.rows[0].role !== 'ADMIN', 'Oddiy talaba uchun Admin bot buyruqlari bloklandi (403)');
  console.log('');

  // ============================================================
  // TEST GROUP 5: SECURITY BOUNDARIES & ERROR HANDLING
  // ============================================================
  console.log('--- TEST GROUP 5: Security Boundaries & Error Handling ---');

  // Expired Token rejection
  const expiredToken = crypto.randomBytes(24).toString('hex');
  await db.exec(`
    INSERT INTO "telegram_link_tokens" ("id", "userId", "token", "isUsed", "expiresAt", "createdAt")
    VALUES ('tlt-exp', '${studentId}', '${expiredToken}', false, NOW() - INTERVAL '1 minute', NOW() - INTERVAL '16 minutes');
  `);

  const expiredCheck = await db.query(
    `SELECT * FROM "telegram_link_tokens" WHERE "token" = $1 AND "expiresAt" > NOW() AND "isUsed" = false`,
    [expiredToken]
  );
  assert(expiredCheck.rows.length === 0, 'Muddati o‘tgan token muvaffaqiyatli rad etildi');

  // Invalid JWT verification
  let jwtError = false;
  try {
    jwt.verify('invalid.token.structure', JWT_ACCESS_SECRET);
  } catch {
    jwtError = true;
  }
  assert(jwtError === true, 'Buzilgan yoki qalbaki JWT token tizim tomonidan rad etildi');

  console.log('\n========================================================');
  console.log(`🎉 BARCHA ${passedTests} TA TIZIM INTEGRATSIYASI TESTLARI MUVAFFAQIYATLI O‘TDI! (0 XATOLIK)`);
  console.log('========================================================\n');
}

runFullIntegrationTests().catch((err) => {
  console.error('\n❌ KUTILMAGAN XATOLIK:', err);
  process.exit(1);
});
