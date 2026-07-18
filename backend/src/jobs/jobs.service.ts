import { Injectable, NotFoundException, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() @InjectQueue('media-processing') private mediaQueue?: Queue,
  ) {}

  async createJob(fileId: string, operation = 'compress') {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const job = await this.prisma.job.create({
      data: { fileId, operation },
    });

    if (this.mediaQueue) {
      await this.mediaQueue.add('process-media', {
        jobId: job.id,
        fileId: file.id,
        filePath: file.path,
        fileType: file.fileType,
        mimeType: file.mimeType,
        operation,
      });
    } else {
      this.logger.warn('Redis is disabled. Job created but will not be processed automatically.');
      // Mark job as failed since no worker will process it
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: 'Redis is disabled. Job processing not available.',
        },
      });
    }

    return job;
  }

  async getJobById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { file: true },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async getJobStatus(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, error: true, outputPath: true, outputSize: true, completedAt: true },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async getJobsByFile(fileId: string) {
    return this.prisma.job.findMany({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
