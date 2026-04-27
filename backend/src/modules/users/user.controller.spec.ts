import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: { findAllPaginated: jest.Mock };

  beforeEach(async () => {
    const mockUsersService = {
      findAllPaginated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const pagination = { limit: 20 };
      const result = {
        data: [
          {
            id: 1,
            nome: 'Matheus',
            email: 'matheus@example.com',
          },
        ],
        nextCursor: null,
        hasMore: false,
      };

      usersService.findAllPaginated.mockResolvedValue(result);

      await expect(usersController.findAll(pagination)).resolves.toEqual(
        result,
      );
      expect(usersService.findAllPaginated).toHaveBeenCalledWith(pagination);
      expect(usersService.findAllPaginated).toHaveBeenCalledTimes(1);
    });
  });
});
