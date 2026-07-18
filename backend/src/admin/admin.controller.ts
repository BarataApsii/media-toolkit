import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('jobs')
  getAllJobs() {
    return this.adminService.getAllJobs();
  }

  @Get('job-stats')
  getJobStats() {
    return this.adminService.getJobStats();
  }
}
