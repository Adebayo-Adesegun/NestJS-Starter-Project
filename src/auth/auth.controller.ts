import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  Get,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../guards/pulic-access.guard';
import { RegisterDto } from '../user/dto/register.dto';
import { UserService } from '../user/user.service';
import { ApiBaseResponse } from '../core/interfaces/api-response.interface';
import { LoginDto } from './dto/login.dto';
import { AccountLockoutService } from './account-lockout.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../guards/jwt/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  // Simple in-memory rate limiter for forgot-password to enforce tighter limits
  // Keyed by IP address (and optionally email) to reduce abuse. This is
  // intentionally simple; for clustered deployments use Redis or a central store.
  private static forgotPasswordAttempts: Map<
    string,
    { count: number; first: number }
  > = new Map();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private accountLockoutService: AccountLockoutService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiBaseResponse<any>> {
    const [success, message, user] = await this.userService.create(registerDto);
    if (success) {
      return {
        statusCode: 201,
        message: [message],
        data: user,
      };
    }
    throw new BadRequestException({
      message: [message],
      statusCode: 400,
    });
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiBaseResponse<{ access_token: string; user: any }>> {
    const { email, password } = loginDto;

    // Check for existing lockout
    const remainingTime =
      this.accountLockoutService.getRemainingLockoutTime(email);
    if (remainingTime > 0) {
      throw new UnauthorizedException({
        code: 'AUTH_ACCOUNT_LOCKED',
        message: `Account is locked. Try again in ${Math.ceil(
          remainingTime / 1000,
        )} seconds`,
      });
    }

    try {
      const validatedUser = await this.authService.validateUser(
        email,
        password,
      );

      // Clear failed attempts on successful login
      await this.accountLockoutService.clearFailedAttempts(email);

      const loginResponse = await this.authService.login(validatedUser);

      return {
        statusCode: 200,
        message: ['Login successful'],
        data: {
          access_token: loginResponse.access_token,
          user: {
            id: loginResponse.id,
            firstName: loginResponse.firstName,
            lastName: loginResponse.lastName,
          },
        },
      };
    } catch (error) {
      // If authService throws an UnauthorizedException, propagate it
      if (error instanceof UnauthorizedException) {
        // Record failed attempt and rethrow
        await this.accountLockoutService.recordFailedAttempt(email);
        throw error;
      }

      // On validation failure, record a failed attempt and return a generic unauthorized
      await this.accountLockoutService.recordFailedAttempt(email);
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: any) {
    return {
      statusCode: 200,
      message: ['Profile retrieved'],
      data: req.user,
    };
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset instructions' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Request() req: any) {
    // Rate-limit: 3 requests per IP per hour for forgot-password
    const ip =
      (req && (req.ip || req.headers?.['x-forwarded-for'])) || 'unknown';
    const key = `fp:${ip}`;
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const limit = 3;

    const entry = AuthController.forgotPasswordAttempts.get(key);
    if (!entry) {
      AuthController.forgotPasswordAttempts.set(key, { count: 1, first: now });
    } else {
      if (now - entry.first > windowMs) {
        // Reset window
        AuthController.forgotPasswordAttempts.set(key, {
          count: 1,
          first: now,
        });
      } else {
        if (entry.count >= limit) {
          throw new HttpException(
            'Too many password reset requests. Try again later.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        entry.count += 1;
        AuthController.forgotPasswordAttempts.set(key, entry);
      }
    }

    await this.authService.sendPasswordReset(dto.email);
    return {
      statusCode: 200,
      message: [
        'If an account exists for this email, you will receive password reset instructions',
      ],
    };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return {
      statusCode: 200,
      message: ['Password has been reset successfully'],
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @ApiOperation({ summary: 'Change current password' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    await this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return {
      statusCode: 200,
      message: ['Password changed successfully'],
    };
  }
}
