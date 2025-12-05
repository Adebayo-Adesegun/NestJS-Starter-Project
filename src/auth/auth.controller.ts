import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../guards/pulic-access.guard';
import { RegisterDto } from '../user/dto/register.dto';
import { UserService } from '../user/user.service';
import { ApiBaseResponse } from '../core/interfaces/api-response.interface';
import { LoginDto } from './dto/login.dto';
import { AccountLockoutService } from './account-lockout.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
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
}
