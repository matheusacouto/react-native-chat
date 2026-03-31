import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notification.controller';
import { NotificationsService } from './notification.service';
import { SendIndividualNotificationDto } from './dto/send-individual-notification.dto';
import { SendGlobalNotificationDto } from './dto/send-global-notification.dto';

import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

describe('NotificationsController', () => {
  let notificationsController: NotificationsController;
  let notificationsService: {
    findAllByFirebaseUid: jest.Mock;
    markAsRead: jest.Mock;
    sendIndividualNotification: jest.Mock;
    sendGlobalNotification: jest.Mock;
  };

  beforeEach(async () => {
    const mockNotificationsService = {
      findAllByFirebaseUid: jest.fn(),
      markAsRead: jest.fn(),
      sendIndividualNotification: jest.fn(),
      sendGlobalNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    notificationsController = module.get<NotificationsController>(
      NotificationsController,
    );
    notificationsService = module.get(NotificationsService);
  });

  describe('findAll', () => {
    it('should return notifications for authenticated user', async () => {
      const req = {
        user: {
          uid: 'firebase-123',
        },
      };

      const result = [{ id: 1 }, { id: 2 }];

      notificationsService.findAllByFirebaseUid.mockResolvedValue(result);

      const response = await notificationsController.findAll(req);

      expect(notificationsService.findAllByFirebaseUid).toHaveBeenCalledWith(
        'firebase-123',
      );
      expect(notificationsService.findAllByFirebaseUid).toHaveBeenCalledTimes(
        1,
      );
      expect(response).toEqual(result);
    });
  });

  describe('markAsRead', () => {
    it('should call service with recipient id converted to number', async () => {
      const recipientId = '1';
      const result = { id: 1, lida: true };

      notificationsService.markAsRead.mockResolvedValue(result);

      const response = await notificationsController.markAsRead(recipientId);

      expect(notificationsService.markAsRead).toHaveBeenCalledWith(1);
      expect(notificationsService.markAsRead).toHaveBeenCalledTimes(1);
      expect(response).toEqual(result);
    });
  });

  describe('sendIndividualNotification', () => {
    it('should call service with authenticated uid and dto values', async () => {
      const req = {
        user: {
          uid: 'firebase-123',
        },
      };

      const body: SendIndividualNotificationDto = {
        recipientId: 2,
        title: 'Titulo',
        description: 'Descricao',
        icon: 'bell',
        destinationRoute: 'Home',
        payload: { key: 'value' },
      };

      const result = { id: 10 };

      notificationsService.sendIndividualNotification.mockResolvedValue(result);

      const response = await notificationsController.sendIndividualNotification(
        req,
        body,
      );

      expect(
        notificationsService.sendIndividualNotification,
      ).toHaveBeenCalledWith(
        'firebase-123',
        body.recipientId,
        body.title,
        body.description,
        body.icon,
        body.destinationRoute,
        body.payload,
      );
      expect(
        notificationsService.sendIndividualNotification,
      ).toHaveBeenCalledTimes(1);
      expect(response).toEqual(result);
    });
  });

  describe('sendGlobalNotification', () => {
    it('should call service with authenticated uid and dto values', async () => {
      const req = {
        user: {
          uid: 'firebase-123',
        },
      };

      const body: SendGlobalNotificationDto = {
        title: 'Titulo',
        description: 'Descricao',
        icon: 'bell',
        destinationRoute: 'Home',
        payload: { key: 'value' },
      };

      const result = [{ id: 1 }, { id: 2 }];

      notificationsService.sendGlobalNotification.mockResolvedValue(result);

      const response = await notificationsController.sendGlobalNotification(
        req,
        body,
      );

      expect(notificationsService.sendGlobalNotification).toHaveBeenCalledWith(
        'firebase-123',
        body.title,
        body.description,
        body.icon,
        body.destinationRoute,
        body.payload,
      );
      expect(notificationsService.sendGlobalNotification).toHaveBeenCalledTimes(
        1,
      );
      expect(response).toEqual(result);
    });
  });
});
