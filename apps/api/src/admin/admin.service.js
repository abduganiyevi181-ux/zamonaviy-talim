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
export class AdminService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * 1. Real Database Dashboard Metrics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      pendingVerifications,
      totalReports,
      pendingReports,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.course.count({ where: { status: 'DRAFT' } }),
      this.prisma.courseEnrollment.count(),
      this.prisma.teacherVerification.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalCourses,
          publishedCourses,
          draftCourses,
          totalEnrollments,
          pendingApprovals: pendingVerifications,
          totalReports,
          pendingReports,
        },
        recentActivity: recentAuditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          entity: log.entity,
          entityId: log.entityId,
          details: log.details,
          userName: log.user?.profile?.fullName || log.user?.email || 'Tizim',
          createdAt: log.createdAt,
        })),
      },
    };
  }

  /**
   * 2. User Management
   */
  async getUsersList(query = {}) {
    const { page = 1, limit = 20, role, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { profile: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          teacherProfile: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          fullName: u.profile?.fullName || 'Nomaʼlum',
          avatarUrl: u.profile?.avatarUrl,
          enrollmentsCount: u._count.enrollments,
          isVerified: u.teacherProfile?.isVerified || false,
          createdAt: u.createdAt,
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

  async getUserDetails(id) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        teacherProfile: true,
        enrollments: {
          include: { course: { select: { id: true, title: true, slug: true } } },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return {
      success: true,
      data: user,
    };
  }

  async updateUserStatus(adminId, userId, status) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await this.logAction(adminId, 'UPDATE_STATUS', 'User', userId, {
      oldStatus: user.status,
      newStatus: status,
    });

    return {
      success: true,
      message: `Foydalanuvchi holati ${status} ga o‘zgartirildi`,
      data: updated,
    };
  }

  async updateUserRole(adminId, userId, role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // If upgraded to TEACHER, ensure teacherProfile exists
    if (role === 'TEACHER') {
      await this.prisma.teacherProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          headline: 'Instruktor',
          bio: 'Tajribali ustoz.',
          specialty: 'Umumiy',
          experienceYears: 1,
        },
      });
    }

    await this.logAction(adminId, 'UPDATE_ROLE', 'User', userId, {
      oldRole: user.role,
      newRole: role,
    });

    return {
      success: true,
      message: `Foydalanuvchi roli ${role} ga o‘zgartirildi`,
      data: updated,
    };
  }

  /**
   * 3. Course Management & Moderation
   */
  async getCoursesList(query = {}) {
    const { page = 1, limit = 20, status, categoryId, search } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, courses] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          teacher: {
            include: {
              user: {
                select: {
                  email: true,
                  profile: { select: { fullName: true } },
                },
              },
            },
          },
          _count: {
            select: { lessons: true, enrollments: true },
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
          status: c.status,
          price: Number(c.price),
          level: c.level,
          categoryName: c.category?.name,
          teacherName: c.teacher?.user?.profile?.fullName || c.teacher?.user?.email || 'Ustoz',
          lessonsCount: c._count.lessons,
          studentsCount: c._count.enrollments,
          createdAt: c.createdAt,
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

  async updateCourseStatus(adminId, courseId, status) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: { status },
    });

    await this.logAction(adminId, 'UPDATE_COURSE_STATUS', 'Course', courseId, {
      oldStatus: course.status,
      newStatus: status,
    });

    return {
      success: true,
      message: `Kurs holati ${status} ga o‘zgartirildi`,
      data: updated,
    };
  }

  /**
   * 4. Teacher Verification Management
   */
  async getTeacherVerifications(query = {}) {
    const { status = 'PENDING' } = query;
    const where = status !== 'ALL' ? { status } : {};

    const verifications = await this.prisma.teacherVerification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        teacherProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                profile: { select: { fullName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: verifications.map((v) => ({
        id: v.id,
        teacherProfileId: v.teacherProfileId,
        userId: v.teacherProfile.userId,
        fullName: v.teacherProfile.user?.profile?.fullName || 'Nomaʼlum',
        email: v.teacherProfile.user?.email,
        phone: v.teacherProfile.user?.phone,
        headline: v.teacherProfile.headline,
        specialty: v.teacherProfile.specialty,
        experienceYears: v.teacherProfile.experienceYears,
        documentUrl: v.documentUrl,
        certificateUrl: v.certificateUrl,
        status: v.status,
        adminNote: v.adminNote,
        createdAt: v.createdAt,
      })),
    };
  }

  async reviewTeacherVerification(adminId, verificationId, { status, adminNote }) {
    const verification = await this.prisma.teacherVerification.findUnique({
      where: { id: verificationId },
      include: { teacherProfile: true },
    });

    if (!verification) {
      throw new NotFoundException('Verifikatsiya arizasi topilmadi');
    }

    const isApproved = status === 'APPROVED';

    const updated = await this.prisma.teacherVerification.update({
      where: { id: verificationId },
      data: {
        status,
        adminNote: adminNote || null,
        verifiedAt: isApproved ? new Date() : null,
      },
    });

    if (isApproved) {
      // Mark teacherProfile verified
      await this.prisma.teacherProfile.update({
        where: { id: verification.teacherProfileId },
        data: { isVerified: true },
      });
      // Update user role to TEACHER
      await this.prisma.user.update({
        where: { id: verification.teacherProfile.userId },
        data: { role: 'TEACHER' },
      });
    }

    await this.logAction(adminId, 'REVIEW_VERIFICATION', 'TeacherVerification', verificationId, {
      status,
      adminNote,
    });

    return {
      success: true,
      message: isApproved ? 'Ustoz muvaffaqiyatli tasdiqlandi' : 'Ariza rad etildi',
      data: updated,
    };
  }

  /**
   * 5. Categories Management
   */
  async getCategories() {
    const categories = await this.prisma.courseCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { courses: true } },
      },
    });

    return {
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        iconName: c.iconName,
        coursesCount: c._count.courses,
        sortOrder: c.sortOrder,
      })),
    };
  }

  async createCategory(adminId, dto) {
    const { name, slug, description, iconName = 'Grid', sortOrder = 0 } = dto;

    const existing = await this.prisma.courseCategory.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      throw new BadRequestException('Bu nom yoki slug bilan kategoriya allaqachon mavjud');
    }

    const category = await this.prisma.courseCategory.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        iconName,
        sortOrder: Number(sortOrder),
      },
    });

    await this.logAction(adminId, 'CREATE_CATEGORY', 'CourseCategory', category.id, { name });

    return {
      success: true,
      message: 'Kategoriya muvaffaqiyatli yaratildi',
      data: category,
    };
  }

  /**
   * 6. Reports Management
   */
  async getReportsList(query = {}) {
    const { status = 'PENDING' } = query;
    const where = status !== 'ALL' ? { status } : {};

    const reports = await this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    return {
      success: true,
      data: reports.map((r) => ({
        id: r.id,
        entityType: r.entityType,
        entityId: r.entityId,
        reason: r.reason,
        status: r.status,
        adminNotes: r.adminNotes,
        reporterName: r.reporter?.profile?.fullName || r.reporter?.email || 'Foydalanuvchi',
        createdAt: r.createdAt,
      })),
    };
  }

  async updateReportStatus(adminId, reportId, { status, adminNotes }) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Shikoyat topilmadi');
    }

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes: adminNotes || report.adminNotes,
      },
    });

    await this.logAction(adminId, 'UPDATE_REPORT', 'Report', reportId, { status, adminNotes });

    return {
      success: true,
      message: 'Shikoyat holati yangilandi',
      data: updated,
    };
  }

  /**
   * 7. Audit Logs
   */
  async getAuditLogs(query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        logs: logs.map((l) => ({
          id: l.id,
          action: l.action,
          entity: l.entity,
          entityId: l.entityId,
          details: l.details,
          userName: l.user?.profile?.fullName || l.user?.email || 'Tizim',
          createdAt: l.createdAt,
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

  async logAction(userId, action, entity, entityId, details) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details: typeof details === 'object' ? JSON.stringify(details) : details,
        },
      });
    } catch (e) {
      // Non-blocking log
    }
  }
}
