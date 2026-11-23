import 'reflect-metadata';

// Pure JavaScript polyfill: provide default parameter types for Swagger metadata explorer on route methods only
const originalGetMetadata = Reflect.getMetadata;
Reflect.getMetadata = function (metadataKey, target, propertyKey) {
  const result = originalGetMetadata.apply(this, arguments);
  if (metadataKey === 'design:paramtypes' && propertyKey !== undefined && !result) {
    return Array(10).fill(Object);
  }
  return result;
};

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Ultra+ Education Platform API')
    .setDescription(
      'O‘zbekiston zamonaviy premium ta’lim platformasi uchun to‘liq REST API hujjatlari. Foydalanuvchilar, kurslar, darslar, progress, to‘lovlar va admin panel integratsiyasi.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autentifikatsiya, Ro‘yxatdan o‘tish, OTP, Tokenlar')
    .addTag('Users', 'Foydalanuvchi profillari va sozlamalari')
    .addTag('Courses', 'Kurslar katalogi, qidiruv va filtrlash')
    .addTag('Teachers', 'Ustozlar portfoliosi va tasdiqlash')
    .addTag('Categories', 'Kurs kategoriyalari')
    .addTag('Enrollments', 'Kurslarga a’zo bo‘lish va talaba kurslari')
    .addTag('Lessons', 'Darslar mundarijasi va video darsliklar')
    .addTag('Progress', 'O‘quv jarayoni va darslarni o‘zlashtirish')
    .addTag('Notifications', 'Tizim va shaxsiy bildirishnomalar')
    .addTag('Admin', 'Platforma statistikasi va ma’murlar boshqaruvi')
    .addTag('Telegram', 'Telegram bot integratsiyasi va hisobni ulash')
    .addTag('Uploads', 'Fayl va media yuklash xizmatlari')
    .addTag('Quizzes', 'Interaktiv testlar, savollar va natijalar')
    .addTag('Health', 'Tizim va ma’lumotlar bazasi salomatligi')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Ultra+ Education API Docs',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`\n======================================================`);
  console.log(`🚀 NestJS Backend server muvaffaqiyatli ishga tushdi: http://localhost:${port}`);
  console.log(`📑 Swagger API hujjatlari: http://localhost:${port}/api/docs`);
  console.log(`======================================================\n`);
}

bootstrap().catch((err) => {
  console.error('❌ Serverni ishga tushirishda xatolik:', err);
  process.exit(1);
});
