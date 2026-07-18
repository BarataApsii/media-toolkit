import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.$queryRaw`
      SELECT id FROM "users" WHERE email = ${dto.email}
    ` as any[];

    if (existing && existing.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const emailVerificationToken = randomBytes(32).toString('hex');
    
    const user = await this.prisma.$queryRaw`
      INSERT INTO "users" (email, password, name, "emailVerified", "emailVerificationToken", "createdAt", "updatedAt")
      VALUES (${dto.email}, ${hashedPassword}, ${dto.name}, false, ${emailVerificationToken}, NOW(), NOW())
      RETURNING id, email, name, role, "subscriptionTier", "emailVerified"
    ` as any[];

    const userData = user[0];
    
    // Send verification email
    await this.emailService.sendVerificationEmail(dto.email, emailVerificationToken);
    
    return {
      user: { id: userData.id, email: userData.email, name: userData.name, role: userData.role, subscriptionTier: userData.subscriptionTier, emailVerified: userData.emailVerified },
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.$queryRaw`
      SELECT id, email, password, name, role, "subscriptionTier", "emailVerified"
      FROM "users" 
      WHERE email = ${dto.email}
    ` as any[];

    if (!user || user.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userData = user[0];
    const passwordValid = await bcrypt.compare(dto.password, userData.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!userData.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const token = this.generateToken(userData.id, userData.email);
    return {
      user: { id: userData.id, email: userData.email, name: userData.name, role: userData.role, subscriptionTier: userData.subscriptionTier, emailVerified: userData.emailVerified },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, emailVerified: true },
    });
    return user;
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.$queryRaw`
      SELECT id, email FROM "users" 
      WHERE "emailVerificationToken" = ${token}
    ` as any[];

    if (!user || user.length === 0) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const userData = user[0];
    
    await this.prisma.$queryRaw`
      UPDATE "users" 
      SET "emailVerified" = true, "emailVerificationToken" = NULL, "updatedAt" = NOW()
      WHERE id = ${userData.id}
    `;

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.$queryRaw`
      SELECT id, "emailVerified" FROM "users" 
      WHERE email = ${email}
    ` as any[];

    if (!user || user.length === 0) {
      throw new BadRequestException('User not found');
    }

    const userData = user[0];
    
    if (userData.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const emailVerificationToken = randomBytes(32).toString('hex');
    
    await this.prisma.$queryRaw`
      UPDATE "users" 
      SET "emailVerificationToken" = ${emailVerificationToken}, "updatedAt" = NOW()
      WHERE id = ${userData.id}
    `;

    await this.emailService.sendVerificationEmail(email, emailVerificationToken);
    
    return { message: 'Verification email sent successfully' };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}
