import { Injectable, Dependencies } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { createApiResponse, USER_ROLES } from '@project/shared';

@Injectable()
@Dependencies(PrismaService, RedisService)
export class AppService {
  constructor(prismaService, redisService) {
    this.prisma = prismaService;
    this.redis = redisService;
  }

  getHello() {
    return createApiResponse(
      {
        roles: Object.values(USER_ROLES),
        framework: 'NestJS (JavaScript Mode)',
        version: '1.0.0',
      },
      "Zamonaviy Ta'lim Dizayni API ishlab turibdi!",
    );
  }

  async getHealth() {
    const dbStatus = await this.prisma.checkConnection();
    const redisStatus = await this.redis.ping();

    return createApiResponse({
      server: 'healthy',
      database: dbStatus,
      redis: redisStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}
