import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Request,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'nest-keycloak-connect';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly usersService: UsersService) { }

  @Post('sync')
  async sync(@Request() req, @Body() data: { role?: string }) {
    this.logger.log(`Sync attempt for sub: ${req.user?.sub}`);
    if (req.user && req.user.sub) {
      return this.usersService.syncUser(req.user, data.role);
    }
    throw new UnauthorizedException('User not authenticated');
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

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() data: { email: string }) {
    return this.usersService.forgotPassword(data.email);
  }
}
