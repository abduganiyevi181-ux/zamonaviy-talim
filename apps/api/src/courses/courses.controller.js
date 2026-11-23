import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  UseGuards,
  Dependencies,
  Bind,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/optional-jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Courses')
@Controller('courses')
@Dependencies(CoursesService)
export class CoursesController {
  constructor(coursesService) {
    this.coursesService = coursesService;
  }

  @Get()
  @Bind(Query())
  @ApiOperation({ summary: 'Kurslar ro‘yxati (qidiruv, filtr va sahifalash bilan)' })
  @ApiQuery({ name: 'search', required: false, description: 'Kurs nomi yoki tavsifi bo‘yicha qidiruv' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Kategoriya ID' })
  @ApiQuery({ name: 'teacherId', required: false, description: 'Ustoz ID' })
  @ApiQuery({ name: 'level', required: false, description: 'Daraja: Boshlang\'ich, O\'rta, Yuqori' })
  @ApiQuery({ name: 'language', required: false, description: 'Til: uz, ru, en' })
  @ApiQuery({ name: 'isFree', required: false, type: Boolean, description: 'Bepul kurslar' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'price', 'rating', 'studentsCount'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Kurslar ro‘yxati' })
  async findAll(query) {
    return this.coursesService.findAll(query);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @Bind(Param('slug'), CurrentUser())
  @ApiOperation({ summary: 'Kurs tafsilotlari (slug bo‘yicha)' })
  @ApiResponse({ status: 200, description: 'Kurs ma’lumotlari, darslar rejasi va a’zolik holati' })
  async findBySlug(slug, user) {
    return this.coursesService.findBySlug(slug, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(CurrentUser(), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi kurs yaratish (Ustoz yoki Admin)' })
  @ApiResponse({ status: 201, description: 'Kurs yaratildi' })
  async create(user, body) {
    return this.coursesService.create(user.id, user.role, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(Param('id'), CurrentUser(), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursni yangilash' })
  @ApiResponse({ status: 200, description: 'Kurs yangilandi' })
  async update(id, user, body) {
    return this.coursesService.update(id, user.id, user.role, body);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(Param('id'), CurrentUser(), Body('isPublished'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursni chop etish yoki bekor qilish' })
  @ApiResponse({ status: 200, description: 'Kurs holati o‘zgartirildi' })
  async togglePublish(id, user, isPublished) {
    return this.coursesService.togglePublish(id, user.id, user.role, isPublished);
  }
}
