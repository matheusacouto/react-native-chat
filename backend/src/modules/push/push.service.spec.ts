import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushToken } from './push-token.entity';
import { PushService } from './push.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/user.service';

describe('PushService', () => {
  let pushService: PushService;
  let pushTokenRepository: jest.Mocked<Repository<PushToken>>;
  let usersService: jest.Mocked<Pick<UsersService, 'findByFirebaseUid'>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const pushTokenRepositoryMock = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const usersServiceMock = {
      findByFirebaseUid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
        {
          provide: getRepositoryToken(PushToken),
          useValue: pushTokenRepositoryMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    pushService = module.get(PushService);
    pushTokenRepository = module.get(getRepositoryToken(PushToken));
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(pushService).toBeDefined();
  });

  describe('registerToken', () => {
    it('should create a new push token when token does not exist yet', async () => {
      const user = { id: 1, firebase_uid: 'firebase-123' } as User;
      const createdPushToken = {
        usuario: user,
        token: 'push-token-1',
        plataforma: 'android',
        ativo: true,
      } as PushToken;
      const savedPushToken = {
        id: 10,
        ...createdPushToken,
      } as PushToken;

      usersService.findByFirebaseUid.mockResolvedValue(user);
      pushTokenRepository.findOne.mockResolvedValue(null);
      pushTokenRepository.create.mockReturnValue(createdPushToken);
      pushTokenRepository.save.mockResolvedValue(savedPushToken);

      const result = await pushService.registerToken(
        'firebase-123',
        'push-token-1',
        'android',
      );

      expect(result).toEqual(savedPushToken);
      expect(usersService.findByFirebaseUid).toHaveBeenCalledWith(
        'firebase-123',
      );
      expect(pushTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: 'push-token-1' },
        relations: ['usuario'],
      });
      expect(pushTokenRepository.create).toHaveBeenCalledWith({
        usuario: user,
        token: 'push-token-1',
        plataforma: 'android',
        ativo: true,
      });
      expect(pushTokenRepository.save).toHaveBeenCalledWith(createdPushToken);
    });

    it('should reactivate and update an existing push token', async () => {
      const user = { id: 2, firebase_uid: 'firebase-456' } as User;
      const existingPushToken = {
        id: 20,
        token: 'push-token-2',
        plataforma: 'ios',
        ativo: false,
        usuario: { id: 1 } as User,
      } as PushToken;
      const updatedPushToken = {
        ...existingPushToken,
        usuario: user,
        plataforma: 'android',
        ativo: true,
      } as PushToken;

      usersService.findByFirebaseUid.mockResolvedValue(user);
      pushTokenRepository.findOne.mockResolvedValue(existingPushToken);
      pushTokenRepository.save.mockResolvedValue(updatedPushToken);

      const result = await pushService.registerToken(
        'firebase-456',
        'push-token-2',
        'android',
      );

      expect(result).toEqual(updatedPushToken);
      expect(pushTokenRepository.create).not.toHaveBeenCalled();
      expect(existingPushToken.usuario).toEqual(user);
      expect(existingPushToken.plataforma).toBe('android');
      expect(existingPushToken.ativo).toBe(true);
      expect(pushTokenRepository.save).toHaveBeenCalledWith(existingPushToken);
    });

    it('should throw NotFoundException when authenticated user is not found', async () => {
      usersService.findByFirebaseUid.mockResolvedValue(null);

      await expect(
        pushService.registerToken('firebase-unknown', 'push-token-3', 'ios'),
      ).rejects.toThrow(NotFoundException);

      expect(pushTokenRepository.findOne).not.toHaveBeenCalled();
      expect(pushTokenRepository.create).not.toHaveBeenCalled();
      expect(pushTokenRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findActiveTokensByUserIds', () => {
    it('should return an empty array when user ids list is empty', async () => {
      const result = await pushService.findActiveTokensByUserIds([]);

      expect(result).toEqual([]);
      expect(pushTokenRepository.find).not.toHaveBeenCalled();
    });

    it('should return only the token strings from active push tokens', async () => {
      const pushTokens = [
        { id: 1, token: 'token-1' },
        { id: 2, token: 'token-2' },
      ] as PushToken[];

      pushTokenRepository.find.mockResolvedValue(pushTokens);

      const result = await pushService.findActiveTokensByUserIds([1, 2]);

      expect(result).toEqual(['token-1', 'token-2']);
      expect(pushTokenRepository.find).toHaveBeenCalledTimes(1);
      expect(pushTokenRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usuario: expect.any(Object),
            ativo: true,
          }),
          relations: ['usuario'],
        }),
      );
    });
  });

  describe('unregisterToken', () => {
    it('should deactivate an existing token for the authenticated user', async () => {
      const existingPushToken = {
        id: 30,
        token: 'push-token-logout',
        ativo: true,
        usuario: {
          id: 1,
          firebase_uid: 'firebase-123',
        } as User,
      } as PushToken;
      const updatedPushToken = {
        ...existingPushToken,
        ativo: false,
      } as PushToken;

      pushTokenRepository.findOne.mockResolvedValue(existingPushToken);
      pushTokenRepository.save.mockResolvedValue(updatedPushToken);

      const result = await pushService.unregisterToken(
        'firebase-123',
        'push-token-logout',
      );

      expect(result).toEqual(updatedPushToken);
      expect(pushTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          token: 'push-token-logout',
          usuario: {
            firebase_uid: 'firebase-123',
          },
        },
        relations: ['usuario'],
      });
      expect(existingPushToken.ativo).toBe(false);
      expect(pushTokenRepository.save).toHaveBeenCalledWith(existingPushToken);
    });

    it('should return null when token does not belong to authenticated user', async () => {
      pushTokenRepository.findOne.mockResolvedValue(null);

      const result = await pushService.unregisterToken(
        'firebase-123',
        'push-token-unknown',
      );

      expect(result).toBeNull();
      expect(pushTokenRepository.save).not.toHaveBeenCalled();
    });
  });
});
