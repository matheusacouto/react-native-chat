import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';

import { Module } from '@nestjs/common';
import { FirebaseAuthService } from '../firebase/firebase.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Module({
  providers: [UsersService, FirebaseAuthService, FirebaseAuthGuard],
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
})
export class UsersModule {}
