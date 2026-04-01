import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/user.module';
import { NotificationsModule } from './modules/notificatios/notification.module';
import { ChatModule } from './modules/chat/chat.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppParametersModule } from './modules/app-parameters/app-parameters.module';
import { Notification } from './modules/notificatios/notification.entity';
import { Message } from './modules/chat/entity/message.entity';
import { Conversation } from './modules/chat/entity/conversation.entity';
import { AppParameter } from './modules/app-parameters/app-parameters.entity';
import { NotificationRecipient } from './modules/notificatios/notification-recipient.entity';
import { PushToken } from './modules/push/push-token.entity';
import { PushModule } from './modules/push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('PG_HOST'),
        port: +configService.get('PG_PORT'),
        username: configService.get('PG_USER'),
        password: configService.get('PG_PASSWORD'),
        database: configService.get('PG_DB'),
        entities: [
          User,
          Notification,
          NotificationRecipient,
          Message,
          Conversation,
          AppParameter,
          PushToken,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    NotificationsModule,
    ChatModule,
    AuthModule,
    AppParametersModule,
    PushModule,
  ],
})
export class AppModule {}
