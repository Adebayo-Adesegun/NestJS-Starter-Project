import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './pulic-access.guard';
import { RegisterDto } from '../user/dto/register.dto';
import { UserService } from '../user/user.service';
import { ApiResponse } from '../core/interfaces/api-response.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponse<RegisterDto>> {
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

  // @UseGuards(JwtAuthGuard)
  // @Public()
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
