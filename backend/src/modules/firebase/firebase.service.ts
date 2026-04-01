import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  async verifyIdToken(idToken: string) {
    return admin.auth().verifyIdToken(idToken);
  }

  async sendPushNotificationToTokens(
    tokens: string[],
    data: {
      title: string;
      body: string;
      route?: string | null;
      payload?: Record<string, any> | null;
    },
  ) {
    if (!tokens.length) {
      return null;
    }

    return admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: data.title,
        body: data.body,
      },
      data: {
        rota_destino: data.route ?? '',
        payload: data.payload ? JSON.stringify(data.payload) : '',
      },
    });
  }
}
