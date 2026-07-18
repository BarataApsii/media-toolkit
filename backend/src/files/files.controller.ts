import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private filesService: FilesService,
    private prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024 * 1024, // 2GB absolute max for premium
            message: 'File is too large',
          }),
          new FileTypeValidator({
            fileType: /^(image\/(jpeg|png|webp|gif|bmp|tiff)|video\/(mp4|avi|mov|mkv|webm)|audio\/(mp3|wav|ogg|m4a|flac|aac)|application\/pdf)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ) {
    // Get user's subscription tier
    const user = await this.prisma.$queryRaw`
      SELECT "subscriptionTier"
      FROM "users"
      WHERE id = ${req.user.id}
    ` as any[];

    if (!user || user.length === 0) {
      throw new BadRequestException('User not found');
    }

    // Define file size limits based on subscription tier
    const isVideo = file.mimetype.startsWith('video/');
    const isAudio = file.mimetype.startsWith('audio/');
    
    let maxSize: number;
    let upgradeMessage: string | null = null;

    if (user[0].subscriptionTier === 'FREE') {
      // Free tier limits
      if (isVideo) {
        maxSize = 100 * 1024 * 1024; // 100MB for videos
        upgradeMessage = 'Video files are limited to 100MB on the free tier. Upgrade to Premium for 500MB videos.';
      } else if (isAudio) {
        maxSize = 50 * 1024 * 1024; // 50MB for audio
        upgradeMessage = 'Audio files are limited to 50MB on the free tier. Upgrade to Premium for 200MB audio.';
      } else {
        maxSize = 25 * 1024 * 1024; // 25MB for images/PDFs
        upgradeMessage = 'Files are limited to 25MB on the free tier. Upgrade to Premium for 100MB files.';
      }
    } else {
      // Premium tier limits
      if (isVideo) {
        maxSize = 500 * 1024 * 1024; // 500MB for videos
      } else if (isAudio) {
        maxSize = 200 * 1024 * 1024; // 200MB for audio
      } else {
        maxSize = 100 * 1024 * 1024; // 100MB for images/PDFs
      }
    }
    
    if (file.size > maxSize) {
      throw new BadRequestException(
        upgradeMessage || `File exceeds ${maxSize / (1024 * 1024)}MB limit`
      );
    }
    
    return this.filesService.createFileRecord(req.user.id, file);
  }

  @Get(':id')
  async getFile(@Param('id') id: string) {
    return this.filesService.getFileById(id);
  }

  @Get('user/me')
  async getMyFiles(@Request() req: { user: { id: string } }) {
    return this.filesService.getUserFiles(req.user.id);
  }

  @Get('download/:jobId')
  async downloadProcessedFile(@Param('jobId') jobId: string, @Res() res: Response) {
    try {
      const result = await this.filesService.downloadAndDelete(jobId);
      
      res.download(result.filePath, result.filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Download failed' });
          }
        }
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(404).json({ message: 'File not found or already downloaded' });
      }
    }
  }
}
