import { prisma } from '../prisma/prisma-client';
import { sendEmail } from '../email/mailer';
import { dailyReminderTemplate } from '../email/templates';

export async function checkAndRemindAll(): Promise<void> {
  const todayUTC = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(`${todayUTC}T00:00:00.000Z`);

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, email: true },
  });

  console.log(`[cron/reminder] Checking ${users.length} users for ${todayUTC}`);

  const results = await Promise.allSettled(
    users.map(async (user) => {
      const logged = await prisma.workLog.findFirst({
        where: { userId: user.id, date: todayDate },
        select: { id: true },
      });

      if (logged) return;

      await sendEmail({
        to: user.email,
        subject: "Don't forget to log your work today",
        html: dailyReminderTemplate(todayUTC),
      });

      console.log(`[cron/reminder] Reminder sent to ${user.email}`);
    }),
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length) {
    failed.forEach(r => console.error('[cron/reminder] Error:', (r as PromiseRejectedResult).reason));
  }

  console.log(`[cron/reminder] Done — ${results.length - failed.length}/${results.length} users processed`);
}
