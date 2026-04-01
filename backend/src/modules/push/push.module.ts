import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushToken } from './push-token.entity';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { UsersModule } from '../users/user.module';
import { FirebaseAuthService } from '../firebase/firebase.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([PushToken]), UsersModule],
  providers: [PushService, FirebaseAuthService, FirebaseAuthGuard],
  controllers: [PushController],
  exports: [PushService],
})
export class PushModule {}
