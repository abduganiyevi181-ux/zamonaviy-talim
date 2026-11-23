require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');

async function testBootstrap() {
  console.log('🚀 NestJS ilova konteyneri ishga tushirilmoqda...');
  try {
    const app = await NestFactory.create(AppModule, { logger: ['warn', 'error'] });
    console.log('✅ Barcha 13 ta NestJS modullari va provayderlari muvaffaqiyatli initsializatsiya qilindi!');
    await app.close();
    console.log('✅ Konteyner toza yopildi.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Bootstrap xatosi:', error);
    process.exit(1);
  }
}

testBootstrap();
