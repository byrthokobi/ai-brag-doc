import OpenAI from 'openai';
import { WorkLog, WeeklySummary } from '../../../api/src/generated/prisma/client.js';

export interface IAiProvider {
  generateWeeklySummary(worklogs: WorkLog[]): Promise<string>;
  generateMonthlyDoc(summaries: WeeklySummary[], worklogs: WorkLog[]): Promise<string>;
}

class DeepSeekProvider implements IAiProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com' });
  }

  async generateWeeklySummary(worklogs: WorkLog[]): Promise<string> {
    const logText = worklogs.length === 0
      ? 'No work logs recorded for this week.'
      : worklogs.map(log => {
          const entries = [
            log.frontend && `Frontend: ${log.frontend}`,
            log.backend  && `Backend: ${log.backend}`,
            log.qa       && `QA: ${log.qa}`,
            log.management && `Management: ${log.management}`,
          ].filter(Boolean).join('\n');
          return `Date: ${log.date.toISOString().split('T')[0]}\n${entries}`;
        }).join('\n\n');

    const res = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a professional technical writer helping developers write weekly work summaries for performance reviews. Write 2-4 concise paragraphs in past tense. Be specific. Do not invent details.',
        },
        { role: 'user', content: `Write a weekly work summary from these logs:\n\n${logText}` },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    return res.choices[0]?.message?.content ?? '[Summary generation failed]';
  }

  async generateMonthlyDoc(summaries: WeeklySummary[], worklogs: WorkLog[]): Promise<string> {
    const summaryText = summaries.length === 0
      ? 'No weekly summaries available.'
      : summaries.map(s => `Week of ${s.weekStart.toISOString().split('T')[0]}:\n${s.content}`).join('\n\n---\n\n');

    const res = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a professional technical writer. Write a monthly brag document with: 1) Executive Summary, 2) Key Achievements, 3) Technical Contributions, 4) Impact & Metrics. Be specific and achievement-focused. Past tense.',
        },
        {
          role: 'user',
          content: `Write a monthly brag document from these weekly summaries (${worklogs.length} total work log entries):\n\n${summaryText}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });
    return res.choices[0]?.message?.content ?? '[Monthly doc generation failed]';
  }
}

const apiKey = process.env.AI_API_KEY;
if (!apiKey) console.warn('[AI] AI_API_KEY not set — generation will fail');

export const aiProvider: IAiProvider = new DeepSeekProvider(apiKey ?? '');
