import { Injectable, BadRequestException, NotFoundException, Dependencies } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class EnrollmentsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async enroll(userId, courseId) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: true,
        lessons: {
          orderBy: { order: 'asc' },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const existing = await this.prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return {
        success: true,
        alreadyEnrolled: true,
        message: 'Siz ushbu kursga allaqachon a’zo bo‘lgansiz',
        data: existing,
      };
    }

    const enrollment = await this.prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
        progressPct: 0,
        status: 'ACTIVE',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    // Increment studentsCount on course
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        studentsCount: { increment: 1 },
      },
    });

    // Increment studentCount on teacher profile
    if (course.teacherId) {
      await this.prisma.teacherProfile.update({
        where: { id: course.teacherId },
        data: {
          studentCount: { increment: 1 },
        },
      }).catch(() => {});
    }

    return {
      success: true,
      alreadyEnrolled: false,
      message: 'Kursga muvaffaqiyatli a’zo bo‘ldingiz! Ta’limni boshlashingiz mumkin',
      data: {
        ...enrollment,
        firstLessonId: course.lessons[0]?.id || null,
      },
    };
  }

  async getMyEnrollments(userId) {
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    profile: { select: { fullName: true, avatarUrl: true } },
                  },
                },
              },
            },
            lessons: {
              orderBy: { order: 'asc' },
              select: { id: true, title: true, order: true },
            },
            _count: { select: { lessons: true } },
          },
        },
      },
    });

    // Fetch user lesson progresses to find the last unfinished lesson
    const progresses = await this.prisma.lessonProgress.findMany({
      where: { userId, isCompleted: true },
      select: { lessonId: true },
    });
    const completedLessonIds = new Set(progresses.map((p) => p.lessonId));

    return {
      success: true,
      data: enrollments.map((e) => {
        // Find next lesson to study
        const nextLesson = e.course.lessons.find((l) => !completedLessonIds.has(l.id)) || e.course.lessons[0];

        return {
          id: e.id,
          courseId: e.courseId,
          progressPct: e.progressPct,
          status: e.status,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
          course: {
            id: e.course.id,
            title: e.course.title,
            slug: e.course.slug,
            thumbnailUrl: e.course.thumbnailUrl,
            totalLessons: e.course.totalLessons || e.course._count.lessons,
            teacherName: e.course.teacher.user?.profile?.fullName || 'Ustoz',
            teacherAvatar: e.course.teacher.user?.profile?.avatarUrl,
            nextLessonId: nextLesson?.id || null,
            nextLessonTitle: nextLesson?.title || null,
          },
        };
      }),
    };
  }

  async checkEnrollment(userId, courseId) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          select: {
            lessons: {
              orderBy: { order: 'asc' },
              take: 1,
              select: { id: true },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: {
        isEnrolled: !!enrollment,
        enrollment: enrollment
          ? {
              id: enrollment.id,
              progressPct: enrollment.progressPct,
              status: enrollment.status,
              enrolledAt: enrollment.enrolledAt,
              completedAt: enrollment.completedAt,
              firstLessonId: enrollment.course.lessons[0]?.id || null,
            }
          : null,
      },
    };
  }
}
