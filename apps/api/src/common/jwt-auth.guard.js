import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Dependencies } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class JwtAuthGuard {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Kirish huquqi mavjud emas (Token topilmadi)');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || 'jwt-access-secret-key-talim-2026';

    try {
      const payload = jwt.verify(token, secret);
      // Fetch user to confirm active status
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Foydalanuvchi hisobi bloklangan yoki mavjud emas');
      }

      request.user = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.profile?.fullName,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Yaroqsiz yoki muddati o‘tgan token');
    }
  }
}
