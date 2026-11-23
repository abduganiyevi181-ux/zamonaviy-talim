import { Injectable, NotFoundException, BadRequestException, Dependencies } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class CategoriesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAll() {
    const categories = await this.prisma.courseCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    return {
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        sortOrder: c.sortOrder,
        courseCount: c._count.courses,
      })),
    };
  }

  async findBySlug(slug) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { slug },
      include: {
        courses: {
          where: { isPublished: true },
          include: {
            instructor: {
              include: { profile: true },
            },
          },
        },
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    return {
      success: true,
      data: category,
    };
  }

  async create(dto) {
    const { name, slug, description, icon, sortOrder } = dto;

    const existing = await this.prisma.courseCategory.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Ushbu slug bilan kategoriya allaqachon mavjud');
    }

    const category = await this.prisma.courseCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        sortOrder: sortOrder || 0,
      },
    });

    return {
      success: true,
      message: 'Kategoriya muvaffaqiyatli yaratildi',
      data: category,
    };
  }

  async update(id, dto) {
    const category = await this.prisma.courseCategory.update({
      where: { id },
      data: dto,
    });

    return {
      success: true,
      message: 'Kategoriya yangilandi',
      data: category,
    };
  }

  async remove(id) {
    await this.prisma.courseCategory.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Kategoriya o‘chirildi',
    };
  }
}
