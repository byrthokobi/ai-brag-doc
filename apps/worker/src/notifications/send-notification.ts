import { getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export async function sendNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<string[]> {
  if (!tokens.length || getApps().length === 0) return [];

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

  return invalidTokens;
}
