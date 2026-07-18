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
import { v4 as uuidv4 } from 'uuid';

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
    const userId = uuidv4();
    
    const user = await this.prisma.$queryRaw`
      INSERT INTO "users" (id, email, password, name, "emailVerified", "emailVerificationToken", "createdAt", "updatedAt")
      VALUES (${userId}, ${dto.email}, ${hashedPassword}, ${dto.name}, false, ${emailVerificationToken}, NOW(), NOW())
      RETURNING id, email, name, role, "subscriptionTier", "emailVerified"
    ` as any[];

    const userData = user[0];
    
    // Send verification email (non-blocking - registration succeeds even if email fails)
    try {
      await this.emailService.sendVerificationEmail(dto.email, emailVerificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email during registration:', emailError);
      // Continue with registration even if email fails
    }
    
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

    // Skip email verification check for now
    // if (!userData.emailVerified) {
    //   throw new UnauthorizedException('Please verify your email before logging in');
    // }

    const token = this.generateToken(userData.id, userData.email);
    return {
      user: { id: userData.id, email: userData.email, name: userData.name, role: userData.role, subscriptionTier: userData.subscriptionTier, emailVerified: userData.emailVerified },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.$queryRaw`
      SELECT id, email, name, "createdAt", "emailVerified" FROM "users" 
      WHERE id = ${userId}
    ` as any[];
    
    if (!user || user.length === 0) {
      return null;
    }
    
    return user[0];
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
