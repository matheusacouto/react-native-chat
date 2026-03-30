import { Body, Controller, Post } from '@nestjs/common';
import { LoginWithFireBaseDto } from './dto/login-with-firebase-dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/firebase')
  loginWithFirebase(@Body() body: LoginWithFireBaseDto) {
    return this.authService.loginWithFirebase(body.idToken);
  }
}
