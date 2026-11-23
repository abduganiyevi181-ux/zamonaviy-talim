import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Dependencies,
  Bind,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/optional-jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Lessons')
@Controller('lessons')
@Dependencies(LessonsService)
export class LessonsController {
  constructor(lessonsService) {
    this.lessonsService = lessonsService;
  }

  @Get('course/:courseId')
  @UseGuards(OptionalJwtAuthGuard)
  @Bind(Param('courseId'), CurrentUser())
  @ApiOperation({ summary: 'Kursga tegishli barcha darslar mundarijasi' })
  @ApiResponse({ status: 200, description: 'Darslar ro‘yxati' })
  async getLessonsByCourse(courseId, user) {
    return this.lessonsService.getLessonsByCourse(courseId, user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @Bind(Param('id'), CurrentUser())
  @ApiOperation({ summary: 'Dars tafsilotlari va video darslikni ko‘rish' })
  @ApiResponse({ status: 200, description: 'Dars ma’lumotlari' })
  async getLessonById(id, user) {
    return this.lessonsService.getLessonById(id, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(CurrentUser(), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursga yangi dars qo‘shish' })
  @ApiResponse({ status: 201, description: 'Dars yaratildi' })
  async create(user, body) {
    return this.lessonsService.create(user.id, user.role, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(Param('id'), CurrentUser(), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dars ma’lumotlarini tahrirlash' })
  @ApiResponse({ status: 200, description: 'Dars yangilandi' })
  async update(id, user, body) {
    return this.lessonsService.update(id, user.id, user.role, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Bind(Param('id'), CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Darsni o‘chirish' })
  @ApiResponse({ status: 200, description: 'Dars o‘chirildi' })
  async remove(id, user) {
    return this.lessonsService.remove(id, user.id, user.role);
  }
}
