import {
  Controller,
  Get,
  Put,
  Post,
  UseGuards,
  Dependencies,
  Bind,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@Dependencies(UsersService)
export class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }

  @Get('dashboard/overview')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Student shaxsiy dashboard ma’lumotlari' })
  @ApiResponse({ status: 200, description: 'Student dashboard statistikasi va kurslari' })
  async getStudentDashboard(user) {
    return this.usersService.getStudentDashboard(user.id);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchi sevimlilari ro‘yxati' })
  @ApiResponse({ status: 200, description: 'Sevimlilar ro‘yxati' })
  async getFavorites(user) {
    return this.usersService.getFavorites(user.id);
  }

  @Post('favorites/:courseId')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Param('courseId'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursni sevimlilarga qo‘shish yoki olib tashlash' })
  @ApiResponse({ status: 200, description: 'Sevimli holati o‘zgardi' })
  async toggleFavorite(user, courseId) {
    return this.usersService.toggleFavorite(user.id, courseId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy foydalanuvchi profilini olish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi profili ma’lumotlari' })
  async getMyProfile(user) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy foydalanuvchi profilini yangilash' })
  @ApiResponse({ status: 200, description: 'Profil yangilandi' })
  async updateMyProfile(user, body) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Put('me/preferences')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bildirishnoma sozlamalarini yangilash' })
  @ApiResponse({ status: 200, description: 'Sozlamalar saqlandi' })
  async updateMyPreferences(user, body) {
    return this.usersService.updateNotificationPreferences(user.id, body);
  }

  @Get(':id')
  @Bind(Param('id'))
  @ApiOperation({ summary: 'Foydalanuvchi ma’lumotlarini ID orqali ko‘rish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi ochiq profili' })
  async getUserById(id) {
    return this.usersService.getUserById(id);
  }
}
