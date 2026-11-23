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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Dependencies(AdminService)
export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Platforma umumiy real bazaviy statistikasi (Faqat Admin)' })
  @ApiResponse({ status: 200, description: 'Statistika ko‘rsatkichlari' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // User Management
  @Get('users')
  @Bind(Query())
  @ApiOperation({ summary: 'Foydalanuvchilar ro‘yxati va filtrlar' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: ['STUDENT', 'TEACHER', 'ADMIN'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Foydalanuvchilar ro‘yxati' })
  async getUsersList(query) {
    return this.adminService.getUsersList(query);
  }

  @Get('users/:id')
  @Bind(Param('id'))
  @ApiOperation({ summary: 'Foydalanuvchi to‘liq ma’lumotlari' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi tafsilotlari' })
  async getUserDetails(id) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/status')
  @Bind(CurrentUser(), Param('id'), Body('status'))
  @ApiOperation({ summary: 'Foydalanuvchi hisob holatini o‘zgartirish (Suspend / Reactivate)' })
  @ApiResponse({ status: 200, description: 'Holat yangilandi' })
  async updateUserStatus(admin, userId, status) {
    return this.adminService.updateUserStatus(admin.id, userId, status);
  }

  @Patch('users/:id/role')
  @Bind(CurrentUser(), Param('id'), Body('role'))
  @ApiOperation({ summary: 'Foydalanuvchi rolini o‘zgartirish' })
  @ApiResponse({ status: 200, description: 'Rol yangilandi' })
  async updateUserRole(admin, userId, role) {
    return this.adminService.updateUserRole(admin.id, userId, role);
  }

  // Course Management
  @Get('courses')
  @Bind(Query())
  @ApiOperation({ summary: 'Barcha platforma kurslari ro‘yxati' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Kurslar ro‘yxati' })
  async getCoursesList(query) {
    return this.adminService.getCoursesList(query);
  }

  @Patch('courses/:id/status')
  @Bind(CurrentUser(), Param('id'), Body('status'))
  @ApiOperation({ summary: 'Kursni tasdiqlash yoki qoralamaga qaytarish' })
  @ApiResponse({ status: 200, description: 'Kurs holati yangilandi' })
  async updateCourseStatus(admin, courseId, status) {
    return this.adminService.updateCourseStatus(admin.id, courseId, status);
  }

  // Teacher Verifications
  @Get('verifications')
  @Bind(Query())
  @ApiOperation({ summary: 'Ustozlik arizalari navbati' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'ALL'] })
  @ApiResponse({ status: 200, description: 'Arizalar ro‘yxati' })
  async getTeacherVerifications(query) {
    return this.adminService.getTeacherVerifications(query);
  }

  @Post('verifications/:id/review')
  @Bind(CurrentUser(), Param('id'), Body())
  @ApiOperation({ summary: 'Ustoz arizasini ko‘rib chiqish (Tasdiqlash / Rad etish)' })
  @ApiResponse({ status: 200, description: 'Ariza holati yangilandi' })
  async reviewTeacherVerification(admin, verificationId, body) {
    return this.adminService.reviewTeacherVerification(admin.id, verificationId, body);
  }

  // Categories
  @Get('categories')
  @ApiOperation({ summary: 'Barcha kurs yo‘nalishlari (Kategoriyalar)' })
  @ApiResponse({ status: 200, description: 'Kategoriyalar ro‘yxati' })
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @Bind(CurrentUser(), Body())
  @ApiOperation({ summary: 'Yangi kategoriya yaratish' })
  @ApiResponse({ status: 201, description: 'Kategoriya yaratildi' })
  async createCategory(admin, body) {
    return this.adminService.createCategory(admin.id, body);
  }

  // Reports
  @Get('reports')
  @Bind(Query())
  @ApiOperation({ summary: 'Tizim shikoyatlari va moderatsiya navbati' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'RESOLVED', 'DISMISSED', 'ALL'] })
  @ApiResponse({ status: 200, description: 'Shikoyatlar ro‘yxati' })
  async getReportsList(query) {
    return this.adminService.getReportsList(query);
  }

  @Patch('reports/:id')
  @Bind(CurrentUser(), Param('id'), Body())
  @ApiOperation({ summary: 'Shikoyat holatini o‘zgartirish' })
  @ApiResponse({ status: 200, description: 'Shikoyat yangilandi' })
  async updateReportStatus(admin, reportId, body) {
    return this.adminService.updateReportStatus(admin.id, reportId, body);
  }

  // Audit Logs
  @Get('audit-logs')
  @Bind(Query())
  @ApiOperation({ summary: 'Tizim xavfsizlik va audit jurnali' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Audit yozuvlari' })
  async getAuditLogs(query) {
    return this.adminService.getAuditLogs(query);
  }
}
