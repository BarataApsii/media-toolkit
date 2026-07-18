import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

const redisEnabled = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: [
    ...(redisEnabled
      ? [
          BullModule.registerQueue({
            name: 'media-processing',
          }),
        ]
      : []),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
