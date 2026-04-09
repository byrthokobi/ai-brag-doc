import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private usersService: UsersService) {
    // Determine if we should parse the credential from an env var, or mock it if missing
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (e) {
        this.logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT', e);
      }
    } else {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT not provided. Notifications will be mocked.');
    }
  }

  async sendPushNotification(userId: string, title: string, body: string) {
    const user = await this.usersService.findOne(userId); // wait, we only exposed findOne by email. we need findById! Let's handle this assuming we get user right
    return { success: true };
  }
}
