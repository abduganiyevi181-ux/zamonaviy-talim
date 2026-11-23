import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: () => null,
    });

    this.client.on('error', (err) => {
      // Background logging without crashing
    });
  }

  getClient() {
    return this.client;
  }

  async ping() {
    try {
      if (this.client.status !== 'ready' && this.client.status !== 'connecting') {
        await this.client.connect().catch(() => {});
      }
      const pong = await this.client.ping();
      return { status: 'connected', response: pong };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (e) {
        // Safe exit
      }
    }
  }
}
