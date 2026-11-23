import { Injectable, Dependencies } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class OptionalJwtAuthGuard {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || 'jwt-access-secret-key-talim-2026';

    try {
      const payload = jwt.verify(token, secret);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (user && user.status === 'ACTIVE') {
        request.user = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.profile?.fullName,
        };
      } else {
        request.user = null;
      }
    } catch (e) {
      request.user = null;
    }

    return true;
  }
}
