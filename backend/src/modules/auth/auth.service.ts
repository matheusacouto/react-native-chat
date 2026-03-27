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

    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    // Temporário
    if (!user) {
      throw new NotFoundException('Usuário não encontrado na base interna');
    }

    return user;
  }
}
