import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entity/message.entity';
import { Repository } from 'typeorm';
import { Conversation } from './entity/conversation.entity';
import { UsersService } from '../users/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    private readonly userService: UsersService,
  ) {}

  /**
   * Busca uma conversa por ID
   * @param {number} currentUserId - Id do primeiro usuário
   * @param {number} targetUserId - Id do segundo usuário
   */
  async findConversation(
    currentUserId: number,
    targetUserId: number,
  ): Promise<Conversation | null> {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('O destinatário não pode ser o remetente');
    }

    if (targetUserId == null) {
      throw new BadRequestException(
        'O destinatário não foi encontrado na base de dados',
      );
    }

    const conversation = await this.conversationRepository.findOne({
      where: [
        {
          usuario_1: { id: currentUserId },
          usuario_2: { id: targetUserId },
        },
        {
          usuario_1: { id: targetUserId },
          usuario_2: { id: currentUserId },
        },
      ],
    });

    return conversation || null;
  }

  async findMessagesByConversation(conversationId: number): Promise<Message[]> {
    const conversation = await this.conversationRepository.findOneBy({
      id: conversationId,
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    return this.messageRepository.find({
      where: {
        conversa: {
          id: conversationId,
        },
      },
      relations: ['remetente', 'destinatario', 'conversa'],
      order: {
        created_at: 'ASC',
      },
    });
  }

  /**
   *
   */
  async createConversation(
    currentUserId: number,
    targetUserId: number,
  ): Promise<Conversation> {
    if (currentUserId === targetUserId) {
      throw new BadRequestException(
        'Não é permitido criar conversa com o próprio usuário.',
      );
    }

    const conversation = await this.findConversation(
      currentUserId,
      targetUserId,
    );

    if (conversation) {
      return conversation;
    }

    const currentUser = await this.userService.findById(currentUserId);
    const targetUser = await this.userService.findById(targetUserId);

    if (!currentUser) {
      throw new NotFoundException('Usuário atual não encontrado.');
    }

    if (!targetUser) {
      throw new NotFoundException('Usuário de destino não encontrado.');
    }

    const newConversation = this.conversationRepository.create({
      usuario_1: currentUser,
      usuario_2: targetUser,
    });

    return this.conversationRepository.save(newConversation);
  }

  async sendMessage(
    currentUserId: number,
    targetUserId: number,
    texto: string,
  ): Promise<Message> {
    if (!texto) {
      throw new BadRequestException('A mensagem não pode ser vazia');
    }

    const conversation = await this.createConversation(
      currentUserId,
      targetUserId,
    );

    const sender = await this.userService.findById(currentUserId);
    const recipient = await this.userService.findById(targetUserId);

    if (!sender) {
      throw new NotFoundException('Usuário remetente não encontrado.');
    }

    if (!recipient) {
      throw new NotFoundException('Usuário destinatário não encontrado.');
    }

    const message = this.messageRepository.create({
      conversa: conversation,
      remetente: sender,
      destinatario: recipient,
      mensagem: texto,
      lida: false,
      lida_em: null,
    });

    return this.messageRepository.save(message);
  }
}
