import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, Tipo } from './notification.entity';
import { NotificationRecipient } from './notification-recipient.entity';
import { UsersService } from '../users/user.service';
import { User } from '../users/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,

    @InjectRepository(NotificationRecipient)
    private readonly notificationRecipientsRepository: Repository<NotificationRecipient>,

    private readonly usersService: UsersService,
  ) {}

  async findAllByFirebaseUid(
    firebaseUid: string,
  ): Promise<NotificationRecipient[]> {
    const user = await this.getUserByFirebaseUid(firebaseUid);

    return this.notificationRecipientsRepository.find({
      where: {
        usuario: {
          id: user.id,
        },
      },
      relations: ['notificacao', 'usuario'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async markAsRead(
    notificationRecipientId: number,
  ): Promise<NotificationRecipient> {
    const recipient = await this.notificationRecipientsRepository.findOne({
      where: { id: notificationRecipientId },
      relations: ['notificacao', 'usuario'],
    });

    if (!recipient) {
      throw new NotFoundException(
        'Destinatário da notificação não encontrado.',
      );
    }

    recipient.lida = true;
    recipient.lida_em = new Date();

    return this.notificationRecipientsRepository.save(recipient);
  }

  async sendIndividualNotification(
    firebaseUid: string,
    destinatarioId: number,
    titulo: string,
    descricao: string,
    icone: string | null,
    rotaDestino: string | null,
    payload: Record<string, any> | null,
  ): Promise<NotificationRecipient> {
    const remetente = await this.getUserByFirebaseUid(firebaseUid);

    if (remetente.id === destinatarioId) {
      throw new BadRequestException(
        'Não é permitido enviar notificação para si mesmo.',
      );
    }

    const destinatario = await this.usersService.findById(destinatarioId);

    if (!destinatario) {
      throw new NotFoundException('Usuário destinatário não encontrado.');
    }

    const notification = this.notificationsRepository.create({
      tipo: Tipo.INDIVIDUAL,
      titulo,
      descricao,
      icone,
      rota_destino: rotaDestino,
      payload,
      criado_por_usuario: remetente,
    });

    const savedNotification =
      await this.notificationsRepository.save(notification);

    const recipient = this.notificationRecipientsRepository.create({
      notificacao: savedNotification,
      usuario: destinatario,
      lida: false,
      lida_em: null,
      entregue_push: false,
      entregue_push_em: null,
    });

    return this.notificationRecipientsRepository.save(recipient);
  }

  async sendGlobalNotification(
    firebaseUid: string,
    titulo: string,
    descricao: string,
    icone: string | null,
    rotaDestino: string | null,
    payload: Record<string, any> | null,
  ): Promise<NotificationRecipient[]> {
    const remetente = await this.getUserByFirebaseUid(firebaseUid);
    const users = await this.usersService.findAll();

    const destinatarios = users.filter((user) => user.id !== remetente.id);

    const notification = this.notificationsRepository.create({
      tipo: Tipo.GLOBAL,
      titulo,
      descricao,
      icone,
      rota_destino: rotaDestino,
      payload,
      criado_por_usuario: remetente,
    });

    const savedNotification =
      await this.notificationsRepository.save(notification);

    const recipients = destinatarios.map((usuario) =>
      this.notificationRecipientsRepository.create({
        notificacao: savedNotification,
        usuario,
        lida: false,
        lida_em: null,
        entregue_push: false,
        entregue_push_em: null,
      }),
    );

    return this.notificationRecipientsRepository.save(recipients);
  }

  private async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    if (!user) {
      throw new NotFoundException('Usuário autenticado não encontrado.');
    }

    return user;
  }
}
