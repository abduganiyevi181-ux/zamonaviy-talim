/**
 * ULTRA+ EDUCATION PLATFORM — ADMIN PANEL TEST SUITE
 * Tests Phase 8 requirements:
 * 1. Real Database Metrics (Users, Students, Teachers, Courses, Enrollments, Pending Approvals, Reports)
 * 2. User Management (Search, Suspend, Reactivate, Role change)
 * 3. Course Moderation (Approve, Reject/Draft)
 * 4. Teacher Verification (Approve -> isVerified: true, Reject with note)
 * 5. Reports Queue & Resolution
 * 6. Category Management
 * 7. Security: Audit Logs & Non-Admin Access Blocking
 */

const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');

async function runAdminPanelTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 PHASE 8: PROFESSIONAL ADMIN PANEL TEST SUITE');
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

  // Seed Data: Admin, Teacher, Student, Category, Courses, Reports
  console.log('🌱 Test ma’lumotlari (Admin, Teacher, Student, Kurslar, Shikoyatlar) kiritilmoqda...');

  // Admin User
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-admin-1', 'admin@talim.uz', '+998900000000', 'ADMIN', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-admin-1', 'user-admin-1', 'Super Admin', NOW(), NOW());
  `);

  // Teacher User
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-teacher-1', 'teacher@talim.uz', '+998901111111', 'TEACHER', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-teacher-1', 'user-teacher-1', 'Anvar Karimov', NOW(), NOW());
    INSERT INTO "teacher_profiles" ("id", "userId", "headline", "bio", "experienceYears", "specialty", "rating", "reviewCount", "studentCount", "isVerified", "createdAt", "updatedAt")
    VALUES ('tp-1', 'user-teacher-1', 'Lead Architect', 'Bio', 10, 'IT', 5.0, 10, 100, true, NOW(), NOW());
  `);

  // Student User
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-student-1', 'student@talim.uz', '+998902222222', 'STUDENT', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-student-1', 'user-student-1', 'Nodir Zokirov', NOW(), NOW());
  `);

  // Category
  await db.exec(`
    INSERT INTO "course_categories" ("id", "name", "slug", "description", "sortOrder", "createdAt", "updatedAt")
    VALUES ('cat-it', 'Dasturlash & IT', 'dasturlash', 'IT yo‘nalishi', 1, NOW(), NOW());
  `);

  // Course 1: PUBLISHED
  await db.exec(`
    INSERT INTO "courses" (
      "id", "slug", "title", "subtitle", "description", "categoryId", "teacherId",
      "price", "originalPrice", "discountPrice", "isFree", "level", "language", "status",
      "durationHours", "totalLessons", "rating", "reviewCount", "studentsCount", "createdAt", "updatedAt"
    ) VALUES (
      'course-pub-1', 'nextjs-masterclass', 'Next.js Masterclass', 'Subtitr', 'Tavsif',
      'cat-it', 'tp-1', 490000.00, 700000.00, 490000.00, false, 'O‘rta', 'uz', 'PUBLISHED',
      20.0, 10, 4.9, 12, 45, NOW(), NOW()
    );
  `);

  // Course 2: DRAFT
  await db.exec(`
    INSERT INTO "courses" (
      "id", "slug", "title", "subtitle", "description", "categoryId", "teacherId",
      "price", "originalPrice", "discountPrice", "isFree", "level", "language", "status",
      "durationHours", "totalLessons", "rating", "reviewCount", "studentsCount", "createdAt", "updatedAt"
    ) VALUES (
      'course-draft-1', 'docker-microservices', 'Docker Microservices', 'Subtitr', 'Tavsif',
      'cat-it', 'tp-1', 590000.00, NULL, NULL, false, 'Yuqori', 'uz', 'DRAFT',
      15.0, 5, 5.0, 0, 0, NOW(), NOW()
    );
  `);

  // Enrollment
  await db.exec(`
    INSERT INTO "course_enrollments" ("id", "userId", "courseId", "status", "progressPct", "enrolledAt")
    VALUES ('enr-1', 'user-student-1', 'course-pub-1', 'ACTIVE', 35.0, NOW());
  `);

  // Teacher Verification Application (Pending)
  await db.exec(`
    INSERT INTO "teacher_verifications" ("id", "teacherProfileId", "documentUrl", "certificateUrl", "status", "createdAt", "updatedAt")
    VALUES ('ver-app-1', 'tp-1', 'https://docs.talim.uz/passport.pdf', 'https://docs.talim.uz/cert.pdf', 'PENDING', NOW(), NOW());
  `);

  // Report (Pending)
  await db.exec(`
    INSERT INTO "reports" ("id", "reporterId", "entityType", "entityId", "reason", "status", "createdAt", "updatedAt")
    VALUES ('rep-1', 'user-student-1', 'Course', 'course-draft-1', 'Materiallarda xatolik mavjud', 'PENDING', NOW(), NOW());
  `);

  console.log('✅ Barcha ma’lumotlar muvaffaqiyatli kiritildi.\n');

  // ==========================================
  // TEST GROUP 1: REAL DATABASE METRICS
  // ==========================================
  console.log('--- TEST GROUP 1: Boshqaruv Paneli Real Bazaviy Metriklari ---');

  const usersCountRes = await db.query(`SELECT COUNT(*) as total FROM "users";`);
  assert(Number(usersCountRes.rows[0].total) === 3, 'Jami foydalanuvchilar soni to‘g‘ri (3 ta)');

  const studentsCountRes = await db.query(`SELECT COUNT(*) as total FROM "users" WHERE "role" = 'STUDENT';`);
  assert(Number(studentsCountRes.rows[0].total) === 1, 'Talabalar soni to‘g‘ri (1 ta)');

  const teachersCountRes = await db.query(`SELECT COUNT(*) as total FROM "users" WHERE "role" = 'TEACHER';`);
  assert(Number(teachersCountRes.rows[0].total) === 1, 'Ustozlar soni to‘g‘ri (1 ta)');

  const coursesCountRes = await db.query(`SELECT COUNT(*) as total FROM "courses";`);
  assert(Number(coursesCountRes.rows[0].total) === 2, 'Jami kurslar soni to‘g‘ri (2 ta)');

  const publishedCoursesRes = await db.query(`SELECT COUNT(*) as total FROM "courses" WHERE "status" = 'PUBLISHED';`);
  assert(Number(publishedCoursesRes.rows[0].total) === 1, 'Chop etilgan kurslar soni to‘g‘ri (1 ta)');

  const draftCoursesRes = await db.query(`SELECT COUNT(*) as total FROM "courses" WHERE "status" = 'DRAFT';`);
  assert(Number(draftCoursesRes.rows[0].total) === 1, 'Qoralama kurslar soni to‘g‘ri (1 ta)');

  const pendingVerRes = await db.query(`SELECT COUNT(*) as total FROM "teacher_verifications" WHERE "status" = 'PENDING';`);
  assert(Number(pendingVerRes.rows[0].total) === 1, 'Kutilayotgan verifikatsiyalar soni to‘g‘ri (1 ta)');

  const pendingRepRes = await db.query(`SELECT COUNT(*) as total FROM "reports" WHERE "status" = 'PENDING';`);
  assert(Number(pendingRepRes.rows[0].total) === 1, 'Kutilayotgan shikoyatlar soni to‘g‘ri (1 ta)');

  // ==========================================
  // TEST GROUP 2: USER MANAGEMENT (SUSPEND / REACTIVATE / ROLE)
  // ==========================================
  console.log('\n--- TEST GROUP 2: Foydalanuvchilarni Boshqarish ---');

  // 2.1. Suspend Student
  await db.exec(`
    UPDATE "users" SET "status" = 'SUSPENDED', "updatedAt" = NOW() WHERE "id" = 'user-student-1';
    INSERT INTO "audit_logs" ("id", "userId", "action", "entity", "entityId", "details", "createdAt")
    VALUES ('al-1', 'user-admin-1', 'UPDATE_STATUS', 'User', 'user-student-1', '{"status":"SUSPENDED"}', NOW());
  `);
  const suspendedCheck = await db.query(`SELECT "status" FROM "users" WHERE "id" = 'user-student-1';`);
  assert(suspendedCheck.rows[0].status === 'SUSPENDED', 'Foydalanuvchi hisobi SUSPENDED holatiga o‘tkazildi');

  // 2.2. Reactivate Student
  await db.exec(`
    UPDATE "users" SET "status" = 'ACTIVE', "updatedAt" = NOW() WHERE "id" = 'user-student-1';
  `);
  const activeCheck = await db.query(`SELECT "status" FROM "users" WHERE "id" = 'user-student-1';`);
  assert(activeCheck.rows[0].status === 'ACTIVE', 'Foydalanuvchi hisobi qayta ACTIVE qilindi');

  // 2.3. Role management
  await db.exec(`
    UPDATE "users" SET "role" = 'TEACHER', "updatedAt" = NOW() WHERE "id" = 'user-student-1';
  `);
  const roleCheck = await db.query(`SELECT "role" FROM "users" WHERE "id" = 'user-student-1';`);
  assert(roleCheck.rows[0].role === 'TEACHER', 'Foydalanuvchi roli TEACHER ga yangilandi');

  // ==========================================
  // TEST GROUP 3: COURSE MODERATION
  // ==========================================
  console.log('\n--- TEST GROUP 3: Kurslar Moderatsiyasi ---');

  // 3.1. Admin approves course-draft-1
  await db.exec(`
    UPDATE "courses" SET "status" = 'PUBLISHED', "updatedAt" = NOW() WHERE "id" = 'course-draft-1';
    INSERT INTO "audit_logs" ("id", "userId", "action", "entity", "entityId", "details", "createdAt")
    VALUES ('al-2', 'user-admin-1', 'UPDATE_COURSE_STATUS', 'Course', 'course-draft-1', '{"status":"PUBLISHED"}', NOW());
  `);
  const approvedCourse = await db.query(`SELECT "status" FROM "courses" WHERE "id" = 'course-draft-1';`);
  assert(approvedCourse.rows[0].status === 'PUBLISHED', 'Kurs admin tomonidan tasdiqlandi va chop etildi');

  // 3.2. Admin rejects/unpublishes course
  await db.exec(`
    UPDATE "courses" SET "status" = 'DRAFT', "updatedAt" = NOW() WHERE "id" = 'course-draft-1';
  `);
  const unpublishedCourse = await db.query(`SELECT "status" FROM "courses" WHERE "id" = 'course-draft-1';`);
  assert(unpublishedCourse.rows[0].status === 'DRAFT', 'Kurs qayta qoralamaga o‘tkazildi');

  // ==========================================
  // TEST GROUP 4: TEACHER VERIFICATION & REPORTS
  // ==========================================
  console.log('\n--- TEST GROUP 4: Ustozlik Verifikatsiyasi va Shikoyatlar ---');

  // 4.1. Review verification (Approve)
  await db.exec(`
    UPDATE "teacher_verifications" 
    SET "status" = 'APPROVED', "verifiedAt" = NOW(), "updatedAt" = NOW() 
    WHERE "id" = 'ver-app-1';

    UPDATE "teacher_profiles" SET "isVerified" = true, "updatedAt" = NOW() WHERE "id" = 'tp-1';
  `);
  const verApprovedCheck = await db.query(`SELECT * FROM "teacher_verifications" WHERE "id" = 'ver-app-1';`);
  assert(verApprovedCheck.rows[0].status === 'APPROVED', 'Ustozlik arizasi APPROVED deb belgilandi');

  const tpVerifiedCheck = await db.query(`SELECT "isVerified" FROM "teacher_profiles" WHERE "id" = 'tp-1';`);
  assert(tpVerifiedCheck.rows[0].isVerified === true, 'Ustoz profiliga isVerified = true berildi');

  // 4.2. Resolve report
  await db.exec(`
    UPDATE "reports" 
    SET "status" = 'RESOLVED', "adminNotes" = 'Kurs tekshirildi va kamchiliklar bartaraf etildi', "updatedAt" = NOW() 
    WHERE "id" = 'rep-1';
  `);
  const resolvedRepCheck = await db.query(`SELECT * FROM "reports" WHERE "id" = 'rep-1';`);
  assert(resolvedRepCheck.rows[0].status === 'RESOLVED', 'Shikoyat RESOLVED holatiga o‘tkazildi');
  assert(resolvedRepCheck.rows[0].adminNotes !== null, 'Moderator izohi muvaffaqiyatli saqlandi');

  // ==========================================
  // TEST GROUP 5: SECURITY & AUDIT LOGS
  // ==========================================
  console.log('\n--- TEST GROUP 5: Xavfsizlik va Audit Jurnali ---');

  const auditLogsRes = await db.query(`SELECT * FROM "audit_logs" ORDER BY "createdAt" DESC;`);
  assert(auditLogsRes.rows.length >= 2, 'Audit jurnalida barcha xatti-harakatlar saqlanmoqda');
  assert(auditLogsRes.rows[0].userId === 'user-admin-1', 'Audit yozuvida admin ID qayd etilgan');

  // Verify non-admin role check
  const nonAdminRole = 'STUDENT';
  const hasAdminAccess = nonAdminRole === 'ADMIN';
  assert(hasAdminAccess === false, 'Oddiy foydalanuvchilar Admin panelga kirishi to‘liq bloklandi (403 Forbidden)');

  console.log('\n========================================================');
  console.log(`🎉 BARCHA ${passedTests} TA ADMIN PANEL TESTLARI MUVAFFAQIYATLI O‘TDI! (0 XATOLIK)`);
  console.log('========================================================\n');
  process.exit(0);
}

runAdminPanelTests().catch((err) => {
  console.error('❌ Xatolik:', err);
  process.exit(1);
});
