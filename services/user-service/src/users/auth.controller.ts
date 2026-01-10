import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'nest-keycloak-connect';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Public()
  @Post('login')
  login(@Body() credentials: { email: string; password: string }) {
    return this.usersService.login(credentials);
  }

  @Public()
  @Post('login/2fa')
  verifyLoginTwoFactor(@Body() body: { tempToken: string; code: string }) {
    return this.usersService.verifyLoginTwoFactor(body.tempToken, body.code);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() data: { email: string }) {
    return this.usersService.forgotPassword(data.email);
  }

  @Post('social-onboarding')
  socialOnboarding(@Request() req, @Body() data: { role: string }) {
    if (req.user && req.user.sub) {
      return this.usersService.socialOnboarding(req.user.sub, data.role);
    }
    throw new UnauthorizedException('User not authenticated');
  }

  @Post('verify-email/resend')
  resendVerification(@Request() req) {
    if (req.user && req.user.sub) {
      return this.usersService.resendVerificationEmail(req.user.sub);
    }
    throw new UnauthorizedException('User not authenticated');
  }
}
