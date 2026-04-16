import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { StorageService } from './storage.service';

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed. Allowed: image, pdf');
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File too large. Max 10MB');
    }

    return this.storageService.upload(file);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file' })
  async remove(@Param('key') key: string) {
    await this.storageService.delete(key);
    return { message: 'File deleted' };
  }
}
