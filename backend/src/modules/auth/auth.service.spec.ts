import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as admin from 'firebase-admin';
import { FirebaseAuthService } from '../firebase/firebase.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findByFirebaseUid'>>;
  let firebaseService: jest.Mocked<Pick<FirebaseAuthService, 'verifyIdToken'>>;

  const firebaseServiceMock = {
    verifyIdToken: jest.fn(),
  };

  const usersServiceMock = {
    findByFirebaseUid: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseAuthService,
          useValue: firebaseServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    firebaseService = module.get(FirebaseAuthService);
  });

  describe('loginWithFirebase', () => {
    it('should return an user when token is valid and user exist', async () => {
      const idToken = 'valid-id-token';
      const firebaseUid = 'firebase-uid-123';
      const decodedToken = {
        uid: firebaseUid,
      } as admin.auth.DecodedIdToken;
      const user = {
        id: 1,
        firebase_uid: firebaseUid,
        nome: 'Matheus',
        data_nascimento: null,
        email: 'matheus@example.com',
        telefone_pais: null,
        telefone_ddd: null,
        telefone_numero: null,
        sexo: null,
        provider_auth: 'firebase',
        status: 'ativo',
        ultimo_login_em: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      firebaseService.verifyIdToken.mockResolvedValue(decodedToken);
      usersService.findByFirebaseUid.mockResolvedValue(user);

      const result = await authService.loginWithFirebase(idToken);

      expect(result).toEqual(user);
      expect(firebaseService.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(firebaseService.verifyIdToken).toHaveBeenCalledTimes(1);
      expect(usersService.findByFirebaseUid).toHaveBeenCalledWith(firebaseUid);
      expect(usersService.findByFirebaseUid).toHaveBeenCalledTimes(1);
    });

    it('should throw a NotFoundException error when user doesnt exist on database', async () => {
      const idToken = 'valid-id-token';
      const firebaseUid = 'firebase-uid-123';
      const decodedToken = {
        uid: firebaseUid,
      } as admin.auth.DecodedIdToken;

      firebaseService.verifyIdToken.mockResolvedValue(decodedToken);
      usersService.findByFirebaseUid.mockResolvedValue(null);

      await expect(authService.loginWithFirebase(idToken)).rejects.toThrow(
        NotFoundException,
      );

      expect(firebaseService.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(usersService.findByFirebaseUid).toHaveBeenCalledWith(firebaseUid);
    });

    it('should throw an error when token is invalid', async () => {
      const idToken = 'invalid-id-token';
      const error = new Error('Invalid Firebase token');

      firebaseService.verifyIdToken.mockRejectedValue(error);

      await expect(authService.loginWithFirebase(idToken)).rejects.toThrow(
        error,
      );

      expect(firebaseService.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(usersService.findByFirebaseUid).not.toHaveBeenCalled();
    });
  });
});
