import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entity/conversation.entity';
import { Message } from './entity/message.entity';
import { UsersModule } from '../users/user.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService],
  imports: [TypeOrmModule.forFeature([Conversation, Message]), UsersModule],
  controllers: [ChatController],
})
export class ChatModule {}
