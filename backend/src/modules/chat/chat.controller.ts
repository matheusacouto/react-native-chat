import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartChatDto } from './dto/start-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  //
  @Get('conversation/:conversationId/messages')
  listMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.findMessagesByConversation(Number(conversationId));
  }

  @Post('message')
  sendMessage(@Body() body: SendMessageDto) {
    return this.chatService.sendMessage(
      body.currentUserId,
      body.targetUserId,
      body.text,
    );
  }

  @Post('conversation')
  startConversation(@Body() body: StartChatDto) {
    return this.chatService.createConversation(
      body.currentUserId,
      body.targetUserId,
    );
  }
}
