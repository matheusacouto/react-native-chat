import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { UsersService } from '../users/user.service';
import { ChatService } from './chat.service';
import { Conversation } from './entity/conversation.entity';
import { Message } from './entity/message.entity';

describe('ChatService', () => {
  let chatService: ChatService;
  let usersService: jest.Mocked<Pick<UsersService, 'findById'>>;
  let messageRepository: jest.Mocked<Repository<Message>>;
  let conversationRepository: jest.Mocked<Repository<Conversation>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const usersServiceMock = {
      findById: jest.fn(),
    };

    const messageRepositoryMock = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const conversationRepositoryMock = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Message),
          useValue: messageRepositoryMock,
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: conversationRepositoryMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
    usersService = module.get(UsersService);
    messageRepository = module.get(getRepositoryToken(Message));
    conversationRepository = module.get(getRepositoryToken(Conversation));
  });

  it('should be defined', () => {
    expect(chatService).toBeDefined();
  });

  describe('findConversation', () => {
    it('should return an existing conversation', async () => {
      const existingConversation = { id: 1 } as Conversation;

      conversationRepository.findOne.mockResolvedValue(existingConversation);

      const result = await chatService.findConversation(1, 2);

      expect(result).toEqual(existingConversation);
      expect(conversationRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            usuario_1: { id: 1 },
            usuario_2: { id: 2 },
          },
          {
            usuario_1: { id: 2 },
            usuario_2: { id: 1 },
          },
        ],
      });
    });

    it('should throw BadRequestException when users are the same', async () => {
      await expect(chatService.findConversation(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findMessagesByConversation', () => {
    it('should return messages when conversation exists', async () => {
      const mockConversation = { id: 1 } as Conversation;
      const mockMessages = [
        { id: 2, mensagem: 'Tudo bem?' },
        { id: 1, mensagem: 'Oi' },
      ] as Message[];

      conversationRepository.findOneBy.mockResolvedValue(mockConversation);
      messageRepository.find.mockResolvedValue(mockMessages);

      const result = await chatService.findMessagesByConversation(1, {
        limit: 30,
      });

      expect(result).toEqual({
        data: mockMessages,
        nextCursor: null,
        hasMore: false,
      });
      expect(conversationRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(messageRepository.find).toHaveBeenCalledWith({
        where: {
          conversa: {
            id: 1,
          },
        },
        relations: ['remetente', 'destinatario'],
        order: {
          id: 'DESC',
        },
        take: 31,
      });
    });

    it('should return next cursor when there are more messages', async () => {
      const mockConversation = { id: 1 } as Conversation;
      const mockMessages = [
        { id: 5, mensagem: 'Mais nova' },
        { id: 4, mensagem: 'Intermediaria' },
        { id: 3, mensagem: 'Extra' },
      ] as Message[];

      conversationRepository.findOneBy.mockResolvedValue(mockConversation);
      messageRepository.find.mockResolvedValue(mockMessages);

      const result = await chatService.findMessagesByConversation(1, {
        limit: 2,
        cursor: 6,
      });

      expect(result).toEqual({
        data: [
          { id: 5, mensagem: 'Mais nova' },
          { id: 4, mensagem: 'Intermediaria' },
        ],
        nextCursor: 4,
        hasMore: true,
      });
      expect(messageRepository.find).toHaveBeenCalledWith({
        where: {
          conversa: {
            id: 1,
          },
          id: LessThan(6),
        },
        relations: ['remetente', 'destinatario'],
        order: {
          id: 'DESC',
        },
        take: 3,
      });
    });

    it('should throw NotFoundException when conversation does not exist', async () => {
      conversationRepository.findOneBy.mockResolvedValue(null);

      await expect(
        chatService.findMessagesByConversation(1, { limit: 30 }),
      ).rejects.toThrow(NotFoundException);

      expect(messageRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('createConversation', () => {
    it('should return existing conversation if it already exists', async () => {
      const existingConversation = {
        id: 1,
      } as Conversation;

      conversationRepository.findOne.mockResolvedValue(existingConversation);

      const result = await chatService.createConversation(1, 2);

      expect(result).toEqual(existingConversation);
      expect(conversationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should create a new conversation when it does not exist', async () => {
      const currentUser = { id: 1 } as never;
      const targetUser = { id: 2 } as never;
      const createdConversation: Partial<Conversation> = {
        usuario_1: currentUser,
        usuario_2: targetUser,
      };
      const savedConversation = {
        id: 10,
        ...createdConversation,
      } as Conversation;

      conversationRepository.findOne.mockResolvedValue(null);
      usersService.findById.mockResolvedValueOnce(currentUser);
      usersService.findById.mockResolvedValueOnce(targetUser);
      conversationRepository.create.mockReturnValue(
        createdConversation as Conversation,
      );
      conversationRepository.save.mockResolvedValue(savedConversation);

      const result = await chatService.createConversation(1, 2);

      expect(result).toEqual(savedConversation);
      expect(conversationRepository.create).toHaveBeenCalledWith({
        usuario_1: currentUser,
        usuario_2: targetUser,
      });
      expect(conversationRepository.save).toHaveBeenCalledWith(
        createdConversation,
      );
    });

    it('should throw NotFoundException when current user does not exist', async () => {
      conversationRepository.findOne.mockResolvedValue(null);
      usersService.findById.mockResolvedValueOnce(null);
      usersService.findById.mockResolvedValueOnce({ id: 2 } as never);

      await expect(chatService.createConversation(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('sendMessage', () => {
    it('should create and save a message', async () => {
      const conversation = { id: 1 } as Conversation;
      const sender = { id: 1 } as never;
      const recipient = { id: 2 } as never;
      const createdMessage = { mensagem: 'Oi' } as Message;
      const savedMessage = { id: 10, mensagem: 'Oi' } as Message;

      jest
        .spyOn(chatService, 'createConversation')
        .mockResolvedValue(conversation);
      usersService.findById.mockResolvedValueOnce(sender);
      usersService.findById.mockResolvedValueOnce(recipient);
      messageRepository.create.mockReturnValue(createdMessage);
      messageRepository.save.mockResolvedValue(savedMessage);

      const result = await chatService.sendMessage(1, 2, 'Oi');

      expect(result).toEqual(savedMessage);
      expect(messageRepository.create).toHaveBeenCalledWith({
        conversa: conversation,
        remetente: sender,
        destinatario: recipient,
        mensagem: 'Oi',
        lida: false,
        lida_em: null,
      });
      expect(messageRepository.save).toHaveBeenCalledWith(createdMessage);
    });

    it('should throw BadRequestException when message is empty', async () => {
      await expect(chatService.sendMessage(1, 2, '')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
