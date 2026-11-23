import { Injectable, Dependencies } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
@Dependencies(PrismaService, RedisService)
export class HealthService {
  constructor(prisma, redis) {
    this.prisma = prisma;
    this.redis = redis;
  }

  async checkHealth() {
    const dbStatus = await this.prisma.checkConnection();
    const redisStatus = await this.redis.checkConnection();

    const isHealthy = dbStatus.status === 'connected';

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
