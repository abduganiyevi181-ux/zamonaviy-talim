import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Dependencies,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class CoursesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAll(query = {}) {
    const {
      search,
      categoryId,
      level,
      language,
      isFree,
      minPrice,
      maxPrice,
      teacherId,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build Prisma filter conditions
    const where = {
      status: 'PUBLISHED',
      ...(categoryId && { categoryId }),
      ...(teacherId && { teacherId }),
      ...(level && { level: { equals: level, mode: 'insensitive' } }),
      ...(language && { language: { equals: language, mode: 'insensitive' } }),
      ...(isFree !== undefined && { isFree: isFree === 'true' || isFree === true }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: Number(minPrice) }),
              ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Valid sorting fields
    const validSortFields = ['createdAt', 'price', 'rating', 'studentsCount', 'title'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, courses] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { [actualSortBy]: actualSortOrder },
        include: {
          category: {
            select: { id: true, name: true, slug: true, iconName: true },
          },
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  profile: {
                    select: { fullName: true, avatarUrl: true, headline: true },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              lessons: true,
              materials: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          subtitle: c.subtitle,
          description: c.description,
          thumbnailUrl: c.thumbnailUrl,
          price: Number(c.price),
          originalPrice: c.originalPrice ? Number(c.originalPrice) : null,
          discountPrice: c.discountPrice ? Number(c.discountPrice) : null,
          isFree: c.isFree,
          level: c.level,
          language: c.language,
          durationHours: c.durationHours,
          totalLessons: c.totalLessons || c._count.lessons,
          rating: c.rating,
          reviewCount: c.reviewCount || c._count.reviews,
          studentsCount: c.studentsCount || c._count.enrollments,
          category: c.category,
          teacher: {
            id: c.teacher.id,
            userId: c.teacher.userId,
            fullName: c.teacher.user?.profile?.fullName || 'Ustoz',
            avatarUrl: c.teacher.user?.profile?.avatarUrl,
            headline: c.teacher.headline || c.teacher.user?.profile?.headline,
            rating: c.teacher.rating,
          },
          materialsCount: c._count.materials,
          createdAt: c.createdAt,
        })),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)) || 1,
        },
      },
    };
  }

  async findBySlug(slug, userId = null) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        category: true,
        teacher: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            durationSec: true,
            moduleTitle: true,
            order: true,
            isFree: true,
            quiz: {
              select: { id: true, title: true, passingScore: true },
            },
            _count: {
              select: { materials: true },
            },
          },
        },
        materials: {
          select: {
            id: true,
            title: true,
            fileUrl: true,
            fileSize: true,
            fileType: true,
            lessonId: true,
          },
        },
        reviews: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: { fullName: true, avatarUrl: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            lessons: true,
            materials: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Check enrollment for current user
    let userEnrollment = null;
    if (userId) {
      userEnrollment = await this.prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });
    }

    // Group curriculum by module
    const modulesMap = new Map();
    course.lessons.forEach((lesson) => {
      const moduleName = lesson.moduleTitle || '1-Modul';
      if (!modulesMap.has(moduleName)) {
        modulesMap.set(moduleName, []);
      }
      modulesMap.get(moduleName).push(lesson);
    });

    const curriculum = Array.from(modulesMap.entries()).map(([moduleTitle, lessons]) => ({
      moduleTitle,
      lessonsCount: lessons.length,
      durationSec: lessons.reduce((sum, l) => sum + (l.durationSec || 0), 0),
      lessons,
    }));

    return {
      success: true,
      data: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        videoPreviewUrl: course.videoPreviewUrl,
        price: Number(course.price),
        originalPrice: course.originalPrice ? Number(course.originalPrice) : null,
        discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
        isFree: course.isFree,
        level: course.level,
        language: course.language,
        durationHours: course.durationHours,
        totalLessons: course.totalLessons || course._count.lessons,
        rating: course.rating,
        reviewCount: course.reviewCount || course._count.reviews,
        studentsCount: course.studentsCount || course._count.enrollments,
        status: course.status,
        category: course.category,
        teacher: {
          id: course.teacher.id,
          userId: course.teacher.userId,
          fullName: course.teacher.user?.profile?.fullName || 'Ustoz',
          avatarUrl: course.teacher.user?.profile?.avatarUrl,
          headline: course.teacher.headline || course.teacher.user?.profile?.headline,
          bio: course.teacher.bio || course.teacher.user?.profile?.bio,
          rating: course.teacher.rating,
          reviewCount: course.teacher.reviewCount,
          studentCount: course.teacher.studentCount,
          experienceYears: course.teacher.experienceYears,
          specialty: course.teacher.specialty,
        },
        curriculum,
        materials: userEnrollment ? course.materials : course.materials.map((m) => ({ ...m, fileUrl: null, isLocked: true })),
        materialsCount: course._count.materials,
        reviews: course.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: {
            fullName: r.user.profile?.fullName || 'Foydalanuvchi',
            avatarUrl: r.user.profile?.avatarUrl,
          },
        })),
        isEnrolled: !!userEnrollment,
        enrollment: userEnrollment
          ? {
              id: userEnrollment.id,
              progressPct: userEnrollment.progressPct,
              status: userEnrollment.status,
              enrolledAt: userEnrollment.enrolledAt,
              completedAt: userEnrollment.completedAt,
            }
          : null,
      },
    };
  }

  async create(userId, userRole, dto) {
    const {
      title,
      slug,
      subtitle,
      description,
      categoryId,
      price = 0,
      originalPrice,
      discountPrice,
      isFree = false,
      level = 'Boshlang\'ich',
      language = 'uz',
      thumbnailUrl,
      videoPreviewUrl,
      durationHours = 0,
    } = dto;

    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher && userRole !== 'ADMIN') {
      throw new ForbiddenException('Kurs yaratish uchun ustoz profili mavjud bo‘lishi kerak');
    }

    const teacherId = teacher ? teacher.id : dto.teacherId;
    if (!teacherId) {
      throw new BadRequestException('Ustoz ko‘rsatilishi shart');
    }

    const existingSlug = await this.prisma.course.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new BadRequestException('Bu slug bilan kurs allaqachon mavjud');
    }

    const course = await this.prisma.course.create({
      data: {
        title,
        slug,
        subtitle,
        description,
        categoryId,
        teacherId,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        isFree: Boolean(isFree),
        level,
        language,
        thumbnailUrl,
        videoPreviewUrl,
        durationHours: Number(durationHours),
        status: 'DRAFT',
      },
    });

    return {
      success: true,
      message: 'Kurs muvaffaqiyatli yaratildi',
      data: course,
    };
  }

  async update(id, userId, userRole, dto) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    if (course.teacher.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Sizda ushbu kursni tahrirlash huquqi yo‘q');
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.price !== undefined && { price: Number(dto.price) }),
        ...(dto.originalPrice !== undefined && { originalPrice: Number(dto.originalPrice) }),
        ...(dto.discountPrice !== undefined && { discountPrice: Number(dto.discountPrice) }),
        ...(dto.durationHours !== undefined && { durationHours: Number(dto.durationHours) }),
      },
    });

    return {
      success: true,
      message: 'Kurs muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  async togglePublish(id, userId, userRole, isPublished) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    if (course.teacher.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Sizda ushbu kurs holatini o‘zgartirish huquqi yo‘q');
    }

    const status = isPublished ? 'PUBLISHED' : 'DRAFT';
    const updated = await this.prisma.course.update({
      where: { id },
      data: { status },
    });

    return {
      success: true,
      message: isPublished ? 'Kurs chop etildi' : 'Kurs qoralama rejimiga o‘tkazildi',
      data: updated,
    };
  }
}
