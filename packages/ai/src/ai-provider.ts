import OpenAI from 'openai';

export interface WorkLogEntry {
  date: Date;
  frontend: string | null;
  backend: string | null;
  qa: string | null;
  management: string | null;
}

export interface WeeklySummaryEntry {
  weekStart: Date;
  content: string;
}

export interface IAiProvider {
  generateWeeklySummary(worklogs: WorkLogEntry[]): Promise<string>;
  generateMonthlyDoc(summaries: WeeklySummaryEntry[], worklogs: WorkLogEntry[]): Promise<string>;
}

export class DeepSeekProvider implements IAiProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generateWeeklySummary(worklogs: WorkLogEntry[]): Promise<string> {
    const logText = worklogs.length === 0
      ? 'No work logs recorded for this week.'
      : worklogs.map(log => {
          const entries = [
            log.frontend && `Frontend: ${log.frontend}`,
            log.backend && `Backend: ${log.backend}`,
            log.qa && `QA: ${log.qa}`,
            log.management && `Management: ${log.management}`,
          ].filter(Boolean).join('\n');
          return `Date: ${log.date.toISOString().split('T')[0]}\n${entries}`;
        }).join('\n\n');

    const completion = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional technical writer helping developers create weekly work summaries for performance reviews and brag documents.
Write a concise, professional weekly summary in 2-4 paragraphs. Focus on achievements, impact, and technical contributions.
Use past tense. Be specific but concise. Do not invent details not present in the logs.`,
        },
        {
          role: 'user',
          content: `Please write a weekly work summary based on these daily work logs:\n\n${logText}`,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? '[Summary generation failed]';
  }

  async generateMonthlyDoc(summaries: WeeklySummaryEntry[], worklogs: WorkLogEntry[]): Promise<string> {
    const summaryText = summaries.length === 0
      ? 'No weekly summaries available.'
      : summaries.map(s =>
          `Week of ${s.weekStart.toISOString().split('T')[0]}:\n${s.content}`
        ).join('\n\n---\n\n');

    const logCount = worklogs.length;

    const completion = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional technical writer helping developers create monthly brag documents for performance reviews.
Write a compelling, structured monthly brag document with the following sections:
1. Executive Summary (2-3 sentences)
2. Key Achievements (bullet points)
3. Technical Contributions (by category if applicable)
4. Impact & Metrics (where inferable)

Be professional, specific, and achievement-focused. Use past tense.`,
        },
        {
          role: 'user',
          content: `Please write a monthly brag document based on these weekly summaries (covering ${logCount} work log entries):\n\n${summaryText}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? '[Monthly doc generation failed]';
  }
}
