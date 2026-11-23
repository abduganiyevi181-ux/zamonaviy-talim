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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@ApiTags('Categories')
@Controller('categories')
@Dependencies(CategoriesService)
export class CategoriesController {
  constructor(categoriesService) {
    this.categoriesService = categoriesService;
  }

  @Get()
  @ApiOperation({ summary: 'Barcha kurs kategoriyalarini olish' })
  @ApiResponse({ status: 200, description: 'Kategoriyalar ro‘yxati' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  @Bind(Param('slug'))
  @ApiOperation({ summary: 'Kategoriya tafsilotlarini slug orqali ko‘rish' })
  @ApiResponse({ status: 200, description: 'Kategoriya ma’lumotlari va kurslari' })
  async findBySlug(slug) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Bind(Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi kategoriya yaratish (Faqat Admin)' })
  @ApiResponse({ status: 201, description: 'Kategoriya yaratildi' })
  async create(body) {
    return this.categoriesService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Bind(Param('id'), Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategoriyani yangilash (Faqat Admin)' })
  @ApiResponse({ status: 200, description: 'Kategoriya yangilandi' })
  async update(id, body) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Bind(Param('id'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategoriyani o‘chirish (Faqat Admin)' })
  @ApiResponse({ status: 200, description: 'Kategoriya o‘chirildi' })
  async remove(id) {
    return this.categoriesService.remove(id);
  }
}
