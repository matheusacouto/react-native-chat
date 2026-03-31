import { Test, TestingModule } from '@nestjs/testing';
import { AppParametersController } from './app-parameters.controller';
import { AppParametersService } from './app-parameters.service';

describe('AppParametersController', () => {
  let appParametersController: AppParametersController;
  let appParametersService: {
    findAll: jest.Mock;
    findActive: jest.Mock;
    findByKey: jest.Mock;
  };

  beforeEach(async () => {
    const mockAppParametersService = {
      findAll: jest.fn(),
      findActive: jest.fn(),
      findByKey: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppParametersController],
      providers: [
        {
          provide: AppParametersService,
          useValue: mockAppParametersService,
        },
      ],
    }).compile();

    appParametersController = module.get<AppParametersController>(
      AppParametersController,
    );
    appParametersService = module.get(AppParametersService);
  });

  it('should be defined', () => {
    expect(appParametersController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all app parameters', async () => {
      const result = [{ id: 1 }, { id: 2 }];

      appParametersService.findAll.mockResolvedValue(result);

      const response = await appParametersController.findAll();

      expect(appParametersService.findAll).toHaveBeenCalledTimes(1);
      expect(response).toEqual(result);
    });
  });

  describe('findActive', () => {
    it('should return active app parameters', async () => {
      const result = [{ id: 1, ativo: true }];

      appParametersService.findActive.mockResolvedValue(result);

      const response = await appParametersController.findActive();

      expect(appParametersService.findActive).toHaveBeenCalledTimes(1);
      expect(response).toEqual(result);
    });
  });

  describe('findByKey', () => {
    it('should return parameter by key', async () => {
      const result = { id: 1, chave: 'home_title' };

      appParametersService.findByKey.mockResolvedValue(result);

      const response = await appParametersController.findByKey('home_title');

      expect(appParametersService.findByKey).toHaveBeenCalledWith('home_title');
      expect(appParametersService.findByKey).toHaveBeenCalledTimes(1);
      expect(response).toEqual(result);
    });
  });
});
