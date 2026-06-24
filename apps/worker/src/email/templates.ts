export function dailyReminderTemplate(date: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
      <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;">Time to log your work 📝</h2>
      <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">
        You haven't logged anything for <strong>${date}</strong> yet.
        It only takes a minute — capture what you shipped today before it slips your mind.
      </p>
      <a href="${process.env.WEB_URL ?? 'http://localhost:3000'}/logs/new"
         style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;
                text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
        Log today's work
      </a>
      <p style="margin:32px 0 0;font-size:12px;color:#a1a1aa;">
        You're receiving this because you have an AI Brag Doc account.
      </p>
    </div>
  `;
}

export function generationFailedTemplate(docType: string, period: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
      <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;">Generation failed ⚠️</h2>
      <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">
        Your <strong>${docType}</strong> for <strong>${period}</strong> could not be generated
        after multiple attempts. Please try regenerating from your dashboard.
      </p>
      <a href="${process.env.WEB_URL ?? 'http://localhost:3000'}/summaries/${docType === 'weekly summary' ? 'weekly' : 'monthly'}"
         style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;
                text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
        Regenerate
      </a>
      <p style="margin:32px 0 0;font-size:12px;color:#a1a1aa;">
        You're receiving this because you have an AI Brag Doc account.
      </p>
    </div>
  `;
}
