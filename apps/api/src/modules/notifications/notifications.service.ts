import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly usersService: UsersService) {
    if (getApps().length > 0) return;

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
      this.logger.warn('Firebase env vars missing — notifications disabled');
    }
  }

  async registerToken(userId: string, token: string): Promise<void> {
    await this.usersService.addFcmToken(userId, token);
  }

  async sendToTokens(
    userId: string,
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!tokens.length || getApps().length === 0) return;

    try {
      const response = await getMessaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        ...(data ? { data } : {}),
      });

      const invalidTokens: string[] = [];
      response.responses.forEach((res, idx) => {
        if (!res.success && res.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[idx]);
        }
      });

      if (invalidTokens.length) {
        await this.usersService.removeFcmTokens(userId, invalidTokens);
        this.logger.warn(`Removed ${invalidTokens.length} stale token(s) for user ${userId}`);
      }

      this.logger.log(`FCM sent to user ${userId} (${tokens.length} token(s))`);
    } catch (err) {
      this.logger.error(`Failed to send FCM to user ${userId}`, err);
    }
  }
}
