import { Body, Controller, Post } from '@nestjs/common';
import { LoginWithFireBaseDTO } from './dto/login-dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  loginWithFirebase(@Body() body: LoginWithFireBaseDTO) {
    return this.authService.loginWithFirebase(body.idToken);
  }
}
