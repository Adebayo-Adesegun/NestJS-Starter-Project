import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { Public } from './auth/pulic-access.guard';
import { AuthService } from './auth/auth.service';
import { ApiResponse } from './core/interfaces/api-response.interface';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Get()
  getHello(): string {
    return 'Welcome to the NestJS APIs Starter Project🥹!';
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req): Promise<ApiResponse<any>> {
    const response = await this.authService.login(req.user);
    return {
      statusCode: 200,
      message: ['User logged in successfully.'],
      data: response,
    };
  }
}
