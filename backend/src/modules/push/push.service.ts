import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PushToken } from './push-token.entity';
import { UsersService } from '../users/user.service';

@Injectable()
export class PushService {
  constructor(
    @InjectRepository(PushToken)
    private readonly pushTokenRepository: Repository<PushToken>,

    private readonly usersService: UsersService,
  ) {}

  async registerToken(
    firebaseUid: string,
    token: string,
    platform: string,
  ): Promise<PushToken> {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const existingToken = await this.pushTokenRepository.findOne({
      where: { token },
      relations: ['usuario'],
    });

    if (existingToken) {
      existingToken.usuario = user;
      existingToken.plataforma = platform;
      existingToken.ativo = true;

      return this.pushTokenRepository.save(existingToken);
    }

    const pushToken = this.pushTokenRepository.create({
      usuario: user,
      token,
      plataforma: platform,
      ativo: true,
    });

    return this.pushTokenRepository.save(pushToken);
  }

  async unregisterToken(
    firebaseUid: string,
    token: string,
  ): Promise<PushToken | null> {
    const existingToken = await this.pushTokenRepository.findOne({
      where: {
        token,
        usuario: {
          firebase_uid: firebaseUid,
        },
      },
      relations: ['usuario'],
    });

    if (!existingToken) {
      return null;
    }

    existingToken.ativo = false;

    return this.pushTokenRepository.save(existingToken);
  }

  async findActiveTokensByUserIds(userIds: number[]): Promise<string[]> {
    if (!userIds.length) {
      return [];
    }

    const pushTokens = await this.pushTokenRepository.find({
      where: {
        usuario: {
          id: In(userIds),
        },
        ativo: true,
      },
      relations: ['usuario'],
    });

    return pushTokens.map((pushToken) => pushToken.token);
  }
}
