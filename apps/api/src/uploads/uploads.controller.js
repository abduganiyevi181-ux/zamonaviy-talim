import {
  Controller,
  Post,
  UseGuards,
  Dependencies,
  Bind,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Uploads')
@Controller('uploads')
@Dependencies(UploadsService)
export class UploadsController {
  constructor(uploadsService) {
    this.uploadsService = uploadsService;
  }

  @Post('file')
  @UseGuards(JwtAuthGuard)
  @Bind(Body())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fayl yuklash (Base64 orqali avatar, hujjat, rasm)' })
  @ApiResponse({ status: 201, description: 'Fayl yuklandi va URL qaytarildi' })
  async uploadFile(body) {
    const { fileName, fileData } = body;
    return this.uploadsService.handleBase64Upload(fileName, fileData);
  }
}
