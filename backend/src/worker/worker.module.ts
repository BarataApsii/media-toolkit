import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaProcessor } from './worker.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media-processing',
    }),
  ],
  providers: [MediaProcessor],
})
export class WorkerModule {}
