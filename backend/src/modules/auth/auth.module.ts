import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/user.module';
import { FirebaseAuthService } from '../firebase/firebase.service';

@Module({
  imports: [UsersModule],
  providers: [AuthService, FirebaseAuthService],
  controllers: [AuthController],
})
export class AuthModule {}
