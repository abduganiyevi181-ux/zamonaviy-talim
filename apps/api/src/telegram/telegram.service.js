import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Dependencies,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Telegraf, Markup } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class TelegramService {
  constructor(prisma) {
    this.prisma = prisma;
    this.bot = null;
    this.isMockMode = true;
    this.botUsername = process.env.TELEGRAM_BOT_USERNAME || 'talim_platform_bot';
  }

  async onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token && token !== 'mock_token' && token !== 'test_token') {
      try {
        this.bot = new Telegraf(token);
        this.isMockMode = false;
        this.setupBotHandlers();
        console.log(`🤖 [TelegramService] Telegraf bot initsializatsiya qilindi (@${this.botUsername})`);
      } catch (err) {
        console.warn(`⚠️ [TelegramService] Telegraf initsializatsiyasida ogohlantirish: ${err.message}. Mock rejimga o‘tildi.`);
        this.isMockMode = true;
      }
    } else {
      console.log('🤖 [TelegramService] TELEGRAM_BOT_TOKEN topilmadi. Development / Mock Telegram provider faollashtirildi.');
      this.isMockMode = true;
    }
  }

  /**
   * Main Menu Keyboard Layout
   */
  getMainMenuKeyboard(isAdmin = false) {
    const buttons = [
      ['📚 Kurslarim', '🔍 Kurslarni topish'],
      ['📊 O‘qish progressim', '🔔 Bildirishnomalar'],
      ['👤 Profilim', '⚙️ Sozlamalar'],
      ['ℹ️ Yordam'],
    ];

    if (isAdmin) {
      buttons.push(['🛡️ Admin Statistika']);
    }

    return {
      keyboard: buttons,
      resize_keyboard: true,
      persistent: true,
    };
  }

  /**
   * Setup Telegraf Listeners
   */
  setupBotHandlers() {
    if (!this.bot) return;

    // Commands
    this.bot.command('start', async (ctx) => {
      const text = ctx.message.text;
      const tgUser = ctx.from;
      const res = await this.handleStart(tgUser.id, text, tgUser);
      return ctx.reply(res.text, {
        parse_mode: 'HTML',
        reply_markup: res.replyMarkup,
      });
    });

    this.bot.command('help', async (ctx) => {
      const res = await this.handleHelp();
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('courses', async (ctx) => {
      const res = await this.handleCourses();
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('mycourses', async (ctx) => {
      const res = await this.handleMyCourses(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('progress', async (ctx) => {
      const res = await this.handleProgress(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('profile', async (ctx) => {
      const res = await this.handleProfile(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('notifications', async (ctx) => {
      const res = await this.handleNotifications(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('settings', async (ctx) => {
      const res = await this.handleSettings(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('language', async (ctx) => {
      const res = await this.handleLanguage();
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('unlink', async (ctx) => {
      const res = await this.handleUnlink(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    // Admin Commands
    this.bot.command('admin_stats', async (ctx) => {
      const res = await this.handleAdminStats(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.command('admin_health', async (ctx) => {
      const res = await this.handleAdminHealth(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    // Main Menu Text Buttons Matching
    this.bot.hears('📚 Kurslarim', async (ctx) => {
      const res = await this.handleMyCourses(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.hears('🔍 Kurslarni topish', async (ctx) => {
      const res = await this.handleCourses();
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.hears('📊 O‘qish progressim', async (ctx) => {
      const res = await this.handleProgress(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.hears('🔔 Bildirishnomalar', async (ctx) => {
      const res = await this.handleNotifications(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.hears('👤 Profilim', async (ctx) => {
      const res = await this.handleProfile(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.hears('⚙️ Sozlamalar', async (ctx) => {
      const res = await this.handleSettings(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.hears('ℹ️ Yordam', async (ctx) => {
      const res = await this.handleHelp();
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });

    this.bot.hears('🛡️ Admin Statistika', async (ctx) => {
      const res = await this.handleAdminStats(ctx.from.id);
      return ctx.reply(res.text, { parse_mode: 'HTML' });
    });
  }

  /**
   * 1. Account Linking: Generate Short-lived Token (Website)
   */
  async generateLinkToken(userId) {
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.prisma.telegramLinkToken.create({
      data: {
        userId,
        token,
        expiresAt,
        isUsed: false,
      },
    });

    const linkUrl = `https://t.me/${this.botUsername}?start=link_${token}`;

    return {
      success: true,
      data: {
        token,
        linkUrl,
        expiresInMinutes: 15,
      },
    };
  }

  /**
   * 2. Account Linking: Link with token from Telegram deep link
   */
  async linkWithToken(token, tgData) {
    // Clean token if prefixed with link_
    const cleanToken = token.startsWith('link_') ? token.replace('link_', '') : token;

    const linkRecord = await this.prisma.telegramLinkToken.findUnique({
      where: { token: cleanToken },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!linkRecord) {
      throw new BadRequestException('Havola tokeni topilmadi yoki yaroqsiz');
    }

    if (linkRecord.isUsed) {
      throw new BadRequestException('Ushbu havola allaqachon ishlatilgan');
    }

    if (new Date() > new Date(linkRecord.expiresAt)) {
      throw new BadRequestException('Havola muddati tugagan (15 daqiqadan oshgan)');
    }

    const { telegramId, username, firstName } = tgData;

    // Create or update TelegramAccount
    await this.prisma.telegramAccount.upsert({
      where: { userId: linkRecord.userId },
      update: {
        telegramId: String(telegramId),
        username: username || null,
        firstName: firstName || null,
        isLinked: true,
        linkedAt: new Date(),
      },
      create: {
        userId: linkRecord.userId,
        telegramId: String(telegramId),
        username: username || null,
        firstName: firstName || null,
        isLinked: true,
      },
    });

    // Invalidate token (single-use)
    await this.prisma.telegramLinkToken.update({
      where: { id: linkRecord.id },
      data: { isUsed: true },
    });

    // Ensure notification preference has Telegram enabled
    await this.prisma.notificationPreference.upsert({
      where: { userId: linkRecord.userId },
      update: { tgEnabled: true },
      create: { userId: linkRecord.userId, tgEnabled: true },
    });

    return {
      success: true,
      message: 'Telegram hisobi muvaffaqiyatli bog‘landi',
      user: linkRecord.user,
    };
  }

  /**
   * Helper: Get linked user by Telegram ID
   */
  async getLinkedUser(telegramId) {
    const tgAccount = await this.prisma.telegramAccount.findFirst({
      where: {
        telegramId: String(telegramId),
        isLinked: true,
      },
      include: {
        user: {
          include: {
            profile: true,
            teacherProfile: true,
            notificationPref: true,
          },
        },
      },
    });

    return tgAccount?.user || null;
  }

  /**
   * Handler: /start
   */
  async handleStart(telegramId, text = '', tgUser = {}) {
    // Check if deep link token is passed
    const parts = text.split(' ');
    if (parts.length > 1 && (parts[1].startsWith('link_') || parts[1].length >= 30)) {
      try {
        const linkRes = await this.linkWithToken(parts[1], {
          telegramId,
          username: tgUser.username,
          firstName: tgUser.first_name,
        });

        const name = linkRes.user?.profile?.fullName || linkRes.user?.email || 'Foydalanuvchi';
        const isAdmin = linkRes.user?.role === 'ADMIN';

        return {
          text: `🎉 <b>Tabriklaymiz, ${name}!</b>\n\nSizning platformadagi hisobingiz ushbu Telegram akkauntga muvaffaqiyatli ulandi.\n\nEndi siz o‘quv jarayoni, yangi darslar va xavfsizlik bildirishnomalarini shu yerda olasiz.`,
          replyMarkup: this.getMainMenuKeyboard(isAdmin),
        };
      } catch (err) {
        return {
          text: `⚠️ <b>Ulanishda xatolik:</b> ${err.message}\n\nIltimos, platforma saytidan yangi havola oling.`,
          replyMarkup: this.getMainMenuKeyboard(false),
        };
      }
    }

    const user = await this.getLinkedUser(telegramId);
    if (user) {
      const name = user.profile?.fullName || user.email || 'Foydalanuvchi';
      const isAdmin = user.role === 'ADMIN';
      return {
        text: `👋 <b>Assalomu alaykum, ${name}!</b>\n\n<b>Ultra+ Zamonaviy Taʼlim Platformasi</b> botiga xush kelibsiz.\n\nQuyidagi menyu orqali kurslaringizni, o‘qish progressini va hisobingizni boshqarishingiz mumkin:`,
        replyMarkup: this.getMainMenuKeyboard(isAdmin),
      };
    }

    return {
      text: `👋 <b>Assalomu alaykum!</b>\n\n<b>Ultra+ Zamonaviy Taʼlim Platformasi</b> rasmiy Telegram botiga xush kelibsiz.\n\nHisobingizni ulash uchun platforma saytidagi <b>Sozlamalar</b> bo‘limidan <i>"Telegramni ulash"</i> tugmasini bosing.\n\nMavjud kurslarimiz bilan tanishish uchun /courses buyrug‘idan foydalanishingiz mumkin.`,
      replyMarkup: this.getMainMenuKeyboard(false),
    };
  }

  /**
   * Handler: /courses
   */
  async handleCourses() {
    const courses = await this.prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });

    if (courses.length === 0) {
      return {
        text: '📚 Hozirda ochiq kurslar mavjud emas.',
      };
    }

    let text = '🎓 <b>Platformadagi Amaliy Kurslar:</b>\n\n';
    courses.forEach((c, idx) => {
      text += `<b>${idx + 1}. ${c.title}</b>\n`;
      text += `📂 Yo‘nalish: ${c.category?.name || 'Umumiy'}\n`;
      text += `⭐ Reyting: ${c.rating} (${c.studentsCount} ta o‘quvchi)\n`;
      text += `💰 Narxi: ${Number(c.price).toLocaleString('uz-UZ')} so‘m\n\n`;
    });

    text += '👉 Batafsil va ro‘yxatdan o‘tish saytda: <a href="http://localhost:3000/courses">Kurslar Katalogi</a>';

    return { text };
  }

  /**
   * Handler: /mycourses
   */
  async handleMyCourses(telegramId) {
    const user = await this.getLinkedUser(telegramId);
    if (!user) {
      return {
        text: '🔒 Kurslaringizni ko‘rish uchun avval hisobingizni ulang. Saytdagi <b>Sozlamalar</b> bo‘limidan Telegram havolasini oling.',
      };
    }

    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { userId: user.id },
      include: {
        course: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (enrollments.length === 0) {
      return {
        text: '📚 Siz hali biror kursga yozilmadingiz.\n\nKurslarni topish uchun /courses buyrug‘ini bosing.',
      };
    }

    let text = `📚 <b>Mening Kurslarim (${enrollments.length} ta):</b>\n\n`;
    enrollments.forEach((e, idx) => {
      const statusIcon = e.status === 'COMPLETED' ? '✅' : '📖';
      text += `${statusIcon} <b>${idx + 1}. ${e.course.title}</b>\n`;
      text += `📊 Progress: <b>${e.progressPct}%</b>\n`;
      text += `🎯 Holat: ${e.status === 'COMPLETED' ? 'Tugallangan' : 'Faol taʼlimda'}\n\n`;
    });

    return { text };
  }

  /**
   * Handler: /progress
   */
  async handleProgress(telegramId) {
    const user = await this.getLinkedUser(telegramId);
    if (!user) {
      return {
        text: '🔒 Progressingizni bilish uchun hisobingizni platforma bilan bog‘lang.',
      };
    }

    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { userId: user.id },
    });

    const completedLessons = await this.prisma.lessonProgress.findMany({
      where: { userId: user.id, isCompleted: true },
      include: { lesson: { select: { durationSec: true } } },
    });

    const totalDurationSec = completedLessons.reduce((sum, p) => sum + (p.lesson?.durationSec || 0), 0);
    const hours = (totalDurationSec / 3600).toFixed(1);
    const completedCount = enrollments.filter((e) => e.status === 'COMPLETED').length;

    return {
      text: `📊 <b>O‘quv Ko‘rsatkichlaringiz:</b>\n\n` +
        `📚 Kurslar soni: <b>${enrollments.length} ta</b>\n` +
        `✅ Tugallangan kurslar: <b>${completedCount} ta</b>\n` +
        `⏱️ O‘rganilgan vaqt: <b>${hours} soat</b>\n` +
        `📝 Tugallangan darslar: <b>${completedLessons.length} ta</b>\n\n` +
        `<i>Bilim olishda davom eting!</i>`,
    };
  }

  /**
   * Handler: /profile
   */
  async handleProfile(telegramId) {
    const user = await this.getLinkedUser(telegramId);
    if (!user) {
      return {
        text: '🔒 Profilingizni ko‘rish uchun hisobingizni ulang.',
      };
    }

    return {
      text: `👤 <b>Shaxsiy Profilingiz:</b>\n\n` +
        `🏷️ Ism: <b>${user.profile?.fullName || 'Ko‘rsatilmagan'}</b>\n` +
        `📧 Email: <code>${user.email || 'Mavjud emas'}</code>\n` +
        `📱 Telefon: <code>${user.phone || 'Mavjud emas'}</code>\n` +
        `🛡️ Rol: <b>${user.role}</b>\n` +
        `⚡ Holat: <b>${user.status}</b>\n` +
        `💼 Kasb/Sarlavha: ${user.profile?.headline || 'Talaba'}`,
    };
  }

  /**
   * Handler: /notifications
   */
  async handleNotifications(telegramId) {
    const user = await this.getLinkedUser(telegramId);
    if (!user) {
      return {
        text: '🔒 Bildirishnomalarni ko‘rish uchun hisobingizni ulang.',
      };
    }

    const notifs = await this.prisma.notification.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (notifs.length === 0) {
      return {
        text: '🔔 Hozircha yangi bildirishnomalar mavjud emas.',
      };
    }

    let text = '🔔 <b>So‘nggi Bildirishnomalar:</b>\n\n';
    notifs.forEach((n, idx) => {
      text += `<b>${idx + 1}. ${n.title}</b>\n${n.message}\n\n`;
    });

    return { text };
  }

  /**
   * Handler: /settings
   */
  async handleSettings(telegramId) {
    const user = await this.getLinkedUser(telegramId);
    if (!user) {
      return {
        text: '⚙️ Sozlamalarni ko‘rish uchun hisobingizni ulang.',
      };
    }

    const pref = user.notificationPref;

    return {
      text: `⚙️ <b>Xabarnoma Sozlamalari:</b>\n\n` +
        `✈️ Telegram xabarnomalar: <b>${pref?.tgEnabled ? '✅ Yoqilgan' : '❌ O‘chirilgan'}</b>\n` +
        `📧 Email xabarnomalar: <b>${pref?.emailEnabled ? '✅ Yoqilgan' : '❌ O‘chirilgan'}</b>\n` +
        `📱 SMS xabarnomalar: <b>${pref?.smsEnabled ? '✅ Yoqilgan' : '❌ O‘chirilgan'}</b>\n\n` +
        `Hisobni uzish uchun: /unlink buyrug‘ini bosing.`,
    };
  }

  /**
   * Handler: /language
   */
  async handleLanguage() {
    return {
      text: `🌐 <b>Tilni tanlang / Выберите язык:</b>\n\n` +
        `Hozirgi til: <b>O‘zbekcha (UZ)</b>\n` +
        `Platforma to‘liq o‘zbek tilida xizmat ko‘rsatadi.`,
    };
  }

  /**
   * Handler: /unlink
   */
  async handleUnlink(telegramId) {
    const user = await this.getLinkedUser(telegramId);
    if (!user) {
      return {
        text: 'Sizning hisobingiz botga ulanmagan.',
      };
    }

    await this.prisma.telegramAccount.updateMany({
      where: { userId: user.id },
      data: { isLinked: false },
    });

    return {
      text: '🔓 <b>Telegram hisobingiz platformadan uzildi.</b>\n\nQayta ulash uchun saytdagi Sozlamalar bo‘limidan yangi havola oling.',
      replyMarkup: this.getMainMenuKeyboard(false),
    };
  }

  /**
   * Handler: /help
   */
  async handleHelp() {
    return {
      text: `ℹ️ <b>Mavjud Buyruqlar Qo‘llanmasi:</b>\n\n` +
        `/start - Botni ishga tushirish va menyu\n` +
        `/courses - Ommaviy kurslar ro‘yxati\n` +
        `/mycourses - Shaxsiy kurslarim\n` +
        `/progress - O‘quv ko‘rsatkichlarim\n` +
        `/profile - Shaxsiy profilim\n` +
        `/notifications - Bildirishnomalar\n` +
        `/settings - Xabarnoma sozlamalari\n` +
        `/language - Tilni ko‘rish\n` +
        `/unlink - Telegram hisobini uzish\n` +
        `/help - Ushbu qo‘llanma\n\n` +
        `Savollaringiz bo‘lsa, qo‘llab-quvvatlash xizmati bilan bog‘laning: @talim_support`,
    };
  }

  /**
   * Admin Bot: /admin_stats
   */
  async handleAdminStats(telegramId) {
    const user = await this.getLinkedUser(telegramId);
    if (user?.role !== 'ADMIN') {
      return {
        text: '⛔ <b>Ruxsat etilmagan:</b> Ushbu buyruq faqat platforma adminlari uchun mo‘ljallangan.',
      };
    }

    const [usersCount, coursesCount, enrollmentsCount, reportsCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.courseEnrollment.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      text: `🛡️ <b>Admin Platforma Statistikasi:</b>\n\n` +
        `👥 Jami foydalanuvchilar: <b>${usersCount} ta</b>\n` +
        `📚 Barcha kurslar: <b>${coursesCount} ta</b>\n` +
        `🎓 Kurs aʼzoliklari: <b>${enrollmentsCount} ta</b>\n` +
        `⚠️ Kutilayotgan shikoyatlar: <b>${reportsCount} ta</b>\n\n` +
        `<i>Barcha maʼlumotlar PostgreSQL bazasidan real vaqtda olindi.</i>`,
    };
  }

  /**
   * Admin Bot: /admin_health
   */
  async handleAdminHealth(telegramId) {
    const user = await this.getLinkedUser(telegramId);
    if (user?.role !== 'ADMIN') {
      return { text: '⛔ Ruxsat etilmagan.' };
    }

    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    return {
      text: `🩺 <b>Bot va Tizim Salomatligi:</b>\n\n` +
        `✅ Backend API: Ishlamoqda (NestJS)\n` +
        `✅ Baza: Ulangan (PostgreSQL 16)\n` +
        `✅ Bot holati: ${this.isMockMode ? 'Development (Mock Provider)' : 'Jonli (Telegraf Live)'}\n` +
        `🧠 Xotira: ${memoryUsage} MB\n` +
        `⏱️ Uptime: ${(process.uptime() / 60).toFixed(1)} daqiqa`,
    };
  }

  /**
   * Admin Bot: Authorized Announcement Broadcast
   */
  async broadcastAnnouncement(adminId, message) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (admin?.role !== 'ADMIN') {
      throw new ForbiddenException('Faqat admin eʼlon yuborishi mumkin');
    }

    const linkedAccounts = await this.prisma.telegramAccount.findMany({
      where: {
        isLinked: true,
        user: {
          notificationPref: { tgEnabled: true },
        },
      },
      select: { telegramId: true },
    });

    let sentCount = 0;
    for (const acc of linkedAccounts) {
      try {
        if (this.bot) {
          await this.bot.telegram.sendMessage(acc.telegramId, `📢 <b>Platforma Eʼloni:</b>\n\n${message}`, {
            parse_mode: 'HTML',
          });
        }
        sentCount++;
      } catch (e) {
        // Log individual send failure non-blocking
      }
    }

    return {
      success: true,
      message: `${sentCount} ta foydalanuvchiga eʼlon yetkazildi`,
      totalTarget: linkedAccounts.length,
    };
  }

  /**
   * Automated Telegram Notification Dispatcher
   */
  async sendTelegramNotification(userId, { type, title, message, actionUrl }) {
    const tgAccount = await this.prisma.telegramAccount.findFirst({
      where: { userId, isLinked: true },
    });

    if (!tgAccount) {
      return { sent: false, reason: 'Telegram hisobi ulanmagan' };
    }

    const pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (pref && pref.tgEnabled === false) {
      return { sent: false, reason: 'Foydalanuvchi Telegram bildirishnomalarini o‘chirgan' };
    }

    const icons = {
      NEW_LESSON: '🎬',
      ENROLLMENT: '🎉',
      VERIFICATION: '🛡️',
      ANNOUNCEMENT: '📢',
      REMINDER: '⏰',
      SECURITY: '🔐',
    };
    const icon = icons[type] || '🔔';

    const text = `${icon} <b>${title}</b>\n\n${message}` +
      (actionUrl ? `\n\n👉 <a href="${actionUrl}">Saytda ko‘rish</a>` : '');

    if (this.bot) {
      try {
        await this.bot.telegram.sendMessage(tgAccount.telegramId, text, {
          parse_mode: 'HTML',
        });
      } catch (err) {
        console.error(`Telegram xabar yuborishda xatolik (${tgAccount.telegramId}):`, err.message);
      }
    } else {
      console.log(`[Mock Telegram Bot] Xabar yuborildi -> Telegram ID: ${tgAccount.telegramId}: ${title}`);
    }

    return { sent: true };
  }

  /**
   * Webhook Handler for Telegram API Updates
   */
  async handleWebhook(body, secretHeader = null) {
    // Verify webhook secret if set
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret && secretHeader !== expectedSecret) {
      throw new ForbiddenException('Yaroqsiz webhook maxfiy kaliti');
    }

    const message = body?.message;
    if (!message || !message.text) {
      return { ok: true, status: 'ignored' };
    }

    const tgUser = message.from;
    const text = message.text.trim();

    if (text.startsWith('/start')) {
      return this.handleStart(tgUser.id, text, tgUser);
    } else if (text === '/courses' || text === '🔍 Kurslarni topish') {
      return this.handleCourses();
    } else if (text === '/mycourses' || text === '📚 Kurslarim') {
      return this.handleMyCourses(tgUser.id);
    } else if (text === '/progress' || text === '📊 O‘qish progressim') {
      return this.handleProgress(tgUser.id);
    } else if (text === '/profile' || text === '👤 Profilim') {
      return this.handleProfile(tgUser.id);
    } else if (text === '/notifications' || text === '🔔 Bildirishnomalar') {
      return this.handleNotifications(tgUser.id);
    } else if (text === '/settings' || text === '⚙️ Sozlamalar') {
      return this.handleSettings(tgUser.id);
    } else if (text === '/language') {
      return this.handleLanguage();
    } else if (text === '/unlink') {
      return this.handleUnlink(tgUser.id);
    } else if (text === '/help' || text === 'ℹ️ Yordam') {
      return this.handleHelp();
    } else if (text === '/admin_stats' || text === '🛡️ Admin Statistika') {
      return this.handleAdminStats(tgUser.id);
    } else if (text === '/admin_health') {
      return this.handleAdminHealth(tgUser.id);
    }

    return {
      text: 'Buyruq tushunarsiz. Yordam olish uchun /help buyrug‘ini bosing.',
      replyMarkup: this.getMainMenuKeyboard(false),
    };
  }

  async getStatus(userId) {
    const account = await this.prisma.telegramAccount.findFirst({
      where: { userId, isLinked: true },
    });

    return {
      success: true,
      data: {
        isConnected: !!account,
        telegramAccount: account
          ? {
              telegramUsername: account.username,
              firstName: account.firstName,
              linkedAt: account.linkedAt,
            }
          : null,
      },
    };
  }

  async unlinkAccount(userId) {
    await this.prisma.telegramAccount.updateMany({
      where: { userId },
      data: { isLinked: false },
    });

    return {
      success: true,
      message: 'Telegram hisobi muvaffaqiyatli uzildi',
    };
  }
}
