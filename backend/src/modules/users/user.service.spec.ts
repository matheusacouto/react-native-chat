import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './user.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should return an array of user when called', async () => {
      const users = [];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByEmail', () => {
    it('should look up an user by e-mail', async () => {
      const user = { id: 1, email: 'matheus@example.com' } as User;
      repository.findOneBy.mockResolvedValue(user);

      const result = await service.findByEmail('matheus@example.com');

      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: 'matheus@example.com',
      });
    });
  });

  describe('syncFirebaseIdentity', () => {
    it('should update the firebase identity data for an user', async () => {
      const ultimoLoginEm = new Date();

      await service.syncFirebaseIdentity(1, {
        firebase_uid: 'firebase-123',
        nome: 'Matheus',
        provider_auth: 'password',
        ultimo_login_em: ultimoLoginEm,
      });

      expect(repository.update).toHaveBeenCalledWith(1, {
        firebase_uid: 'firebase-123',
        nome: 'Matheus',
        provider_auth: 'password',
        ultimo_login_em: ultimoLoginEm,
      });
    });
  });
});
