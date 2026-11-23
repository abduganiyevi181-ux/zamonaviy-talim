import {
  Controller,
  Post,
  Get,
  UseGuards,
  Dependencies,
  HttpCode,
  HttpStatus,
  Bind,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
@Dependencies(AuthService)
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @Post('register')
  @Bind(Body())
  @ApiOperation({ summary: 'Yangi foydalanuvchini ro‘yxatdan o‘tkazish (Email yoki Telefon)' })
  @ApiResponse({ status: 201, description: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi' })
  @ApiResponse({ status: 400, description: 'Noto‘g‘ri ma’lumotlar yoki hisob mavjud' })
  async register(body) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Bind(Body())
  @ApiOperation({ summary: 'Parol orqali tizimga kirish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirildi va JWT tokenlar qaytarildi' })
  @ApiResponse({ status: 401, description: 'Login yoki parol noto‘g‘ri' })
  async login(body) {
    return this.authService.loginWithPassword(body);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @Bind(Body())
  @ApiOperation({ summary: '6-raqamli bir martalik OTP kod yuborish (Email yoki SMS)' })
  @ApiResponse({ status: 200, description: 'OTP kod yuborildi' })
  async sendOtp(body = {}) {
    const identifier =
      body.emailOrPhone || body.target || body.phone || body.email || '';
    return this.authService.sendLoginOtp(identifier);
  }

  @Post('login-otp')
  @HttpCode(HttpStatus.OK)
  @Bind(Body())
  @ApiOperation({ summary: 'Bir martalik OTP kod orqali tizimga kirish' })
  @ApiResponse({ status: 200, description: 'OTP tasdiqlandi va JWT tokenlar berildi' })
  async loginOtp(body) {
    return this.authService.loginWithOtp(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Bind(Body())
  @ApiOperation({ summary: 'Yangi Access va Refresh tokenlarni olish (Token rotation)' })
  @ApiResponse({ status: 200, description: 'Tokenlar yangilandi' })
  @ApiResponse({ status: 401, description: 'Refresh token eskirgan yoki bekor qilingan' })
  async refresh(body) {
    const { refreshToken } = body;
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tizimdan chiqish va sessiyalarni bekor qilish' })
  @ApiResponse({ status: 200, description: 'Sessiya yakunlandi' })
  async logout(user) {
    return this.authService.logout(user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Bind(Body())
  @ApiOperation({ summary: 'Parolni tiklash uchun OTP so‘rash' })
  @ApiResponse({ status: 200, description: 'Agar hisob mavjud bo‘lsa, kod yuborildi' })
  async forgotPassword(body) {
    const { emailOrPhone } = body;
    return this.authService.requestPasswordReset(emailOrPhone);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Bind(Body())
  @ApiOperation({ summary: 'OTP orqali parolni yangilash' })
  @ApiResponse({ status: 200, description: 'Parol muvaffaqiyatli yangilandi' })
  async resetPassword(body) {
    return this.authService.resetPassword(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy tizimga kirgan foydalanuvchi ma’lumotlari' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi profili' })
  async getMe(user) {
    return {
      success: true,
      data: user,
    };
  }
}
