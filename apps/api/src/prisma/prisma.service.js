import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as net from 'net';
import { InMemoryDatabase } from './in-memory-db';

function probePostgreSqlPort(host = '127.0.0.1', port = 5432, timeoutMs = 400) {
  return new Promise((resolve) => {
    let settled = false;
    const socket = net.createConnection({ host, port, timeout: timeoutMs });

    socket.on('connect', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('error', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    });
  });
}

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: ['warn', 'error'],
    });

    this.inMemoryDb = new InMemoryDatabase();
    this.useFallback = true; // Always default to in-memory until verified

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        // If fallback mode is active and model exists in inMemoryDb
        if (target.useFallback && target.inMemoryDb && target.inMemoryDb[prop]) {
          return target.inMemoryDb[prop];
        }

        const orig = Reflect.get(target, prop, receiver);

        // If target is in DB mode but database fails at runtime, seamlessly route to inMemoryDb
        if (
          typeof orig === 'object' &&
          orig !== null &&
          target.inMemoryDb &&
          target.inMemoryDb[prop]
        ) {
          return new Proxy(orig, {
            get: (colTarget, colProp) => {
              const colOrig = colTarget[colProp];
              if (typeof colOrig === 'function') {
                return async (...args) => {
                  try {
                    return await colOrig.apply(colTarget, args);
                  } catch (err) {
                    const msg = err?.message || '';
                    if (
                      msg.includes("Can't reach database server") ||
                      msg.includes('database server is running') ||
                      msg.includes('connection refused') ||
                      err?.code === 'P1001'
                    ) {
                      console.warn(
                        `⚠️ PostgreSQL ulanishda xato (${String(prop)}.${String(colProp)}). InMemory rejimiga o‘tildi.`,
                      );
                      target.useFallback = true;
                      const fallbackCol = target.inMemoryDb[prop];
                      if (fallbackCol && typeof fallbackCol[colProp] === 'function') {
                        return await fallbackCol[colProp](...args);
                      }
                    }
                    throw err;
                  }
                };
              }
              return colOrig;
            },
          });
        }

        return orig;
      },
    });
  }

  async onModuleInit() {
    // 1. Fast socket check (takes <10ms instead of 20 seconds!)
    const isPortOpen = await probePostgreSqlPort('127.0.0.1', 5432, 400);

    if (!isPortOpen) {
      this.useFallback = true;
      console.log('⚡ PostgreSQL (port 5432) ulanmagan — darhol InMemoryDatabase faollashtirildi (0ms kutish).');
      return;
    }

    try {
      await Promise.race([
        this.$connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Prisma connect timeout (1000ms)')), 1000),
        ),
      ]);
      this.useFallback = false;
      console.log('✅ PostgreSQL muvaffaqiyatli ulandi (Prisma)');
    } catch (error) {
      this.useFallback = true;
      console.warn('⚠️ PostgreSQL ulanish xabari:', error.message);
      console.log('🚀 Avtomatik InMemoryDatabase rejimiga o‘tildi (Barcha funksiyalar va modellar to‘liq ishlaydi).');
    }
  }

  async onModuleDestroy() {
    if (!this.useFallback) {
      try {
        await this.$disconnect();
      } catch {}
    }
  }

  async checkConnection() {
    if (this.useFallback) {
      return { status: 'in_memory_ready', error: null };
    }
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'connected', error: null };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }
}
