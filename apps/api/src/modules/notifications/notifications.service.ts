import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert } from 'firebase-admin/app';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      try {
        initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
        this.logger.log('Firebase initialized successfully');
      } catch (e) {
        this.logger.error('Failed to initialize Firebase', e);
      }
    } else {
      this.logger.warn('Firebase env vars missing. Notifications will be mocked.');
    }
  }

  async sendPushNotification(_userId: string, _title: string, _body: string) {
    return { success: true };
  }
}
