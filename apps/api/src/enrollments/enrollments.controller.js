import {
  Controller,
  Get,
  Post,
  UseGuards,
  Dependencies,
  Bind,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Enrollments')
@Controller('enrollments')
@Dependencies(EnrollmentsService)
export class EnrollmentsController {
  constructor(enrollmentsService) {
    this.enrollmentsService = enrollmentsService;
  }

  @Post(':courseId')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Param('courseId'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursga yozilish (A’zo bo‘lish)' })
  @ApiResponse({ status: 201, description: 'Kursga a’zo bo‘lindi' })
  async enroll(user, courseId) {
    return this.enrollmentsService.enroll(user.id, courseId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mening yozilgan kurslarim ro‘yxati' })
  @ApiResponse({ status: 200, description: 'O‘quvchi kurslari va progress' })
  async getMyEnrollments(user) {
    return this.enrollmentsService.getMyEnrollments(user.id);
  }

  @Get('check/:courseId')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Param('courseId'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursga a’zolik holatini tekshirish' })
  @ApiResponse({ status: 200, description: 'A’zolik holati' })
  async checkEnrollment(user, courseId) {
    return this.enrollmentsService.checkEnrollment(user.id, courseId);
  }
}
