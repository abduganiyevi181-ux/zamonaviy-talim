import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Dependencies,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class TeachersService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAll(query = {}) {
    const { page = 1, limit = 12, search } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      role: 'TEACHER',
      status: 'ACTIVE',
      ...(search && {
        OR: [
          { profile: { fullName: { contains: search, mode: 'insensitive' } } },
          { teacherProfile: { title: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, teachers] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          profile: true,
          teacherProfile: true,
          taughtCourses: {
            where: { isPublished: true },
            select: {
              id: true,
              title: true,
              slug: true,
              rating: true,
              studentsCount: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        teachers: teachers.map((t) => ({
          id: t.id,
          fullName: t.profile?.fullName,
          avatarUrl: t.profile?.avatarUrl,
          headline: t.profile?.headline,
          title: t.teacherProfile?.title,
          bio: t.teacherProfile?.bio || t.profile?.bio,
          skills: t.teacherProfile?.skills || [],
          experienceYears: t.teacherProfile?.experienceYears || 0,
          isVerified: t.teacherProfile?.isVerified || false,
          coursesCount: t.taughtCourses.length,
          courses: t.taughtCourses,
        })),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    };
  }

  async findById(id) {
    const teacher = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'TEACHER',
      },
      include: {
        profile: true,
        teacherProfile: true,
        taughtCourses: {
          where: { isPublished: true },
          include: {
            category: true,
            _count: { select: { lessons: true, enrollments: true } },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Ustoz topilmadi');
    }

    return {
      success: true,
      data: {
        id: teacher.id,
        fullName: teacher.profile?.fullName,
        avatarUrl: teacher.profile?.avatarUrl,
        headline: teacher.profile?.headline,
        title: teacher.teacherProfile?.title,
        bio: teacher.teacherProfile?.bio || teacher.profile?.bio,
        skills: teacher.teacherProfile?.skills || [],
        experienceYears: teacher.teacherProfile?.experienceYears || 0,
        isVerified: teacher.teacherProfile?.isVerified || false,
        websiteUrl: teacher.profile?.websiteUrl,
        githubUrl: teacher.profile?.githubUrl,
        linkedinUrl: teacher.profile?.linkedinUrl,
        courses: teacher.taughtCourses,
      },
    };
  }

  async getTeacherProfileOrProvision(userId) {
    let teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
        teacher = await this.prisma.teacherProfile.create({
          data: {
            userId,
            headline: user.profile?.headline || 'Senior Instruktor / Mentor',
            bio: user.profile?.bio || 'Professional amaliy taʼlim mentori.',
            specialty: 'Dasturlash va Zamonaviy Texnologiyalar',
            experienceYears: 3,
            isVerified: false,
          },
        });
      } else {
        throw new ForbiddenException('Ustoz paneliga faqat o‘qituvchilar kira oladi');
      }
    }

    return teacher;
  }

  async getTeacherDashboard(userId) {
    const teacher = await this.getTeacherProfileOrProvision(userId);

    const courses = await this.prisma.course.findMany({
      where: { teacherId: teacher.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { lessons: true, enrollments: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const courseIds = courses.map((c) => c.id);

    const totalStudents = courses.reduce((sum, c) => sum + (c._count.enrollments || 0), 0);
    const totalLessons = courses.reduce((sum, c) => sum + (c._count.lessons || 0), 0);
    const totalReviews = courses.reduce((sum, c) => sum + (c._count.reviews || 0), 0);
    const publishedCount = courses.filter((c) => c.status === 'PUBLISHED').length;
    const draftCount = courses.filter((c) => c.status === 'DRAFT').length;

    // Estimated revenue (sum of course price * enrollments)
    const estimatedEarnings = courses.reduce((sum, c) => {
      return sum + Number(c.price) * (c._count.enrollments || 0);
    }, 0);

    // Recent enrollments across teacher courses
    const recentEnrollments = await this.prisma.courseEnrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 6,
    });

    // Recent reviews
    const recentReviews = await this.prisma.review.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        user: { select: { profile: { select: { fullName: true, avatarUrl: true } } } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const latestVerification = await this.prisma.teacherVerification.findFirst({
      where: { teacherProfileId: teacher.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: {
        profile: {
          id: teacher.id,
          headline: teacher.headline,
          bio: teacher.bio,
          specialty: teacher.specialty,
          experienceYears: teacher.experienceYears,
          rating: teacher.rating,
          isVerified: teacher.isVerified,
        },
        stats: {
          totalCourses: courses.length,
          publishedCourses: publishedCount,
          draftCourses: draftCount,
          totalStudents,
          totalLessons,
          totalReviews,
          estimatedEarnings,
          averageRating: teacher.rating,
        },
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          status: c.status,
          price: Number(c.price),
          level: c.level,
          studentsCount: c._count.enrollments,
          lessonsCount: c._count.lessons,
          reviewsCount: c._count.reviews,
          categoryName: c.category?.name,
          createdAt: c.createdAt,
        })),
        recentEnrollments: recentEnrollments.map((e) => ({
          id: e.id,
          studentName: e.user.profile?.fullName || e.user.email || 'Talaba',
          studentAvatar: e.user.profile?.avatarUrl,
          courseTitle: e.course.title,
          courseSlug: e.course.slug,
          progressPct: e.progressPct,
          enrolledAt: e.enrolledAt,
        })),
        recentReviews: recentReviews.map((r) => ({
          id: r.id,
          studentName: r.user.profile?.fullName || 'Foydalanuvchi',
          studentAvatar: r.user.profile?.avatarUrl,
          courseTitle: r.course.title,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
        verification: latestVerification,
      },
    };
  }

  async getTeacherCourses(userId) {
    const teacher = await this.getTeacherProfileOrProvision(userId);

    const courses = await this.prisma.course.findMany({
      where: { teacherId: teacher.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { lessons: true, enrollments: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        subtitle: c.subtitle,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        status: c.status,
        price: Number(c.price),
        originalPrice: c.originalPrice ? Number(c.originalPrice) : null,
        discountPrice: c.discountPrice ? Number(c.discountPrice) : null,
        isFree: c.isFree,
        level: c.level,
        language: c.language,
        durationHours: c.durationHours,
        studentsCount: c._count.enrollments,
        lessonsCount: c._count.lessons,
        reviewsCount: c._count.reviews,
        category: c.category,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  }

  async getTeacherStudents(userId) {
    const teacher = await this.getTeacherProfileOrProvision(userId);

    const courses = await this.prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return {
      success: true,
      data: enrollments.map((e) => ({
        id: e.id,
        studentId: e.user.id,
        fullName: e.user.profile?.fullName || 'Nomaʼlum',
        email: e.user.email,
        phone: e.user.phone,
        avatarUrl: e.user.profile?.avatarUrl,
        courseTitle: e.course.title,
        courseSlug: e.course.slug,
        progressPct: e.progressPct,
        status: e.status,
        enrolledAt: e.enrolledAt,
      })),
    };
  }

  async getTeacherAnalytics(userId) {
    const teacher = await this.getTeacherProfileOrProvision(userId);

    const courses = await this.prisma.course.findMany({
      where: { teacherId: teacher.id },
      include: {
        _count: { select: { enrollments: true, reviews: true, lessons: true } },
      },
    });

    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const totalRevenue = courses.reduce(
      (sum, c) => sum + Number(c.price) * c._count.enrollments,
      0
    );

    return {
      success: true,
      data: {
        totalStudents,
        totalRevenue,
        averageRating: teacher.rating,
        totalCourses: courses.length,
        coursesPerformance: courses.map((c) => ({
          id: c.id,
          title: c.title,
          studentsCount: c._count.enrollments,
          revenue: Number(c.price) * c._count.enrollments,
          status: c.status,
        })),
      },
    };
  }

  async getTeacherReviews(userId) {
    const teacher = await this.getTeacherProfileOrProvision(userId);

    const courses = await this.prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    const reviews = await this.prisma.review.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        user: { select: { profile: { select: { fullName: true, avatarUrl: true } } } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        studentName: r.user.profile?.fullName || 'Foydalanuvchi',
        studentAvatar: r.user.profile?.avatarUrl,
        courseTitle: r.course.title,
      })),
    };
  }

  async getTeacherVerification(userId) {
    const teacher = await this.getTeacherProfileOrProvision(userId);

    const verifications = await this.prisma.teacherVerification.findMany({
      where: { teacherProfileId: teacher.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: {
        isVerified: teacher.isVerified,
        currentStatus: verifications[0]?.status || 'UNVERIFIED',
        latestRequest: verifications[0] || null,
        history: verifications,
      },
    };
  }

  async apply(userId, dto) {
    const { headline, title, bio, specialty, experienceYears = 1, documentUrl, certificateUrl, resumeUrl, idDocumentUrl } = dto;

    const teacherProfile = await this.prisma.teacherProfile.upsert({
      where: { userId },
      update: {
        headline: headline || title || 'Senior O‘qituvchi',
        bio: bio || 'Tajribali ustoz va instruktor.',
        specialty: specialty || 'Axborot Texnologiyalari',
        experienceYears: Number(experienceYears),
      },
      create: {
        userId,
        headline: headline || title || 'Senior O‘qituvchi',
        bio: bio || 'Tajribali ustoz va instruktor.',
        specialty: specialty || 'Axborot Texnologiyalari',
        experienceYears: Number(experienceYears),
        isVerified: false,
      },
    });

    // Create verification request
    const verification = await this.prisma.teacherVerification.create({
      data: {
        teacherProfileId: teacherProfile.id,
        documentUrl: documentUrl || idDocumentUrl || null,
        certificateUrl: certificateUrl || resumeUrl || null,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      message: 'Ustozlik arizangiz qabul qilindi va ko‘rib chiqilmoqda',
      data: {
        teacherProfile,
        verification,
      },
    };
  }

  async verifyTeacher(teacherProfileId, status, rejectionReason) {
    const verification = await this.prisma.teacherVerification.findFirst({
      where: { teacherProfileId },
      orderBy: { createdAt: 'desc' },
      include: { teacherProfile: true },
    });

    if (!verification) {
      throw new NotFoundException('Arizasi topilmadi');
    }

    const isApproved = status === 'APPROVED';

    await this.prisma.teacherVerification.update({
      where: { id: verification.id },
      data: {
        status,
        rejectionReason: isApproved ? null : rejectionReason,
        reviewedAt: new Date(),
      },
    });

    if (isApproved) {
      await this.prisma.teacherProfile.update({
        where: { id: teacherProfileId },
        data: { isVerified: true },
      });

      await this.prisma.user.update({
        where: { id: verification.teacherProfile.userId },
        data: { role: 'TEACHER' },
      });
    }

    return {
      success: true,
      message: isApproved ? 'Ustoz tasdiqlandi' : 'Ariza rad etildi',
    };
  }
}
