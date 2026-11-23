require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');

async function checkDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  console.log('🔍 PostgreSQL ulanishi tekshirilmoqda...');
  console.log(`URL: ${databaseUrl ? databaseUrl.replace(/:[^:@]+@/, ':****@') : 'TOPILMADI'}`);

  if (!databaseUrl) {
    console.error('❌ Xato: DATABASE_URL o\'zgaruvchisi topilmadi!');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL serveriga ulandi!');
    const res = await client.query('SELECT version(), current_database(), current_user;');
    console.log('📊 Ma\'lumotlar bazasi ma\'lumoti:');
    console.log(`   - DB Nomi: ${res.rows[0].current_database}`);
    console.log(`   - Foydalanuvchi: ${res.rows[0].current_user}`);
    console.log(`   - Versiya: ${res.rows[0].version.split('\n')[0]}`);
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('⚠️ PostgreSQL ulanishida xatolik:', error.message);
    console.log('\n💡 Eslatma: PostgreSQL xizmati (Docker yoki mahalliy servis) ishga tushirilganligini tekshiring:');
    console.log('   docker compose up -d postgres\n');
    await client.end().catch(() => {});
    process.exit(1);
  }
}

checkDatabase();
