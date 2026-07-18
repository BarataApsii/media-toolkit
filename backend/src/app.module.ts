import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { JobsModule } from './jobs/jobs.module';
import { AdminModule } from './admin/admin.module';
// import { WorkerModule } from './worker/worker.module';

const redisEnabled = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(redisEnabled
      ? [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              connection: {
                host: configService.get<string>('REDIS_HOST', 'localhost'),
                port: configService.get<number>('REDIS_PORT', 6379),
              },
            }),
            inject: [ConfigService],
          }),
        ]
      : []),
    PrismaModule,
    AuthModule,
    FilesModule,
    JobsModule,
    AdminModule,
    // WorkerModule, // Temporarily disabled - requires Redis
  ],
})
export class AppModule {}
