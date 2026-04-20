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
import { PushService } from '../push/push.service';
import { FirebaseAuthService } from '../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,

    @InjectRepository(NotificationRecipient)
    private readonly notificationRecipientsRepository: Repository<NotificationRecipient>,

    private readonly usersService: UsersService,
    private readonly pushService: PushService,
    private readonly firebaseService: FirebaseAuthService,
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
    const savedRecipient =
      await this.notificationRecipientsRepository.save(recipient);

    const pushDelivered = await this.sendPushNotification([destinatario.id], {
      title: titulo,
      description: descricao,
      destinationRoute: rotaDestino,
      payload,
    });

    if (pushDelivered) {
      savedRecipient.entregue_push = true;
      savedRecipient.entregue_push_em = new Date();

      return this.notificationRecipientsRepository.save(savedRecipient);
    }

    return savedRecipient;
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

    const destinatarios = users;

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
    const savedRecipients =
      await this.notificationRecipientsRepository.save(recipients);

    const pushDelivered = await this.sendPushNotification(
      destinatarios.map((usuario) => usuario.id),
      {
        title: titulo,
        description: descricao,
        destinationRoute: rotaDestino,
        payload,
      },
    );

    if (pushDelivered) {
      const deliveredAt = new Date();

      savedRecipients.forEach((recipient) => {
        recipient.entregue_push = true;
        recipient.entregue_push_em = deliveredAt;
      });

      return this.notificationRecipientsRepository.save(savedRecipients);
    }

    return savedRecipients;
  }

  private async sendPushNotification(
    userIds: number[],
    notification: {
      title: string;
      description: string;
      destinationRoute?: string | null;
      payload?: Record<string, any> | null;
    },
  ): Promise<boolean> {
    const tokens = await this.pushService.findActiveTokensByUserIds(userIds);

    if (!tokens.length) {
      console.log('Nenhum push token encontrado para os usuários', { userIds });
      return false;
    }

    const response = await this.firebaseService.sendPushNotificationToTokens(
      tokens,
      {
        title: notification.title,
        body: notification.description,
        route: notification.destinationRoute ?? null,
        payload: notification.payload ?? null,
      },
    );

    return (
      (response?.successCount ?? 0) > 0 && (response?.failureCount ?? 0) === 0
    );
  }

  private async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    if (!user) {
      throw new NotFoundException('Usuário autenticado não encontrado.');
    }

    return user;
  }
}
