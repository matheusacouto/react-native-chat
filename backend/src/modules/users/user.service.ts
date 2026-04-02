import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

type UserData = Pick<
  User,
  | 'firebase_uid'
  | 'nome'
  | 'data_nascimento'
  | 'email'
  | 'telefone_pais'
  | 'telefone_ddd'
  | 'telefone_numero'
  | 'sexo'
  | 'provider_auth'
  | 'status'
  | 'ultimo_login_em'
>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ firebase_uid: firebaseUid });
  }

  async create(data: UserData): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      ultimo_login_em: new Date(),
    });
  }
}
