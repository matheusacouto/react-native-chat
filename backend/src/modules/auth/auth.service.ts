import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/user.service';
import { FirebaseAuthService } from '../firebase/firebase.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseAuthService,
    private readonly usersService: UsersService,
  ) {}

  async loginWithFirebase(idToken: string): Promise<User> {
    const token = await this.firebaseService.verifyIdToken(idToken);
    const firebaseUid = token.uid;
    const provider = token.firebase?.sign_in_provider;

    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    if (user) {
      return user;
    }

    if (provider === 'google.com') {
      if (!token.email) {
        throw new NotFoundException('E-mail não encontrado no token do Google');
      }

      return this.usersService.create({
        firebase_uid: firebaseUid,
        nome: token.name ?? null,
        data_nascimento: null,
        email: token.email,
        telefone_pais: null,
        telefone_ddd: null,
        telefone_numero: null,
        sexo: null,
        provider_auth: provider,
        status: 'ativo',
        ultimo_login_em: new Date(),
      });
    }

    throw new NotFoundException('Usuário não encontrado na base interna');
  }
}
