import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { StartChatDto } from './dto/start-chat.dto';

describe('ChatController', () => {
  let chatController: ChatController;
  let chatService: {
    findMessagesByConversation: jest.Mock;
    sendMessage: jest.Mock;
    createConversation: jest.Mock;
  };

  beforeEach(async () => {
    const mockChatService = {
      findMessagesByConversation: jest.fn(),
      sendMessage: jest.fn(),
      createConversation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    chatController = module.get<ChatController>(ChatController);
    chatService = module.get(ChatService);
  });

  describe('listMessages', () => {
    it('should return a lista of messages by conversation', async () => {
      const conversationId = '1';
      const mockMessages = [
        { id: 1, text: 'Hello', conversationId: 1 },
        { id: 2, text: 'Hi there', conversationId: 1 },
      ];

      chatService.findMessagesByConversation.mockResolvedValue(mockMessages);

      const result = await chatController.listMessages(conversationId);

      expect(chatService.findMessagesByConversation).toHaveBeenCalledWith(
        Number(conversationId),
      );
      expect(result).toEqual(mockMessages);
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const sendMessageDto: SendMessageDto = {
        currentUserId: 1,
        targetUserId: 2,
        text: 'Hello there',
      };
      const mockMessage = { id: 1, ...sendMessageDto };

      chatService.sendMessage.mockResolvedValue(mockMessage);

      const result = await chatController.sendMessage(sendMessageDto);

      expect(chatService.sendMessage).toHaveBeenCalledWith(
        sendMessageDto.currentUserId,
        sendMessageDto.targetUserId,
        sendMessageDto.text,
      );
      expect(result).toEqual(mockMessage);
    });
  });

  describe('startConversation', () => {
    it('should create a conversation', async () => {
      const startChatDto: StartChatDto = {
        currentUserId: 1,
        targetUserId: 2,
      };
      const mockConversation = { id: 1, ...startChatDto };

      chatService.createConversation.mockResolvedValue(mockConversation);

      const result = await chatController.startConversation(startChatDto);

      expect(chatService.createConversation).toHaveBeenCalledWith(
        startChatDto.currentUserId,
        startChatDto.targetUserId,
      );
      expect(result).toEqual(mockConversation);
    });
  });
});
