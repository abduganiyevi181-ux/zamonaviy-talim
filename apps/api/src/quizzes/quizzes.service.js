import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Dependencies,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class QuizzesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Get quiz for students (without isCorrect exposed in options)
   */
  async getQuiz(quizId, userId = null) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: { select: { id: true, title: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                questionId: true,
                text: true,
                order: true,
                // do NOT select isCorrect here for students!
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Test (quiz) topilmadi');
    }

    let userAttempts = [];
    if (userId) {
      userAttempts = await this.prisma.quizAttempt.findMany({
        where: { quizId, userId },
        orderBy: { completedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          score: true,
          passed: true,
          completedAt: true,
        },
      });
    }

    return {
      success: true,
      data: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        courseId: quiz.courseId,
        lessonId: quiz.lessonId,
        questionsCount: quiz.questions.length,
        questions: quiz.questions,
        userAttempts,
      },
    };
  }

  /**
   * Get quiz by lesson ID
   */
  async getQuizByLesson(lessonId, userId = null) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
    });

    if (!quiz) {
      return { success: true, data: null };
    }

    return this.getQuiz(quiz.id, userId);
  }

  /**
   * Submit quiz answers and calculate score
   */
  async submitQuiz(userId, quizId, submission) {
    const { answers = [] } = submission; // array of { questionId, selectedOptionId }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Test topilmadi');
    }

    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) {
      throw new BadRequestException('Ushbu testda hali savollar mavjud emas');
    }

    let correctCount = 0;
    const attemptAnswersData = [];

    // Map answers for quick lookup
    const answerMap = new Map();
    answers.forEach((ans) => {
      answerMap.set(ans.questionId, ans.selectedOptionId);
    });

    quiz.questions.forEach((q) => {
      const selectedOptionId = answerMap.get(q.id);
      const correctOption = q.options.find((opt) => opt.isCorrect);

      const isCorrect = !!(correctOption && selectedOptionId === correctOption.id);
      if (isCorrect) {
        correctCount += 1;
      }

      attemptAnswersData.push({
        questionId: q.id,
        selectedOptionId: selectedOptionId || null,
        isCorrect,
      });
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Save attempt in database
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        passed,
        answers: {
          create: attemptAnswersData,
        },
      },
      include: {
        answers: true,
      },
    });

    return {
      success: true,
      message: passed
        ? 'Tabriklaymiz! Testdan muvaffaqiyatli o‘tdingiz'
        : 'Afsuski, o‘tish ballini to‘play olmadingiz. Qayta urinib ko‘ring',
      data: {
        attemptId: attempt.id,
        score,
        passingScore: quiz.passingScore,
        passed,
        correctCount,
        totalQuestions,
        completedAt: attempt.completedAt,
        details: quiz.questions.map((q) => {
          const selectedOptionId = answerMap.get(q.id);
          const correctOption = q.options.find((opt) => opt.isCorrect);
          return {
            questionId: q.id,
            question: q.question,
            explanation: q.explanation,
            selectedOptionId,
            correctOptionId: correctOption?.id,
            isCorrect: selectedOptionId === correctOption?.id,
          };
        }),
      },
    };
  }

  /**
   * Get user attempt history
   */
  async getAttemptHistory(userId, quizId) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { completedAt: 'desc' },
      include: {
        quiz: {
          select: { title: true, passingScore: true },
        },
      },
    });

    return {
      success: true,
      data: attempts.map((a) => ({
        id: a.id,
        quizTitle: a.quiz.title,
        passingScore: a.quiz.passingScore,
        score: a.score,
        passed: a.passed,
        completedAt: a.completedAt,
      })),
    };
  }
}
