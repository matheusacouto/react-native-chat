import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppParameter } from './app-parameters.entity';

@Injectable()
export class AppParametersService {
  constructor(
    @InjectRepository(AppParameter)
    private readonly appParametersRepository: Repository<AppParameter>,
  ) {}

  findAll(): Promise<AppParameter[]> {
    return this.appParametersRepository.find({
      order: {
        chave: 'ASC',
      },
    });
  }

  findActive(): Promise<AppParameter[]> {
    return this.appParametersRepository.find({
      where: {
        ativo: true,
      },
      order: {
        chave: 'ASC',
      },
    });
  }

  async findByKey(chave: string): Promise<AppParameter> {
    const parameter = await this.appParametersRepository.findOneBy({ chave });

    if (!parameter) {
      throw new NotFoundException('Parâmetro do app não encontrado.');
    }

    return parameter;
  }
}
