import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post('create')
  createJob(@Body() dto: CreateJobDto) {
    return this.jobsService.createJob(dto.fileId, dto.operation);
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Get('status/:id')
  getJobStatus(@Param('id') id: string) {
    return this.jobsService.getJobStatus(id);
  }
}
