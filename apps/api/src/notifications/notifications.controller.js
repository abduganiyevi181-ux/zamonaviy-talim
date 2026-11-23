import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Dependencies,
  Bind,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@Dependencies(NotificationsService)
export class NotificationsController {
  constructor(notificationsService) {
    this.notificationsService = notificationsService;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Query('unreadOnly'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchi bildirishnomalari' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Bildirishnomalar ro‘yxati' })
  async getUserNotifications(user, unreadOnly) {
    const isUnread = unreadOnly === 'true' || unreadOnly === true;
    return this.notificationsService.getUserNotifications(user.id, isUnread);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Param('id'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bitta bildirishnomani o‘qilgan deb belgilash' })
  @ApiResponse({ status: 200, description: 'Yangilandi' })
  async markAsRead(user, id) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barcha bildirishnomalarni o‘qilgan deb belgilash' })
  @ApiResponse({ status: 200, description: 'Barchasi o‘qildi' })
  async markAllAsRead(user) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
