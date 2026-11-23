import { Injectable, NotFoundException, Dependencies } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class ProgressService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async updateLessonProgress(userId, lessonId, dto) {
    const { isCompleted = true, lastPositionSeconds = 0 } = dto;

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    const progress = await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        isCompleted: Boolean(isCompleted),
        lastPositionSeconds: Number(lastPositionSeconds) || 0,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        isCompleted: Boolean(isCompleted),
        lastPositionSeconds: Number(lastPositionSeconds) || 0,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Recalculate course completion percentage
    await this.recalculateCourseProgress(userId, lesson.courseId);

    return {
      success: true,
      message: isCompleted
        ? 'Dars muvaffaqiyatli tugatildi'
        : 'Dars ko‘rish vaqti saqlandi',
      data: progress,
    };
  }

  async getCourseProgress(userId, courseId) {
    const [lessons, completedProgresses] = await Promise.all([
      this.prisma.lesson.findMany({
        where: { courseId },
        select: { id: true, title: true, order: true, moduleTitle: true },
        orderBy: { order: 'asc' },
      }),
      this.prisma.lessonProgress.findMany({
        where: {
          userId,
          lesson: { courseId },
        },
      }),
    ]);

    const progressMap = new Map();
    completedProgresses.forEach((p) => {
      progressMap.set(p.lessonId, p);
    });

    const totalLessons = lessons.length;
    const completedCount = completedProgresses.filter((p) => p.isCompleted).length;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      success: true,
      data: {
        totalLessons,
        completedCount,
        progressPct,
        lessons: lessons.map((l) => ({
          lessonId: l.id,
          title: l.title,
          order: l.order,
          moduleTitle: l.moduleTitle,
          isCompleted: progressMap.get(l.id)?.isCompleted || false,
          lastPositionSeconds: progressMap.get(l.id)?.lastPositionSeconds || 0,
          completedAt: progressMap.get(l.id)?.completedAt || null,
        })),
      },
    };
  }

  async recalculateCourseProgress(userId, courseId) {
    const totalLessons = await this.prisma.lesson.count({
      where: { courseId },
    });

    if (totalLessons === 0) return;

    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        userId,
        isCompleted: true,
        lesson: { courseId },
      },
    });

    const progressPct = Math.round((completedLessons / totalLessons) * 100);
    const isCompleted = progressPct >= 100;

    await this.prisma.courseEnrollment.updateMany({
      where: { userId, courseId },
      data: {
        progressPct,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }
}
