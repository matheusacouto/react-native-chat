import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

type FirebaseServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

@Injectable()
export class FirebaseAuthService {
  constructor() {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!rawServiceAccount) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON não foi configurado no ambiente.',
      );
    }

    let parsedServiceAccount: unknown;

    try {
      parsedServiceAccount = JSON.parse(rawServiceAccount);
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON não contém um JSON válido.',
      );
    }

    if (!this.isFirebaseServiceAccount(parsedServiceAccount)) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON está em formato inválido.',
      );
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: parsedServiceAccount.project_id,
          clientEmail: parsedServiceAccount.client_email,
          privateKey: parsedServiceAccount.private_key.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  private isFirebaseServiceAccount(
    value: unknown,
  ): value is FirebaseServiceAccount {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const serviceAccount = value as Record<string, unknown>;

    return (
      typeof serviceAccount.project_id === 'string' &&
      typeof serviceAccount.client_email === 'string' &&
      typeof serviceAccount.private_key === 'string'
    );
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
