import { Injectable, NotFoundException, Dependencies } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class UsersService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getProfile(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        teacherProfile: true,
        notificationPref: true,
        _count: {
          select: {
            enrollments: true,
            favorites: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        profile: user.profile,
        teacherProfile: user.teacherProfile,
        notificationPref: user.notificationPref,
        stats: {
          enrollmentsCount: user._count.enrollments,
          favoritesCount: user._count.favorites,
          reviewsCount: user._count.reviews,
        },
        createdAt: user.createdAt,
      },
    };
  }

  async updateProfile(userId, dto) {
    const { fullName, headline, bio, avatarUrl, location, websiteUrl, githubUrl, linkedinUrl } = dto;

    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(fullName !== undefined && { fullName }),
        ...(headline !== undefined && { headline }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(location !== undefined && { location }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
      },
      create: {
        userId,
        fullName: fullName || 'Foydalanuvchi',
        headline,
        bio,
        avatarUrl,
        location,
        websiteUrl,
        githubUrl,
        linkedinUrl,
      },
    });

    return {
      success: true,
      message: 'Profil muvaffaqiyatli yangilandi',
      data: profile,
    };
  }

  async updateNotificationPreferences(userId, dto) {
    const { emailEnabled, smsEnabled, tgEnabled } = dto;

    const pref = await this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        ...(emailEnabled !== undefined && { emailEnabled }),
        ...(smsEnabled !== undefined && { smsEnabled }),
        ...(tgEnabled !== undefined && { tgEnabled }),
      },
      create: {
        userId,
        emailEnabled: emailEnabled ?? true,
        smsEnabled: smsEnabled ?? true,
        tgEnabled: tgEnabled ?? true,
      },
    });

    return {
      success: true,
      message: 'Bildirishnoma sozlamalari yangilandi',
      data: pref,
    };
  }

  async getUserById(id) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        teacherProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return {
      success: true,
      data: {
        id: user.id,
        role: user.role,
        profile: user.profile,
        teacherProfile: user.teacherProfile,
        createdAt: user.createdAt,
      },
    };
  }

  async getStudentDashboard(userId) {
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: { select: { name: true, slug: true } },
            teacher: {
              include: {
                user: { select: { profile: { select: { fullName: true, avatarUrl: true } } } },
              },
            },
            lessons: {
              orderBy: { order: 'asc' },
              select: { id: true, title: true, order: true, durationSec: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const completedCount = enrollments.filter(
      (e) => e.status === 'COMPLETED' || e.progressPct >= 100
    ).length;
    const activeCount = enrollments.filter(
      (e) => e.status === 'ACTIVE' && e.progressPct < 100
    ).length;

    // Completed lessons for total hours calculation
    const completedLessons = await this.prisma.lessonProgress.findMany({
      where: { userId, isCompleted: true },
      include: { lesson: { select: { durationSec: true } } },
    });
    const totalDurationSec = completedLessons.reduce(
      (sum, p) => sum + (p.lesson?.durationSec || 0),
      0
    );
    const totalHoursLearned = Number((totalDurationSec / 3600).toFixed(1));

    // Continue learning item
    const activeEnrollment =
      enrollments.find((e) => e.progressPct < 100) || enrollments[0] || null;

    // Recent notifications
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Favorites count
    const favoritesCount = await this.prisma.favorite.count({ where: { userId } });

    // Recent quiz attempts
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 4,
    });

    return {
      success: true,
      data: {
        stats: {
          enrolledCount: enrollments.length,
          activeCount,
          completedCount,
          totalHoursLearned,
          favoritesCount,
        },
        continueLearning: activeEnrollment
          ? {
              enrollmentId: activeEnrollment.id,
              courseId: activeEnrollment.courseId,
              courseTitle: activeEnrollment.course.title,
              courseSlug: activeEnrollment.course.slug,
              thumbnailUrl: activeEnrollment.course.thumbnailUrl,
              progressPct: activeEnrollment.progressPct,
              categoryName: activeEnrollment.course.category?.name,
              teacherName:
                activeEnrollment.course.teacher?.user?.profile?.fullName || 'Ustoz',
              totalLessons: activeEnrollment.course.lessons?.length || 0,
            }
          : null,
        enrollments: enrollments.map((e) => ({
          id: e.id,
          courseId: e.courseId,
          title: e.course.title,
          slug: e.course.slug,
          thumbnailUrl: e.course.thumbnailUrl,
          categoryName: e.course.category?.name,
          teacherName: e.course.teacher?.user?.profile?.fullName || 'Ustoz',
          progressPct: e.progressPct,
          status: e.status,
          enrolledAt: e.enrolledAt,
          updatedAt: e.updatedAt,
          totalLessons: e.course.lessons?.length || 0,
        })),
        recentNotifications: notifications,
        recentAttempts: attempts.map((a) => ({
          id: a.id,
          quizTitle: a.quiz.title,
          score: a.score,
          passed: a.passed,
          completedAt: a.completedAt,
        })),
      },
    };
  }

  async getFavorites(userId) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: { select: { name: true, slug: true } },
            teacher: {
              include: {
                user: { select: { profile: { select: { fullName: true, avatarUrl: true } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: favorites.map((f) => ({
        id: f.id,
        courseId: f.courseId,
        title: f.course.title,
        slug: f.course.slug,
        thumbnailUrl: f.course.thumbnailUrl,
        price: Number(f.course.price),
        rating: f.course.rating,
        studentsCount: f.course.studentsCount,
        level: f.course.level,
        categoryName: f.course.category?.name,
        teacherName: f.course.teacher?.user?.profile?.fullName || 'Ustoz',
        savedAt: f.createdAt,
      })),
    };
  }

  async toggleFavorite(userId, courseId) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return {
        success: true,
        message: 'Kurs sevimlilardan olib tashlandi',
        isFavorite: false,
      };
    }

    await this.prisma.favorite.create({
      data: { userId, courseId },
    });

    return {
      success: true,
      message: 'Kurs sevimlilarga qo‘shildi',
      isFavorite: true,
    };
  }
}
