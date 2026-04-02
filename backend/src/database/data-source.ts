import 'dotenv/config';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { User } from '../modules/users/user.entity';
import { Notification } from '../modules/notificatios/notification.entity';
import { NotificationRecipient } from '../modules/notificatios/notification-recipient.entity';
import { Message } from '../modules/chat/entity/message.entity';
import { Conversation } from '../modules/chat/entity/conversation.entity';
import { AppParameter } from '../modules/app-parameters/app-parameters.entity';
import { PushToken } from '../modules/push/push-token.entity';

const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT ?? 5432),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
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
  seeds: ['src/database/seeds/**/*{.ts,.js}'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
