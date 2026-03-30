import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginWithFireBaseDto } from './dto/login-with-firebase-dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: { loginWithFirebase: jest.Mock };

  beforeEach(async () => {
    const mockAuthService = {
      loginWithFirebase: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('loginWithFirebase', () => {
    it('should call authService with idToken and return its result', async () => {
      const body: LoginWithFireBaseDto = {
        idToken: 'valid-id-token',
      };

      const user = { id: 1, firebase_uid: 'firebase-123' };

      authService.loginWithFirebase.mockResolvedValue(user);

      const result = await authController.loginWithFirebase(body);

      expect(authService.loginWithFirebase).toHaveBeenCalledWith(body.idToken);
      expect(authService.loginWithFirebase).toHaveBeenCalledTimes(1);
      expect(result).toEqual(user);
    });
  });
});
