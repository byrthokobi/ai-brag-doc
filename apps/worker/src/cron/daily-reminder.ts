import { prisma } from '../prisma/prisma-client';
import { sendNotification } from '../notifications/send-notification';

export async function checkAndRemindAll(): Promise<void> {
  const todayUTC = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(`${todayUTC}T00:00:00.000Z`);

  const users = await prisma.user.findMany({
    where: { isActive: true, fcmTokens: { isEmpty: false } },
    select: { id: true, fcmTokens: true },
  });

  console.log(`[cron/reminder] Checking ${users.length} users for ${todayUTC}`);

  const results = await Promise.allSettled(
    users.map(async (user) => {
      const logged = await prisma.workLog.findFirst({
        where: { userId: user.id, date: todayDate },
        select: { id: true },
      });

      if (logged) return;

      const invalidTokens = await sendNotification(
        user.fcmTokens,
        'Time to log your work! 📝',
        "Don't forget to capture what you worked on today.",
        { type: 'daily-reminder', date: todayUTC },
      );

      if (invalidTokens.length) {
        const filtered = user.fcmTokens.filter(t => !invalidTokens.includes(t));
        await prisma.user.update({
          where: { id: user.id },
          data: { fcmTokens: { set: filtered } },
        });
        console.warn(`[cron/reminder] Removed ${invalidTokens.length} stale token(s) for user ${user.id}`);
      }
    }),
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length) {
    failed.forEach(r => console.error('[cron/reminder] User error:', (r as PromiseRejectedResult).reason));
  }

  console.log(`[cron/reminder] Done — ${results.length - failed.length}/${results.length} users processed`);
}
