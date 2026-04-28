import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    let token: Awaited<ReturnType<FirebaseAuthService['verifyIdToken']>>;

    try {
      token = await this.firebaseService.verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Token do Firebase inválido.');
    }

    const firebaseUid = token.uid;
    const provider = token.firebase?.sign_in_provider ?? 'firebase';
    const loginTimestamp = new Date();

    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    if (user) {
      await this.usersService.updateLastLogin(user.id);

      return {
        ...user,
        ultimo_login_em: loginTimestamp,
      };
    }

    if (!token.email) {
      throw new NotFoundException('E-mail não encontrado no token do Firebase');
    }

    const userByEmail = await this.usersService.findByEmail(token.email);

    if (userByEmail) {
      const updatedUser = {
        ...userByEmail,
        firebase_uid: firebaseUid,
        nome: userByEmail.nome ?? token.name ?? null,
        provider_auth: provider,
        ultimo_login_em: loginTimestamp,
      };

      await this.usersService.syncFirebaseIdentity(userByEmail.id, {
        firebase_uid: updatedUser.firebase_uid,
        nome: updatedUser.nome,
        provider_auth: updatedUser.provider_auth,
        ultimo_login_em: updatedUser.ultimo_login_em,
      });

      return updatedUser;
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
      ultimo_login_em: loginTimestamp,
    });
  }
}
