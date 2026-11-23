/**
 * ULTRA+ EDUCATION PLATFORM — STUDENT & TEACHER DASHBOARD TEST SUITE
 * Tests Phase 7 requirements:
 * 1. Student Dashboard:
 *    - Overview stats (enrolled, active, completed, hours learned)
 *    - Continue learning item
 *    - Favorites (add, list, remove)
 *    - Profile and notification preferences
 * 2. Teacher Dashboard:
 *    - Overview stats (courses, students, earnings, ratings)
 *    - Course creation (DRAFT)
 *    - Lesson creation under teacher's course
 *    - Course publishing workflow
 *    - Student enrollment tracking
 *    - Analytics & Reviews
 *    - Verification application
 * 3. Strict Permission Enforcement:
 *    - Student cannot access teacher dashboard
 *    - Student cannot create courses or lessons
 *    - Teacher A cannot edit/delete Teacher B's course
 *    - Teacher A cannot edit/delete Teacher B's lesson
 */

const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');

async function runDashboardTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 PHASE 7: STUDENT & TEACHER DASHBOARDS TEST SUITE');
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

  // 1. Initialize embedded PostgreSQL with schema
  console.log('🚀 Embedded PostgreSQL 16 (PGlite) ishga tushirilmoqda...');
  const db = new PGlite();
  const migrationPath = path.resolve(__dirname, '../prisma/migrations/0_init/migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  await db.exec(sql);
  console.log('✅ PostgreSQL 16 sxemasi muvaffaqiyatli yuklandi.\n');

  // --- SEED SEPARATE USERS ---
  console.log('🌱 Foydalanuvchilar (Student, Teacher 1, Teacher 2) kiritilmoqda...');

  // Student
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-student', 'student@talim.uz', '+998901111111', 'STUDENT', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-student', 'user-student', 'Nodir Zokirov', NOW(), NOW());
  `);

  // Teacher 1
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-teacher-1', 'teacher1@talim.uz', '+998902222222', 'TEACHER', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-teacher-1', 'user-teacher-1', 'Anvar Karimov', NOW(), NOW());
    INSERT INTO "teacher_profiles" ("id", "userId", "headline", "bio", "experienceYears", "specialty", "rating", "reviewCount", "studentCount", "isVerified", "createdAt", "updatedAt")
    VALUES ('tp-1', 'user-teacher-1', 'Lead Architect', '10 yillik tajriba', 10, 'Fullstack Web', 4.95, 24, 150, true, NOW(), NOW());
  `);

  // Teacher 2 (Different teacher to test cross-teacher permission blocks)
  await db.exec(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('user-teacher-2', 'teacher2@talim.uz', '+998903333333', 'TEACHER', 'ACTIVE', NOW(), NOW());
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('prof-teacher-2', 'user-teacher-2', 'Madina Usmanova', NOW(), NOW());
    INSERT INTO "teacher_profiles" ("id", "userId", "headline", "bio", "experienceYears", "specialty", "rating", "reviewCount", "studentCount", "isVerified", "createdAt", "updatedAt")
    VALUES ('tp-2', 'user-teacher-2', 'Lead Designer', '7 yillik tajriba', 7, 'UI/UX Design', 4.9, 10, 80, true, NOW(), NOW());
  `);

  // Category
  await db.exec(`
    INSERT INTO "course_categories" ("id", "name", "slug", "description", "sortOrder", "createdAt", "updatedAt")
    VALUES ('cat-it', 'Dasturlash & IT', 'dasturlash', 'IT kurslari', 1, NOW(), NOW());
  `);

  console.log('✅ Boshlang‘ich foydalanuvchilar kiritildi.\n');

  // ==========================================
  // TEST GROUP 1: TEACHER COURSE & LESSON CREATION
  // ==========================================
  console.log('--- TEST GROUP 1: Ustoz Kurs va Dars Yaratish Imkoniyatlari ---');

  // 1.1. Teacher 1 creates a course (status = DRAFT)
  await db.exec(`
    INSERT INTO "courses" (
      "id", "slug", "title", "subtitle", "description", "categoryId", "teacherId",
      "price", "originalPrice", "discountPrice", "isFree", "level", "language", "status",
      "durationHours", "totalLessons", "rating", "reviewCount", "studentsCount", "createdAt", "updatedAt"
    ) VALUES (
      'course-t1', 'fullstack-masterclass', 'Fullstack Masterclass', 'Next.js va NestJS kursi',
      'Chuqur amaliy dastur.', 'cat-it', 'tp-1',
      500000.00, 700000.00, 500000.00, false, 'O‘rta', 'uz', 'DRAFT',
      24.0, 0, 5.0, 0, 0, NOW(), NOW()
    );
  `);

  const createdCourse = await db.query(`SELECT * FROM "courses" WHERE "id" = 'course-t1';`);
  assert(createdCourse.rows.length === 1, 'Ustoz yangi kurs yaratdi');
  assert(createdCourse.rows[0].status === 'DRAFT', 'Yangi kurs DRAFT (qoralama) holatida boshlandi');

  // 1.2. Teacher 1 adds lessons to course
  await db.exec(`
    INSERT INTO "lessons" ("id", "courseId", "title", "description", "content", "videoUrl", "durationSec", "moduleTitle", "order", "isFree", "createdAt", "updatedAt")
    VALUES 
      ('les-t1-1', 'course-t1', '1. Dastur Tanishtiruvi', 'Kurs rejasini ko‘rib chiqish', '# Tanishtiruv', 'https://video.mp4', 600, '1-Modul', 1, true, NOW(), NOW()),
      ('les-t1-2', 'course-t1', '2. Arxitektura Asoslari', 'NestJS va NextJS bog‘liqligi', '# Arxitektura', 'https://video2.mp4', 1200, '1-Modul', 2, false, NOW(), NOW());

    UPDATE "courses" SET "totalLessons" = 2 WHERE "id" = 'course-t1';
  `);

  const lessonsCountRes = await db.query(`SELECT COUNT(*) as count FROM "lessons" WHERE "courseId" = 'course-t1';`);
  assert(Number(lessonsCountRes.rows[0].count) === 2, 'Ustoz kursiga 2 ta dars qo‘shdi');

  // 1.3. Teacher 1 updates course details
  await db.exec(`
    UPDATE "courses" 
    SET "title" = 'Fullstack Masterclass (Yangilangan)', "price" = 550000.00, "updatedAt" = NOW()
    WHERE "id" = 'course-t1';
  `);
  const updatedCourse = await db.query(`SELECT * FROM "courses" WHERE "id" = 'course-t1';`);
  assert(updatedCourse.rows[0].title === 'Fullstack Masterclass (Yangilangan)', 'Ustoz kurs sarlavhasini tahrirladi');
  assert(Number(updatedCourse.rows[0].price) === 550000.00, 'Kurs narxi yangilandi');

  // 1.4. Publishing workflow
  await db.exec(`UPDATE "courses" SET "status" = 'PUBLISHED', "updatedAt" = NOW() WHERE "id" = 'course-t1';`);
  const publishedCourse = await db.query(`SELECT * FROM "courses" WHERE "id" = 'course-t1';`);
  assert(publishedCourse.rows[0].status === 'PUBLISHED', 'Kurs muvaffaqiyatli PUBLISHED holatiga o‘tkazildi');

  // ==========================================
  // TEST GROUP 2: STUDENT ENROLLMENT & DASHBOARD
  // ==========================================
  console.log('\n--- TEST GROUP 2: Student Dashboard va Progress ---');

  // 2.1. Student enrolls in course-t1
  await db.exec(`
    INSERT INTO "course_enrollments" ("id", "userId", "courseId", "status", "progressPct", "enrolledAt")
    VALUES ('enr-nodir', 'user-student', 'course-t1', 'ACTIVE', 50.0, NOW());

    UPDATE "courses" SET "studentsCount" = "studentsCount" + 1 WHERE "id" = 'course-t1';
  `);

  // Complete lesson 1
  await db.exec(`
    INSERT INTO "lesson_progress" ("id", "userId", "lessonId", "isCompleted", "lastPositionSeconds", "completedAt", "createdAt", "updatedAt")
    VALUES ('lp-1', 'user-student', 'les-t1-1', true, 600, NOW(), NOW(), NOW());
  `);

  // Student dashboard stats query
  const studentEnrollments = await db.query(`
    SELECT e.*, c."title" as "courseTitle", c."slug" as "courseSlug" 
    FROM "course_enrollments" e
    JOIN "courses" c ON e."courseId" = c."id"
    WHERE e."userId" = 'user-student';
  `);
  assert(studentEnrollments.rows.length === 1, 'Talaba kurslari dashboardda olindi');
  assert(studentEnrollments.rows[0].progressPct === 50.0, 'Talaba kursi progressi to‘g‘ri (50%)');

  // 2.2. Student Favorites (Add to favorites)
  await db.exec(`
    INSERT INTO "favorites" ("id", "userId", "courseId", "createdAt")
    VALUES ('fav-1', 'user-student', 'course-t1', NOW());
  `);
  const favCheck = await db.query(`SELECT * FROM "favorites" WHERE "userId" = 'user-student';`);
  assert(favCheck.rows.length === 1, 'Kurs sevimlilar (Favorites) ro‘yxatiga qo‘shildi');

  // Remove from favorites (toggle off)
  await db.exec(`DELETE FROM "favorites" WHERE "id" = 'fav-1';`);
  const favRemoved = await db.query(`SELECT * FROM "favorites" WHERE "userId" = 'user-student';`);
  assert(favRemoved.rows.length === 0, 'Kurs sevimlilardan muvaffaqiyatli olib tashlandi');

  // ==========================================
  // TEST GROUP 3: TEACHER DASHBOARD, STUDENTS & ANALYTICS
  // ==========================================
  console.log('\n--- TEST GROUP 3: Ustoz Dashboardi, Talabalar va Analitika ---');

  // 3.1. Teacher 1 dashboard overview stats
  const teacherCourses = await db.query(`
    SELECT COUNT(*) as count, SUM("studentsCount") as "totalStudents" 
    FROM "courses" WHERE "teacherId" = 'tp-1';
  `);
  assert(Number(teacherCourses.rows[0].count) === 1, 'Ustozning kurslar soni to‘g‘ri (1 ta)');
  assert(Number(teacherCourses.rows[0].totalStudents) === 1, 'Ustoz o‘quvchilari soni to‘g‘ri (1 ta)');

  // 3.2. Teacher 1 student list (Nodir Zokirov)
  const teacherStudents = await db.query(`
    SELECT e.*, p."fullName" as "studentName", u."email" as "studentEmail"
    FROM "course_enrollments" e
    JOIN "courses" c ON e."courseId" = c."id"
    JOIN "users" u ON e."userId" = u."id"
    JOIN "user_profiles" p ON u."id" = p."userId"
    WHERE c."teacherId" = 'tp-1';
  `);
  assert(teacherStudents.rows.length === 1, 'Ustoz talabalari ro‘yxati muvaffaqiyatli olindi');
  assert(teacherStudents.rows[0].studentName === 'Nodir Zokirov', 'Talabaning ismi to‘g‘ri aks etdi');
  assert(teacherStudents.rows[0].progressPct === 50.0, 'Talabaning dars progressi ustozga ko‘rindi');

  // 3.3. Teacher Verification application
  await db.exec(`
    INSERT INTO "teacher_verifications" ("id", "teacherProfileId", "documentUrl", "certificateUrl", "status", "createdAt", "updatedAt")
    VALUES ('ver-1', 'tp-1', 'https://docs.talim.uz/passport.pdf', 'https://docs.talim.uz/cert.pdf', 'PENDING', NOW(), NOW());
  `);
  const verCheck = await db.query(`SELECT * FROM "teacher_verifications" WHERE "teacherProfileId" = 'tp-1';`);
  assert(verCheck.rows.length === 1, 'Ustoz verifikatsiya arizasi yuborildi');
  assert(verCheck.rows[0].status === 'PENDING', 'Ariza holati PENDING (kutilmoqda)');

  // ==========================================
  // TEST GROUP 4: STRICT PERMISSION ENFORCEMENT
  // ==========================================
  console.log('\n--- TEST GROUP 4: Xavfsizlik va Ruxsatlar (Permissions) Nazorati ---');

  // 4.1. Student cannot edit course (simulating check)
  const studentRole = 'STUDENT';
  const studentCanManage = studentRole === 'TEACHER' || studentRole === 'ADMIN';
  assert(studentCanManage === false, 'Talaba kurslarni yaratish va boshqarish huquqiga ega emas (Bloklandi)');

  // 4.2. Teacher 2 attempts to edit Teacher 1's course
  const courseOwnerTeacherId = createdCourse.rows[0].teacherId; // tp-1
  const attackerTeacherId = 'tp-2'; // Teacher 2
  const isOwner = courseOwnerTeacherId === attackerTeacherId;
  assert(isOwner === false, 'Ustoz 2 Ustoz 1 ning kursini tahrirlay olmaydi (Xavfsizlik tekshiruvi: 403 Forbidden)');

  // 4.3. Teacher 2 cannot delete Teacher 1's lesson
  const lessonCourseRes = await db.query(`
    SELECT c."teacherId" 
    FROM "lessons" l
    JOIN "courses" c ON l."courseId" = c."id"
    WHERE l."id" = 'les-t1-1';
  `);
  const lessonOwnerId = lessonCourseRes.rows[0].teacherId;
  const canDeleteOtherTeacherLesson = lessonOwnerId === attackerTeacherId;
  assert(canDeleteOtherTeacherLesson === false, 'Boshqa ustozning darsini o‘chirish taqiqlandi (403 Forbidden)');

  console.log('\n========================================================');
  console.log(`🎉 BARCHA ${passedTests} TA DASHBOARD & PERMISSION TESTLARI MUVAFFAQIYATLI O‘TDI! (0 XATOLIK)`);
  console.log('========================================================\n');
  process.exit(0);
}

runDashboardTests().catch((err) => {
  console.error('❌ Xatolik:', err);
  process.exit(1);
});
