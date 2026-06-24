import { Job } from 'bullmq';
import { prisma } from '../prisma/prisma-client';
import { sendEmail } from '../email/mailer';
import { generationFailedTemplate } from '../email/templates';

export async function handleGenerationFailure(job: Job, err: Error): Promise<void> {
  const { userId, weekStart, month } = job.data as { userId: string; weekStart?: string; month?: string };
  const period  = weekStart ?? month ?? 'unknown';
  const docType = job.name === 'weekly-summary' ? 'weekly summary' : 'monthly doc';

  console.error(`[worker] Final failure — job ${job.id} (${job.name}) user=${userId} period=${period}: ${err.message}`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) return;

    await sendEmail({
      to: user.email,
      subject: `Your ${docType} for ${period} could not be generated`,
      html: generationFailedTemplate(docType, period),
    });

    console.log(`[notifications] Failure email sent to ${user.email}`);
  } catch (notifyErr) {
    console.error(`[notifications] Failed to send failure email for user ${userId}:`, notifyErr);
  }
}
