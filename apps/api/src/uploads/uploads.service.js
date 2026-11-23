import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4', '.doc', '.docx']);
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

@Injectable()
export class UploadsService {
  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async handleBase64Upload(fileName, base64Data) {
    if (!fileName || !base64Data) {
      throw new BadRequestException('Fayl nomi va ma’lumotlari talab qilinadi');
    }

    // Sanitize filename and extract safe extension
    const cleanFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(cleanFileName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(
        `Faqat ruxsat etilgan fayl formatlarini yuklash mumkin: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
      );
    }

    const base64Clean = base64Data.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Fayl hajmi 25 MB dan oshmasligi kerak');
    }

    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return {
      success: true,
      message: 'Fayl muvaffaqiyatli va xavfsiz yuklandi',
      data: {
        originalName: cleanFileName,
        fileName: uniqueName,
        url: publicUrl,
        sizeBytes: buffer.length,
      },
    };
  }
}
