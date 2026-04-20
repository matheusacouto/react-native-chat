import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { PushController } from './push.controller';
import { PushService } from './push.service';

describe('PushController', () => {
  let pushController: PushController;
  let pushService: {
    registerToken: jest.Mock;
  };

  beforeEach(async () => {
    const mockPushService = {
      registerToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushController],
      providers: [
        {
          provide: PushService,
          useValue: mockPushService,
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    pushController = module.get(PushController);
    pushService = module.get(PushService);
  });

  it('should be defined', () => {
    expect(pushController).toBeDefined();
  });

  describe('registerToken', () => {
    it('should call service with authenticated uid and dto values', async () => {
      const req = {
        user: {
          uid: 'firebase-123',
        },
      };
      const body: RegisterPushTokenDto = {
        token: 'push-token-1',
        platform: 'android',
      };
      const result = { id: 1, token: body.token, plataforma: body.platform };

      pushService.registerToken.mockResolvedValue(result);

      const response = await pushController.registerToken(req, body);

      expect(pushService.registerToken).toHaveBeenCalledWith(
        'firebase-123',
        body.token,
        body.platform,
      );
      expect(pushService.registerToken).toHaveBeenCalledTimes(1);
      expect(response).toEqual(result);
    });
  });
});
