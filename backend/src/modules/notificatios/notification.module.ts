import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { NotificationRecipient } from './notification-recipient.entity';
import { Notification } from './notification.entity';
import { UsersModule } from '../users/user.module';
import { NotificationsService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { FirebaseAuthService } from '../firebase/firebase.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { PushModule } from '../push/push.module';

@Module({
  providers: [NotificationsService, FirebaseAuthService, FirebaseAuthGuard],
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationRecipient]),
    UsersModule,
    PushModule,
  ],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
