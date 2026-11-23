import {
  Controller,
  Get,
  Post,
  UseGuards,
  Dependencies,
  Bind,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Progress')
@Controller('progress')
@Dependencies(ProgressService)
export class ProgressController {
  constructor(progressService) {
    this.progressService = progressService;
  }

  @Post('lesson/:lessonId')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Param('lessonId'), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Darsni tugatilgan deb belgilash yoki ko‘rish vaqtini yangilash' })
  @ApiResponse({ status: 200, description: 'Progress yangilandi' })
  async updateLessonProgress(user, lessonId, body) {
    return this.progressService.updateLessonProgress(user.id, lessonId, body);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Param('courseId'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kurs bo‘yicha o‘quvchining to‘liq progressini ko‘rish' })
  @ApiResponse({ status: 200, description: 'Kurs progressi va darslar holati' })
  async getCourseProgress(user, courseId) {
    return this.progressService.getCourseProgress(user.id, courseId);
  }
}
