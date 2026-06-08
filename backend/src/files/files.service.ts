import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileType } from '@prisma/client';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async createFileRecord(
    userId: string,
    file: Express.Multer.File,
  ) {
    const fileType = file.mimetype.startsWith('image/')
      ? FileType.IMAGE
      : FileType.VIDEO;

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
}
