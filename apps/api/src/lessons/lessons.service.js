import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Dependencies,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class LessonsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getLessonsByCourse(courseId, userId = null) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { teacher: true },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    let isEnrolledOrTeacher = false;
    if (userId) {
      if (course.teacher.userId === userId) {
        isEnrolledOrTeacher = true;
      } else {
        const enrollment = await this.prisma.courseEnrollment.findUnique({
          where: { userId_courseId: { userId, courseId } },
        });
        isEnrolledOrTeacher = !!enrollment;
      }
    }

    // Get user progress if logged in
    let completedLessonIds = new Set();
    if (userId) {
      const userProgress = await this.prisma.lessonProgress.findMany({
        where: {
          userId,
          isCompleted: true,
          lesson: { courseId },
        },
        select: { lessonId: true },
      });
      completedLessonIds = new Set(userProgress.map((p) => p.lessonId));
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        materials: true,
        quiz: {
          select: { id: true, title: true, passingScore: true },
        },
      },
    });

    return {
      success: true,
      data: lessons.map((l) => {
        const hasAccess = isEnrolledOrTeacher || l.isFree;
        return {
          id: l.id,
          title: l.title,
          description: l.description,
          durationSec: l.durationSec,
          moduleTitle: l.moduleTitle,
          order: l.order,
          isFree: l.isFree,
          isCompleted: completedLessonIds.has(l.id),
          isLocked: !hasAccess,
          videoUrl: hasAccess ? l.videoUrl : null,
          content: hasAccess ? l.content : null,
          materials: hasAccess ? l.materials : l.materials.map((m) => ({ ...m, fileUrl: null })),
          quiz: l.quiz,
        };
      }),
    };
  }

  async getLessonById(id, userId = null) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            teacher: true,
          },
        },
        materials: true,
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            passingScore: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    let canAccess = lesson.isFree;
    let isEnrolled = false;
    if (userId) {
      if (lesson.course.teacher.userId === userId) {
        canAccess = true;
        isEnrolled = true;
      } else {
        const enrollment = await this.prisma.courseEnrollment.findUnique({
          where: { userId_courseId: { userId, courseId: lesson.courseId } },
        });
        if (enrollment) {
          canAccess = true;
          isEnrolled = true;
        }
      }
    }

    if (!canAccess) {
      throw new ForbiddenException('Ushbu darsni ko‘rish uchun kursga a’zo bo‘lishingiz kerak');
    }

    // Get previous and next lessons in this course
    const allCourseLessons = await this.prisma.lesson.findMany({
      where: { courseId: lesson.courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
        moduleTitle: true,
        isFree: true,
      },
    });

    const currentIndex = allCourseLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? allCourseLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allCourseLessons.length - 1 ? allCourseLessons[currentIndex + 1] : null;

    // Get progress for this user
    let progress = null;
    if (userId) {
      progress = await this.prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: { userId, lessonId: lesson.id },
        },
      });
    }

    return {
      success: true,
      data: {
        id: lesson.id,
        courseId: lesson.courseId,
        courseTitle: lesson.course.title,
        courseSlug: lesson.course.slug,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        durationSec: lesson.durationSec,
        moduleTitle: lesson.moduleTitle,
        order: lesson.order,
        isFree: lesson.isFree,
        materials: lesson.materials,
        quiz: lesson.quiz,
        isCompleted: progress?.isCompleted || false,
        lastPositionSeconds: progress?.lastPositionSeconds || 0,
        navigation: {
          prevLesson: prevLesson ? { id: prevLesson.id, title: prevLesson.title, order: prevLesson.order } : null,
          nextLesson: nextLesson ? { id: nextLesson.id, title: nextLesson.title, order: nextLesson.order } : null,
          allLessons: allCourseLessons,
        },
      },
    };
  }

  async create(userId, userRole, dto) {
    const {
      courseId,
      title,
      description,
      content,
      videoUrl,
      durationSec = 0,
      moduleTitle = '1-Modul',
      order = 1,
      isFree = false,
    } = dto;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { teacher: true },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    if (course.teacher.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Faqat kurs muallifi yoki admin dars qo‘sha oladi');
    }

    const lesson = await this.prisma.lesson.create({
      data: {
        courseId,
        title,
        description,
        content,
        videoUrl,
        durationSec: Number(durationSec),
        moduleTitle,
        order: Number(order),
        isFree: Boolean(isFree),
      },
    });

    // Update totalLessons on course
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        totalLessons: { increment: 1 },
      },
    });

    return {
      success: true,
      message: 'Dars muvaffaqiyatli qo‘shildi',
      data: lesson,
    };
  }

  async update(id, userId, userRole, dto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { course: { include: { teacher: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (lesson.course.teacher.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Darsni o‘zgartirish huquqingiz yo‘q');
    }

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.durationSec !== undefined && { durationSec: Number(dto.durationSec) }),
        ...(dto.order !== undefined && { order: Number(dto.order) }),
        ...(dto.isFree !== undefined && { isFree: Boolean(dto.isFree) }),
      },
    });

    return {
      success: true,
      message: 'Dars yangilandi',
      data: updated,
    };
  }

  async remove(id, userId, userRole) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { course: { include: { teacher: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (lesson.course.teacher.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Darsni o‘chirish huquqingiz yo‘q');
    }

    await this.prisma.lesson.delete({ where: { id } });

    // Decrement totalLessons on course
    await this.prisma.course.update({
      where: { id: lesson.courseId },
      data: {
        totalLessons: { decrement: 1 },
      },
    });

    return {
      success: true,
      message: 'Dars o‘chirildi',
    };
  }
}
