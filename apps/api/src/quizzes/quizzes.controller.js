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
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@ApiTags('Quizzes')
@Controller('quizzes')
@Dependencies(QuizzesService)
export class QuizzesController {
  constructor(quizzesService) {
    this.quizzesService = quizzesService;
  }

  @Get(':id')
  @Bind(Param('id'), CurrentUser())
  @ApiOperation({ summary: 'Test savollarini olish' })
  @ApiResponse({ status: 200, description: 'Test ma’lumotlari va savollar' })
  async getQuiz(id, user) {
    return this.quizzesService.getQuiz(id, user?.id);
  }

  @Get('lesson/:lessonId')
  @Bind(Param('lessonId'), CurrentUser())
  @ApiOperation({ summary: 'Darsga tegishli testni olish' })
  @ApiResponse({ status: 200, description: 'Dars testi' })
  async getQuizByLesson(lessonId, user) {
    return this.quizzesService.getQuizByLesson(lessonId, user?.id);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Param('id'), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test javoblarini topshirish va natijani hisoblash' })
  @ApiResponse({ status: 200, description: 'Test natijasi va ball' })
  async submitQuiz(user, id, body) {
    return this.quizzesService.submitQuiz(user.id, id, body);
  }

  @Get(':id/attempts')
  @UseGuards(JwtAuthGuard)
  @Bind(CurrentUser(), Param('id'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchining test urinishlari tarixi' })
  @ApiResponse({ status: 200, description: 'Urinishlar ro‘yxati' })
  async getAttemptHistory(user, id) {
    return this.quizzesService.getAttemptHistory(user.id, id);
  }
}
