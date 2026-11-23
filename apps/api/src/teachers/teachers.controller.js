import {
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Dependencies,
  Bind,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Teachers')
@Controller('teachers')
@Dependencies(TeachersService)
export class TeachersController {
  constructor(teachersService) {
    this.teachersService = teachersService;
  }

  @Get()
  @Bind(Query())
  @ApiOperation({ summary: 'Ustozlar ro‘yxati' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Ustozlar ro‘yxati' })
  async findAll(query) {
    return this.teachersService.findAll(query);
  }

  @Get('dashboard/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ustoz shaxsiy dashboard ma’lumotlari va statistikasi' })
  @ApiResponse({ status: 200, description: 'Ustoz statistikasi, kurslari va o‘quvchilari' })
  async getTeacherDashboard(user) {
    return this.teachersService.getTeacherDashboard(user.id);
  }

  @Get('dashboard/courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ustozning barcha kurslari' })
  @ApiResponse({ status: 200, description: 'Kurslar ro‘yxati' })
  async getTeacherCourses(user) {
    return this.teachersService.getTeacherCourses(user.id);
  }

  @Get('dashboard/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ustoz kurslariga a’zo bo‘lgan talabalar ro‘yxati' })
  @ApiResponse({ status: 200, description: 'Talabalar va ularning progressi' })
  async getTeacherStudents(user) {
    return this.teachersService.getTeacherStudents(user.id);
  }

  @Get('dashboard/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ustoz tahliliy ko‘rsatkichlari' })
  @ApiResponse({ status: 200, description: 'Analitika' })
  async getTeacherAnalytics(user) {
    return this.teachersService.getTeacherAnalytics(user.id);
  }

  @Get('dashboard/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ustoz kurslariga yozilgan barcha sharhlar' })
  @ApiResponse({ status: 200, description: 'Sharhlar ro‘yxati' })
  async getTeacherReviews(user) {
    return this.teachersService.getTeacherReviews(user.id);
  }

  @Get('dashboard/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ustoz verifikatsiya holati' })
  @ApiResponse({ status: 200, description: 'Verifikatsiya ma’lumotlari' })
  async getTeacherVerification(user) {
    return this.teachersService.getTeacherVerification(user.id);
  }

  @Get(':id')
  @Bind(Param('id'))
  @ApiOperation({ summary: 'Ustoz profili va beradigan kurslari' })
  @ApiResponse({ status: 200, description: 'Ustoz ma’lumotlari' })
  async findById(id) {
    return this.teachersService.findById(id);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ustozlikka ariza topshirish' })
  @ApiResponse({ status: 201, description: 'Ariza qabul qilindi' })
  async apply(user, body) {
    return this.teachersService.apply(user.id, body);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Bind(Param('id'), Body('status'), Body('rejectionReason'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ustoz arizasini tasdiqlash yoki rad etish (Faqat Admin)' })
  @ApiResponse({ status: 200, description: 'Holat yangilandi' })
  async verify(teacherProfileId, status, rejectionReason) {
    return this.teachersService.verifyTeacher(teacherProfileId, status, rejectionReason);
  }
}
