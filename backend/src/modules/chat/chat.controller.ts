import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartChatDto } from './dto/start-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  //
  @Get('conversation/:conversationId/messages')
  listMessages(
    @Param('conversationId') conversationId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.chatService.findMessagesByConversation(
      Number(conversationId),
      pagination,
    );
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
