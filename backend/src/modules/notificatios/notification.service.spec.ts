import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/user.service';
import { NotificationsService } from './notification.service';
import { Notification, Tipo } from './notification.entity';
import { NotificationRecipient } from './notification-recipient.entity';
import { User } from '../users/user.entity';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'findAll' | 'findById' | 'findByFirebaseUid'>
  >;
  let notificationsRepository: jest.Mocked<Repository<Notification>>;
  let notificationRecipientsRepository: jest.Mocked<
    Repository<NotificationRecipient>
  >;

  beforeEach(async () => {
    jest.clearAllMocks();

    const usersServiceMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByFirebaseUid: jest.fn(),
    };

    const notificationsRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const notificationRecipientsRepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: notificationsRepositoryMock,
        },
        {
          provide: getRepositoryToken(NotificationRecipient),
          useValue: notificationRecipientsRepositoryMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    notificationsService =
      module.get<NotificationsService>(NotificationsService);
    usersService = module.get(UsersService);
    notificationsRepository = module.get(getRepositoryToken(Notification));
    notificationRecipientsRepository = module.get(
      getRepositoryToken(NotificationRecipient),
    );
  });

  it('should be defined', () => {
    expect(notificationsService).toBeDefined();
  });

  describe('findAllByFirebaseUid', () => {
    it('should return notifications for the authenticated user', async () => {
      const user: Pick<User, 'id' | 'firebase_uid'> = {
        id: 1,
        firebase_uid: 'firebase-123',
      };
      const recipients = [{ id: 1 }, { id: 2 }] as NotificationRecipient[];

      usersService.findByFirebaseUid.mockResolvedValue(user as User);
      notificationRecipientsRepository.find.mockResolvedValue(recipients);

      const result =
        await notificationsService.findAllByFirebaseUid('firebase-123');

      expect(result).toEqual(recipients);
      expect(usersService.findByFirebaseUid).toHaveBeenCalledWith(
        'firebase-123',
      );
      expect(notificationRecipientsRepository.find).toHaveBeenCalledWith({
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
    });

    it('should throw NotFoundException when authenticated user is not found', async () => {
      usersService.findByFirebaseUid.mockResolvedValue(null);

      await expect(
        notificationsService.findAllByFirebaseUid('firebase-123'),
      ).rejects.toThrow(NotFoundException);

      expect(notificationRecipientsRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification recipient as read', async () => {
      const recipient = {
        id: 1,
        lida: false,
        lida_em: null,
      } as NotificationRecipient;

      const savedRecipient = {
        ...recipient,
        lida: true,
      } as NotificationRecipient;

      notificationRecipientsRepository.findOne.mockResolvedValue(recipient);
      notificationRecipientsRepository.save.mockResolvedValue(savedRecipient);

      const result = await notificationsService.markAsRead(1);

      expect(result).toEqual(savedRecipient);
      expect(notificationRecipientsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['notificacao', 'usuario'],
      });
      expect(recipient.lida).toBe(true);
      expect(recipient.lida_em).toBeInstanceOf(Date);
      expect(notificationRecipientsRepository.save).toHaveBeenCalledWith(
        recipient,
      );
    });

    it('should throw NotFoundException when recipient does not exist', async () => {
      notificationRecipientsRepository.findOne.mockResolvedValue(null);

      await expect(notificationsService.markAsRead(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('sendIndividualNotification', () => {
    it('should create and save an individual notification', async () => {
      const remetente: Pick<User, 'id' | 'firebase_uid'> = {
        id: 1,
        firebase_uid: 'firebase-123',
      };
      const destinatario: Pick<User, 'id'> = { id: 2 };
      const createdNotification = {
        tipo: Tipo.INDIVIDUAL,
      } as Partial<Notification>;
      const savedNotification = {
        id: 10,
        tipo: Tipo.INDIVIDUAL,
      } as Partial<Notification>;
      const createdRecipient = {
        notificacao: savedNotification,
        usuario: destinatario,
      } as Partial<NotificationRecipient>;
      const savedRecipient = {
        id: 20,
        ...createdRecipient,
      } as Partial<NotificationRecipient>;

      usersService.findByFirebaseUid.mockResolvedValue(remetente as User);
      usersService.findById.mockResolvedValue(destinatario as User);
      notificationsRepository.create.mockReturnValue(
        createdNotification as Notification,
      );
      notificationsRepository.save.mockResolvedValue(
        savedNotification as Notification,
      );
      notificationRecipientsRepository.create.mockReturnValue(
        createdRecipient as NotificationRecipient,
      );
      notificationRecipientsRepository.save.mockResolvedValue(
        savedRecipient as NotificationRecipient,
      );

      const result = await notificationsService.sendIndividualNotification(
        'firebase-123',
        2,
        'Titulo',
        'Descricao',
        'icon',
        'Home',
        { key: 'value' },
      );

      expect(result).toEqual(savedRecipient);
      expect(notificationsRepository.create).toHaveBeenCalledWith({
        tipo: Tipo.INDIVIDUAL,
        titulo: 'Titulo',
        descricao: 'Descricao',
        icone: 'icon',
        rota_destino: 'Home',
        payload: { key: 'value' },
        criado_por_usuario: remetente,
      });
      expect(notificationRecipientsRepository.create).toHaveBeenCalledWith({
        notificacao: savedNotification,
        usuario: destinatario,
        lida: false,
        lida_em: null,
        entregue_push: false,
        entregue_push_em: null,
      });
    });

    it('should throw BadRequestException when sending notification to self', async () => {
      const remetente: Pick<User, 'id' | 'firebase_uid'> = {
        id: 1,
        firebase_uid: 'firebase-123',
      };

      usersService.findByFirebaseUid.mockResolvedValue(remetente as User);

      await expect(
        notificationsService.sendIndividualNotification(
          'firebase-123',
          1,
          'Titulo',
          'Descricao',
          null,
          null,
          null,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when recipient user does not exist', async () => {
      const remetente: Pick<User, 'id' | 'firebase_uid'> = {
        id: 1,
        firebase_uid: 'firebase-123',
      };

      usersService.findByFirebaseUid.mockResolvedValue(remetente as User);
      usersService.findById.mockResolvedValue(null);

      await expect(
        notificationsService.sendIndividualNotification(
          'firebase-123',
          2,
          'Titulo',
          'Descricao',
          null,
          null,
          null,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendGlobalNotification', () => {
    it('should create a global notification and recipients for all users except sender', async () => {
      const remetente: Pick<User, 'id' | 'firebase_uid'> = {
        id: 1,
        firebase_uid: 'firebase-123',
      };
      const users: Array<Pick<User, 'id'> | Pick<User, 'id' | 'firebase_uid'>> =
        [remetente, { id: 2 }, { id: 3 }];
      const createdNotification = {
        tipo: Tipo.GLOBAL,
      } as Partial<Notification>;
      const savedNotification = {
        id: 30,
        tipo: Tipo.GLOBAL,
      } as Partial<Notification>;
      const createdRecipients = [
        { usuario: users[1] },
        { usuario: users[2] },
      ] as Partial<NotificationRecipient>[];
      const savedRecipients = [
        { id: 40, ...createdRecipients[0] },
        { id: 41, ...createdRecipients[1] },
      ] as Partial<NotificationRecipient>[];

      usersService.findByFirebaseUid.mockResolvedValue(remetente as User);
      usersService.findAll.mockResolvedValue(users as User[]);
      notificationsRepository.create.mockReturnValue(
        createdNotification as Notification,
      );
      notificationsRepository.save.mockResolvedValue(
        savedNotification as Notification,
      );
      notificationRecipientsRepository.create
        .mockReturnValueOnce(createdRecipients[0] as NotificationRecipient)
        .mockReturnValueOnce(createdRecipients[1] as NotificationRecipient);
      (notificationRecipientsRepository.save as jest.Mock).mockResolvedValue(
        savedRecipients as NotificationRecipient[],
      );

      const result = await notificationsService.sendGlobalNotification(
        'firebase-123',
        'Titulo',
        'Descricao',
        'icon',
        'Home',
        { key: 'value' },
      );

      expect(result).toEqual(savedRecipients);
      expect(usersService.findAll).toHaveBeenCalledTimes(1);
      expect(notificationRecipientsRepository.create).toHaveBeenCalledTimes(2);
      expect(notificationRecipientsRepository.save).toHaveBeenCalledWith(
        createdRecipients,
      );
    });
  });
});
