import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppParameter } from './app-parameters.entity';
import { AppParametersService } from './app-parameters.service';

describe('AppParametersService', () => {
  let appParametersService: AppParametersService;
  let appParametersRepository: jest.Mocked<Repository<AppParameter>>;

  beforeEach(async () => {
    const appParametersRepositoryMock = {
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppParametersService,
        {
          provide: getRepositoryToken(AppParameter),
          useValue: appParametersRepositoryMock,
        },
      ],
    }).compile();

    appParametersService = module.get<AppParametersService>(AppParametersService);
    appParametersRepository = module.get(getRepositoryToken(AppParameter));
  });

  it('should be defined', () => {
    expect(appParametersService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all app parameters ordered by chave', async () => {
      const parameters = [{ id: 1 }, { id: 2 }] as AppParameter[];

      appParametersRepository.find.mockResolvedValue(parameters);

      const result = await appParametersService.findAll();

      expect(result).toEqual(parameters);
      expect(appParametersRepository.find).toHaveBeenCalledWith({
        order: {
          chave: 'ASC',
        },
      });
    });
  });

  describe('findActive', () => {
    it('should return active app parameters ordered by chave', async () => {
      const parameters = [{ id: 1, ativo: true }] as AppParameter[];

      appParametersRepository.find.mockResolvedValue(parameters);

      const result = await appParametersService.findActive();

      expect(result).toEqual(parameters);
      expect(appParametersRepository.find).toHaveBeenCalledWith({
        where: {
          ativo: true,
        },
        order: {
          chave: 'ASC',
        },
      });
    });
  });

  describe('findByKey', () => {
    it('should return parameter when chave exists', async () => {
      const parameter = { id: 1, chave: 'home_title' } as AppParameter;

      appParametersRepository.findOneBy.mockResolvedValue(parameter);

      const result = await appParametersService.findByKey('home_title');

      expect(result).toEqual(parameter);
      expect(appParametersRepository.findOneBy).toHaveBeenCalledWith({
        chave: 'home_title',
      });
    });

    it('should throw NotFoundException when chave does not exist', async () => {
      appParametersRepository.findOneBy.mockResolvedValue(null);

      await expect(
        appParametersService.findByKey('unknown_key'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
