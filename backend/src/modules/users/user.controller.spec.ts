import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: { findAll: jest.Mock };

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result: User[] = [
        {
          id: 1,
          firebase_uid: 'firebase-123',
          nome: 'Matheus',
          data_nascimento: null,
          email: 'matheus@example.com',
          telefone_pais: null,
          telefone_ddd: null,
          telefone_numero: null,
          sexo: null,
          provider_auth: 'google',
          status: 'ativo',
          ultimo_login_em: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      usersService.findAll.mockResolvedValue(result);

      await expect(usersController.findAll()).resolves.toEqual(result);
      expect(usersService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
