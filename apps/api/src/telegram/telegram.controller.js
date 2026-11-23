import {
  Controller,
  Get,
  Post,
  Delete,
  Headers,
  UseGuards,
  Dependencies,
  Bind,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Telegram')
@Controller('telegram')
@Dependencies(TelegramService)
export class TelegramController {
  constructor(telegramService) {
    this.telegramService = telegramService;
  }

  @Post('link-token')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Telegram bot bilan hisobni ulash uchun bir martalik link token olish' })
  @ApiResponse({ status: 201, description: 'Token va havola yaratildi' })
  async generateLinkToken(user) {
    return this.telegramService.generateLinkToken(user.id);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Telegram ulanish holatini tekshirish' })
  @ApiResponse({ status: 200, description: 'Telegram ulanish holati' })
  async getStatus(user) {
    return this.telegramService.getStatus(user.id);
  }

  @Delete('unlink')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Telegram hisobini uzish' })
  @ApiResponse({ status: 200, description: 'Telegram hisobi uzildi' })
  async unlinkAccount(user) {
    return this.telegramService.unlinkAccount(user.id);
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Bind(CurrentUser(), Body('message'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tomonidan barcha Telegram foydalanuvchilariga eʼlon yuborish' })
  @ApiResponse({ status: 200, description: 'Eʼlon yuborildi' })
  async broadcastAnnouncement(admin, message) {
    return this.telegramService.broadcastAnnouncement(admin.id, message);
  }

  @Post('webhook')
  @Bind(Body(), Headers('x-telegram-bot-api-secret-token'))
  @ApiOperation({ summary: 'Telegram Bot API webhook qabul qiluvchisi' })
  async handleWebhook(body, secretHeader) {
    return this.telegramService.handleWebhook(body, secretHeader);
  }
}
