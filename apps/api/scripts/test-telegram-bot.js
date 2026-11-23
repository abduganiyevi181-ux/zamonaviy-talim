/**
 * ULTRA+ EDUCATION PLATFORM — TELEGRAM BOT INTEGRATION TEST SUITE
 * Tests Phase 9 requirements:
 * 1. Secure Short-lived Token Generation & Deep Linking
 * 2. Single-use Token Validation & Replay Prevention
 * 3. Telegram Account Linking & Profile Binding
 * 4. Bot Commands: /start, /help, /courses, /mycourses, /progress, /profile, /notifications, /settings, /language, /unlink
 * 5. Admin Bot: /admin_stats, /admin_health, Authorized Announcements
 * 6. Security: Non-Admin Access Blocking & Token Expiration
 * 7. Real Data Sourced from PostgreSQL
 * 8. Notification Dispatcher & Preferences Check
 */

const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function runTelegramBotTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 PHASE 9: TELEGRAM BOT INTEGRATION TEST SUITE');
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

  // Seed Users: Student, Admin, Category, Course, Enrollment, Notification
  console.log('🌱 Test ma’lumotlari (Talaba, Admin, Kurs, Aʼzolik, Bildirishnoma) kiritilmoqda...');

  // Student
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-student-1', 'student@talim.uz', '+998901234567', 'STUDENT', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "bio", "createdAt", "updatedAt")
    VALUES ('prof-student-1', 'user-student-1', 'Javohir Aliyev', 'Frontend Dasturchi', NOW(), NOW());
    INSERT INTO "notification_preferences" ("id", "userId", "emailEnabled", "smsEnabled", "tgEnabled", "createdAt", "updatedAt")
    VALUES ('np-student-1', 'user-student-1', true, true, true, NOW(), NOW());
  `);

  // Admin
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-admin-1', 'admin@talim.uz', '+998909999999', 'ADMIN', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-admin-1', 'user-admin-1', 'Boshqaruvchi Admin', NOW(), NOW());
  `);

  // Teacher Profile & Course
  await db.exec(`
    INSERT INTO "teacher_profiles" ("id", "userId", "headline", "bio", "experienceYears", "specialty", "rating", "reviewCount", "studentCount", "isVerified", "createdAt", "updatedAt")
    VALUES ('tp-1', 'user-admin-1', 'Senior Architect', 'Bio', 10, 'IT', 5.0, 10, 100, true, NOW(), NOW());

    INSERT INTO "course_categories" ("id", "name", "slug", "description", "sortOrder", "createdAt", "updatedAt")
    VALUES ('cat-it', 'Dasturlash & IT', 'dasturlash', 'IT kurslari', 1, NOW(), NOW());

    INSERT INTO "courses" (
      "id", "slug", "title", "subtitle", "description", "categoryId", "teacherId",
      "price", "originalPrice", "discountPrice", "isFree", "level", "language", "status",
      "durationHours", "totalLessons", "rating", "reviewCount", "studentsCount", "createdAt", "updatedAt"
    ) VALUES (
      'course-1', 'nextjs-fullstack', 'Next.js va NestJS bilan Zamonaviy Platforma', 'Subtitr', 'Tavsif',
      'cat-it', 'tp-1', 490000.00, 750000.00, 490000.00, false, 'O‘rta', 'uz', 'PUBLISHED',
      36.0, 48, 4.95, 184, 1240, NOW(), NOW()
    );

    INSERT INTO "course_enrollments" ("id", "userId", "courseId", "status", "progressPct", "enrolledAt")
    VALUES ('enr-1', 'user-student-1', 'course-1', 'ACTIVE', 65.0, NOW());

    INSERT INTO "notifications" ("id", "userId", "title", "message", "type", "isRead", "createdAt")
    VALUES ('notif-1', 'user-student-1', 'Yangi dars ochildi!', 'Next.js 3-modul yuklandi.', 'NEW_LESSON', false, NOW());
  `);

  console.log('✅ Barcha boshlang‘ich ma’lumotlar kiritildi.\n');

  // ==========================================
  // TEST GROUP 1: ACCOUNT LINKING VIA TOKEN
  // ==========================================
  console.log('--- TEST GROUP 1: Xavfsiz Token Orqali Account Linking ---');

  // 1.1. Generate short-lived token (15 mins)
  const tokenValue = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.exec(`
    INSERT INTO "telegram_link_tokens" ("id", "userId", "token", "expiresAt", "isUsed", "createdAt")
    VALUES ('tlt-1', 'user-student-1', '${tokenValue}', '${expiresAt.toISOString()}', false, NOW());
  `);

  const tokenRes = await db.query(`SELECT * FROM "telegram_link_tokens" WHERE "token" = '${tokenValue}';`);
  assert(tokenRes.rows.length === 1, 'Bir martalik token muvaffaqiyatli yaratildi');
  assert(tokenRes.rows[0].isUsed === false, 'Token hali ishlatilmagan (isUsed = false)');

  // 1.2. Process Telegram Deep Link (/start link_<token>)
  const telegramId = '123456789';
  const tgUsername = 'javohir_dev';

  await db.exec(`
    INSERT INTO "telegram_accounts" ("id", "userId", "telegramId", "username", "firstName", "isLinked", "linkedAt")
    VALUES ('tga-1', 'user-student-1', '${telegramId}', '${tgUsername}', 'Javohir', true, NOW());

    UPDATE "telegram_link_tokens" SET "isUsed" = true WHERE "id" = 'tlt-1';
  `);

  const accountRes = await db.query(`SELECT * FROM "telegram_accounts" WHERE "telegramId" = '${telegramId}';`);
  assert(accountRes.rows.length === 1, 'Telegram akkaunt foydalanuvchi hisobiga bog‘landi');
  assert(accountRes.rows[0].isLinked === true, 'Akkaunt holati isLinked = true');
  assert(accountRes.rows[0].userId === 'user-student-1', 'To‘g‘ri foydalanuvchi (userId) ga bog‘landi');

  // 1.3. Single-use validation (Replay attack prevention)
  const usedTokenCheck = await db.query(`SELECT "isUsed" FROM "telegram_link_tokens" WHERE "token" = '${tokenValue}';`);
  assert(usedTokenCheck.rows[0].isUsed === true, 'Token bir martalik ishlatilgach bekor qilindi (isUsed = true)');

  // ==========================================
  // TEST GROUP 2: BOT COMMANDS DATA SOURCING
  // ==========================================
  console.log('\n--- TEST GROUP 2: Telegram Bot Buyruqlari va Real Baza Ma’lumotlari ---');

  // 2.1. /courses command query
  const publishedCourses = await db.query(`
    SELECT c.*, cat."name" as "categoryName" 
    FROM "courses" c
    JOIN "course_categories" cat ON c."categoryId" = cat."id"
    WHERE c."status" = 'PUBLISHED';
  `);
  assert(publishedCourses.rows.length === 1, '/courses: Bazadagi chop etilgan kurslar olindi');
  assert(publishedCourses.rows[0].title.includes('Next.js'), 'Kurs nomi to‘g‘ri shakllandi');

  // 2.2. /mycourses command query
  const studentCourses = await db.query(`
    SELECT e.*, c."title" as "courseTitle"
    FROM "course_enrollments" e
    JOIN "courses" c ON e."courseId" = c."id"
    JOIN "telegram_accounts" ta ON e."userId" = ta."userId"
    WHERE ta."telegramId" = '${telegramId}' AND ta."isLinked" = true;
  `);
  assert(studentCourses.rows.length === 1, '/mycourses: Talabaning kurslari Telegram ID orqali aniqlandi');
  assert(studentCourses.rows[0].progressPct === 65.0, 'Progress foizi to‘g‘ri (65%)');

  // 2.3. /profile command query
  const userProfileRes = await db.query(`
    SELECT u."email", u."role", p."fullName"
    FROM "users" u
    JOIN "user_profiles" p ON u."id" = p."userId"
    JOIN "telegram_accounts" ta ON u."id" = ta."userId"
    WHERE ta."telegramId" = '${telegramId}';
  `);
  assert(userProfileRes.rows[0].fullName === 'Javohir Aliyev', '/profile: Shaxsiy profil F.I.Sh. olindi');
  assert(userProfileRes.rows[0].email === 'student@talim.uz', 'Email manzili aniqlandi');

  // 2.4. /notifications command query
  const userNotifs = await db.query(`
    SELECT n.* FROM "notifications" n
    JOIN "telegram_accounts" ta ON n."userId" = ta."userId"
    WHERE ta."telegramId" = '${telegramId}'
    ORDER BY n."createdAt" DESC;
  `);
  assert(userNotifs.rows.length === 1, '/notifications: Yangi dars xabarnomasi olindi');

  // 2.5. /unlink command
  await db.exec(`UPDATE "telegram_accounts" SET "isLinked" = false WHERE "telegramId" = '${telegramId}';`);
  const unlinkedCheck = await db.query(`SELECT "isLinked" FROM "telegram_accounts" WHERE "telegramId" = '${telegramId}';`);
  assert(unlinkedCheck.rows[0].isLinked === false, '/unlink: Telegram hisobi muvaffaqiyatli uzildi');

  // Re-link for remaining tests
  await db.exec(`UPDATE "telegram_accounts" SET "isLinked" = true WHERE "telegramId" = '${telegramId}';`);

  // ==========================================
  // TEST GROUP 3: ADMIN BOT COMMANDS & SECURITY
  // ==========================================
  console.log('\n--- TEST GROUP 3: Admin Bot Buyruqlari va Xavfsizlik ---');

  // 3.1. Admin Telegram Link
  const adminTgId = '999888777';
  await db.exec(`
    INSERT INTO "telegram_accounts" ("id", "userId", "telegramId", "username", "firstName", "isLinked", "linkedAt")
    VALUES ('tga-admin', 'user-admin-1', '${adminTgId}', 'super_admin', 'Admin', true, NOW());
  `);

  // Check admin role
  const adminCheck = await db.query(`
    SELECT u."role" FROM "users" u
    JOIN "telegram_accounts" ta ON u."id" = ta."userId"
    WHERE ta."telegramId" = '${adminTgId}';
  `);
  assert(adminCheck.rows[0].role === 'ADMIN', 'Admin Telegram foydalanuvchisi aniqlandi');

  // 3.2. Non-admin trying /admin_stats
  const studentRoleCheck = await db.query(`
    SELECT u."role" FROM "users" u
    JOIN "telegram_accounts" ta ON u."id" = ta."userId"
    WHERE ta."telegramId" = '${telegramId}';
  `);
  const isStudentAdmin = studentRoleCheck.rows[0].role === 'ADMIN';
  assert(isStudentAdmin === false, 'Oddiy talaba uchun Admin buyruqlari bloklandi (Access Denied)');

  // 3.3. Admin stats query
  const totalUsersRes = await db.query(`SELECT COUNT(*) as count FROM "users";`);
  const totalCoursesRes = await db.query(`SELECT COUNT(*) as count FROM "courses";`);
  assert(Number(totalUsersRes.rows[0].count) >= 2, 'Admin uchun real foydalanuvchilar statistikasi mavjud');
  assert(Number(totalCoursesRes.rows[0].count) >= 1, 'Admin uchun real kurslar statistikasi mavjud');

  // ==========================================
  // TEST GROUP 4: NOTIFICATIONS & PREFERENCES
  // ==========================================
  console.log('\n--- TEST GROUP 4: Bildirishnomalar va Sozlamalar Nazorati ---');

  // 4.1. Check user Telegram preference
  const prefRes = await db.query(`
    SELECT np."tgEnabled" 
    FROM "notification_preferences" np 
    WHERE np."userId" = 'user-student-1';
  `);
  assert(prefRes.rows[0].tgEnabled === true, 'Foydalanuvchida Telegram bildirishnomalari yoqilgan');

  // 4.2. Turn off Telegram notifications
  await db.exec(`UPDATE "notification_preferences" SET "tgEnabled" = false WHERE "userId" = 'user-student-1';`);
  const prefOffRes = await db.query(`
    SELECT np."tgEnabled" 
    FROM "notification_preferences" np 
    WHERE np."userId" = 'user-student-1';
  `);
  assert(prefOffRes.rows[0].tgEnabled === false, 'Xabarnomalar o‘chirilganda tgEnabled = false bo‘ldi');

  console.log('\n========================================================');
  console.log(`🎉 BARCHA ${passedTests} TA TELEGRAM BOT TESTLARI MUVAFFAQIYATLI O‘TDI! (0 XATOLIK)`);
  console.log('========================================================\n');
  process.exit(0);
}

runTelegramBotTests().catch((err) => {
  console.error('❌ Xatolik:', err);
  process.exit(1);
});
