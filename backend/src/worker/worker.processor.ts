import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { PrismaService } from '../prisma/prisma.service';

interface MediaJobData {
  jobId: string;
  fileId: string;
  filePath: string;
  fileType: 'IMAGE' | 'VIDEO';
  mimeType: string;
  operation: string;
}

@Processor('media-processing', { concurrency: 2 })
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);
  private readonly outputDir = join(process.cwd(), 'uploads', 'processed');

  constructor(private prisma: PrismaService) {
    super();
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async process(job: Job<MediaJobData>): Promise<void> {
    const { jobId, filePath, fileType, operation } = job.data;
    this.logger.log(`Processing job ${jobId} — ${operation} on ${fileType}`);

    await this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    try {
      let outputPath: string;
      let outputSize: number;

      if (fileType === 'IMAGE') {
        ({ outputPath, outputSize } = await this.processImage(filePath, operation));
      } else {
        ({ outputPath, outputSize } = await this.processVideo(filePath, operation));
      }

      await this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          outputPath,
          outputSize,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Job ${jobId} completed — output: ${outputPath}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Job ${jobId} failed: ${errMsg}`);

      await this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: errMsg,
        },
      });

      throw error;
    }
  }

  private async processImage(
    filePath: string,
    operation: string,
  ): Promise<{ outputPath: string; outputSize: number }> {
    const ext = extname(filePath);
    const name = basename(filePath, ext);
    const outputPath = join(this.outputDir, `${name}-${operation}${ext === '.png' ? '.png' : '.webp'}`);

    let pipeline = sharp(filePath);

    switch (operation) {
      case 'compress':
        if (ext === '.png') {
          pipeline = pipeline.png({ quality: 70, compressionLevel: 9 });
        } else {
          pipeline = pipeline.webp({ quality: 75 });
        }
        break;
      case 'resize':
        pipeline = pipeline.resize(1920, 1080, { fit: 'inside', withoutEnlargement: true });
        if (ext === '.png') {
          pipeline = pipeline.png({ quality: 80 });
        } else {
          pipeline = pipeline.webp({ quality: 80 });
        }
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: 80 });
        break;
      default:
        pipeline = pipeline.webp({ quality: 75 });
    }

    const info = await pipeline.toFile(outputPath);
    return { outputPath, outputSize: info.size };
  }

  private async processVideo(
    filePath: string,
    _operation: string,
  ): Promise<{ outputPath: string; outputSize: number }> {
    // Phase B: FFmpeg video processing
    // For now, return a placeholder for video processing
    this.logger.warn('Video processing not yet implemented (Phase B)');
    return { outputPath: filePath, outputSize: 0 };
  }
}
