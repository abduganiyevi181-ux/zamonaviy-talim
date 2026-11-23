import { Injectable, NotFoundException, Dependencies } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class NotificationsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getUserNotifications(userId, unreadOnly = false) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    };
  }

  async markAsRead(userId, id) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Bildirishnoma topilmadi');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async markAllAsRead(userId) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      success: true,
      message: 'Barcha bildirishnomalar o‘qilgan deb belgilandi',
    };
  }

  async create(userId, data) {
    return this.prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type || 'SYSTEM',
        actionUrl: data.actionUrl || null,
        isRead: false,
      },
    });
  }
}
