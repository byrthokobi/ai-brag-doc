import { Job } from 'bullmq';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { prisma } from '../prisma/prisma-client';
import { sendNotification } from './send-notification';

function initFirebase(): void {
  if (getApps().length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    console.log('[notifications] Firebase initialized');
  } else {
    console.warn('[notifications] Firebase env vars missing — FCM notifications disabled');
  }
}

initFirebase();

export async function handleGenerationFailure(job: Job, err: Error): Promise<void> {
  const { userId, weekStart, month } = job.data as { userId: string; weekStart?: string; month?: string };
  const period = weekStart ?? month ?? 'unknown';
  const docType = job.name === 'weekly-summary' ? 'weekly summary' : 'monthly doc';

  console.error(`[worker] Final failure — job ${job.id} (${job.name}) user=${userId} period=${period}: ${err.message}`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });

    if (!user?.fcmTokens?.length) {
      console.warn(`[notifications] No FCM tokens for user ${userId} — skipping failure notification`);
      return;
    }

    await sendNotification(
      user.fcmTokens,
      'Generation failed',
      `Your ${docType} for ${period} could not be generated. Please try again.`,
      { jobType: job.name, period },
    );

    console.log(`[notifications] Failure FCM sent to user ${userId} (${user.fcmTokens.length} token(s))`);
  } catch (notifyErr) {
    console.error(`[notifications] Failed to send FCM for user ${userId}:`, notifyErr);
  }
}
