import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async createFileRecord(
    userId: string,
    file: Express.Multer.File,
  ) {
    const fileType = file.mimetype.startsWith('image/')
      ? FileType.IMAGE
      : file.mimetype.startsWith('video/')
      ? FileType.VIDEO
      : file.mimetype.startsWith('audio/')
      ? FileType.AUDIO
      : FileType.PDF;

    return this.prisma.file.create({
      data: {
        userId,
        originalName: file.originalname,
        fileType,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      },
    });
  }

  async getFileById(fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: { jobs: true },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async getUserFiles(userId: string) {
    return this.prisma.file.findMany({
      where: { userId },
      include: { jobs: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async downloadAndDelete(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { file: true },
    });

    if (!job || !job.outputPath || job.status !== 'COMPLETED') {
      throw new NotFoundException('Job not found or not completed');
    }

    const filePath = job.outputPath;
    const filename = `compressed_${job.file.originalName}`;

    // Delete database records
    await this.prisma.job.delete({ where: { id: jobId } });
    await this.prisma.file.delete({ where: { id: job.fileId } });

    // Delete physical files
    try {
      if (fs.existsSync(job.file.path)) {
        fs.unlinkSync(job.file.path);
      }
      if (fs.existsSync(filePath)) {
        // Schedule file deletion after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Error deleting files:', err);
    }

    return { filePath, filename };
  }
}
