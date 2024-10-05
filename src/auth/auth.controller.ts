import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PreGeneratedProjecttDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async populateProfile(@Body() profile: PreGeneratedProjecttDto) {
    return this.authService.preGenerateProjectChatrooms(profile);
  }
}
