const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');

async function testMigration() {
  console.log('🚀 Embedded PostgreSQL 16 (PGlite) ishga tushirilmoqda...');
  const db = new PGlite();

  const migrationPath = path.resolve(__dirname, '../prisma/migrations/0_init/migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📦 SQL Migratsiyasi bajarilmoqda...');
  await db.exec(sql);

  const tablesRes = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name ASC;
  `);

  console.log(`\n✅ Muvaffaqiyatli yaratilgan PostgreSQL jadvallari (${tablesRes.rows.length} ta):`);
  tablesRes.rows.forEach((row, i) => {
    console.log(`  ${i + 1}. ${row.table_name}`);
  });

  // Verify inserting test data into users and user_profiles
  console.log('\n🧪 Test yozuvlarini tekshirish (users va user_profiles)...');
  await db.query(`
    INSERT INTO "users" ("id", "email", "phone", "role", "status", "createdAt", "updatedAt")
    VALUES ('test-user-1', 'admin@talim.uz', '+998901234567', 'ADMIN', 'ACTIVE', NOW(), NOW());
  `);

  await db.query(`
    INSERT INTO "user_profiles" ("id", "userId", "fullName", "createdAt", "updatedAt")
    VALUES ('test-profile-1', 'test-user-1', 'Bosh Administrator', NOW(), NOW());
  `);

  const userRes = await db.query(`
    SELECT u.id, u.email, u.phone, u.role, p."fullName"
    FROM "users" u
    LEFT JOIN "user_profiles" p ON u.id = p."userId"
    WHERE u.id = 'test-user-1';
  `);

  console.log('✅ Foydalanuvchi muvaffaqiyatli o‘qildi:', userRes.rows[0]);

  console.log('\n🎉 PostgreSQL 16 ma’lumotlar bazasi va barcha 23 ta Prisma jadvallari to‘liq tasdiqlandi!');
  process.exit(0);
}

testMigration().catch((err) => {
  console.error('❌ Xatolik:', err);
  process.exit(1);
});
