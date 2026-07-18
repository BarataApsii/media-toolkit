import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getSystemStats() {
    const [userCount, fileCount, jobCount, storageUsed, userStatusStats, fileTypeStats, topUsers, usersPerMonth] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.file.count(),
      this.prisma.job.count(),
      this.prisma.file.aggregate({
        _sum: { size: true },
      }),
      this.prisma.$queryRaw`
        SELECT status, COUNT(*) as count
        FROM "users"
        GROUP BY status
      `,
      this.prisma.$queryRaw`
        SELECT "fileType", COUNT(*) as count, SUM(size) as total_size
        FROM "files"
        GROUP BY "fileType"
      `,
      this.prisma.$queryRaw`
        SELECT 
          u.id, 
          u.email, 
          u.name, 
          COUNT(f.id) as file_count,
          COALESCE(SUM(f.size), 0) as total_storage
        FROM "users" u
        LEFT JOIN "files" f ON u.id = f."userId"
        WHERE u.status = 'ACTIVE'
        GROUP BY u.id, u.email, u.name
        ORDER BY total_storage DESC
        LIMIT 10
      `,
      this.prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          COUNT(*) as count
        FROM "users"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month ASC
      `,
    ]);

    const jobStats = await this.prisma.job.groupBy({
      by: ['status'],
      _count: true,
    });

    const userStats = {
      total: userCount,
      active: 0,
      deactivated: 0,
      deleted: 0,
    };

    (userStatusStats as any[]).forEach((stat: any) => {
      if (stat.status === 'ACTIVE') userStats.active = parseInt(stat.count);
      if (stat.status === 'DEACTIVATED') userStats.deactivated = parseInt(stat.count);
      if (stat.status === 'DELETED') userStats.deleted = parseInt(stat.count);
    });

    const fileStats = (fileTypeStats as any[]).reduce((acc: any, stat: any) => {
      acc[stat.fileType] = {
        count: parseInt(stat.count),
        totalSize: parseInt(stat.total_size),
      };
      return acc;
    }, {} as Record<string, { count: number; totalSize: number }>);

    const topUsersList = (topUsers as any[]).map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      fileCount: parseInt(user.file_count),
      totalStorage: parseInt(user.total_storage),
    }));

    const usersPerMonthList = (usersPerMonth as any[]).map((item: any) => ({
      month: item.month,
      count: parseInt(item.count),
    }));

    return {
      users: userStats,
      files: fileCount,
      jobs: jobCount,
      storageUsed: storageUsed._sum.size || 0,
      jobStats: jobStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      fileStats,
      topUsers: topUsersList,
      usersPerMonth: usersPerMonthList,
    };
  }

  async getAllUsers() {
    const users = await this.prisma.$queryRaw`
      SELECT 
        id, 
        email, 
        name, 
        role, 
        "createdAt",
        (SELECT COUNT(*) FROM "files" WHERE "files"."userId" = "users".id) as file_count
      FROM "users"
      ORDER BY "createdAt" DESC
    ` as any[];

    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      _count: {
        files: parseInt(user.file_count)
      }
    }));
  }

  async getAllJobs(limit = 50) {
    return this.prisma.job.findMany({
      take: limit,
      include: {
        file: {
          select: {
            id: true,
            originalName: true,
            fileType: true,
            size: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getJobStats() {
    const jobs = await this.prisma.job.findMany({
      select: {
        status: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: jobs.length,
      byStatus: jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      last24h: jobs.filter((j) => j.createdAt >= last24h).length,
      last7d: jobs.filter((j) => j.createdAt >= last7d).length,
      avgProcessingTime: this.calculateAvgProcessingTime(jobs),
    };
  }

  private calculateAvgProcessingTime(jobs: any[]) {
    const completedJobs = jobs.filter((j) => j.completedAt && j.status === 'COMPLETED');
    if (completedJobs.length === 0) return null;

    const totalTime = completedJobs.reduce((sum, job) => {
      return sum + (job.completedAt.getTime() - job.createdAt.getTime());
    }, 0);

    return totalTime / completedJobs.length;
  }
}
