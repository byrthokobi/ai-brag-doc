import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { WorkLog, WeeklySummary } from '../../../api/src/generated/prisma/client.js';

export interface IAiProvider {
  generateWeeklySummary(worklogs: WorkLog[]): Promise<string>;
  generateMonthlyDoc(summaries: WeeklySummary[], worklogs: WorkLog[]): Promise<string>;
}

const weeklyPrompt = PromptTemplate.fromTemplate(`
You are a professional technical writer helping developers write weekly work summaries for performance reviews.
Write 2-4 concise paragraphs in past tense. Be specific. Do not invent details not present in the logs.

Work logs for this week:
{logText}

Weekly summary:
`);

const monthlyPrompt = PromptTemplate.fromTemplate(`
You are a professional technical writer helping developers write monthly brag documents for performance reviews.
Write a structured document with:
1. Executive Summary (2-3 sentences)
2. Key Achievements (bullet points)
3. Technical Contributions (by category if applicable)
4. Impact & Metrics (where inferable)

Be specific, achievement-focused, and use past tense.

Weekly summaries ({logCount} total work log entries):
{summaryText}

Monthly brag document:
`);

class DeepSeekLangChainProvider implements IAiProvider {
  private model: ChatOpenAI;
  private parser: StringOutputParser;

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      apiKey,
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 1500,
      configuration: {
        baseURL: 'https://api.deepseek.com',
      },
    });
    this.parser = new StringOutputParser();
  }

  async generateWeeklySummary(worklogs: WorkLog[]): Promise<string> {
    const logText = worklogs.length === 0
      ? 'No work logs recorded for this week.'
      : worklogs.map(log => {
          const entries = [
            log.frontend   && `Frontend: ${log.frontend}`,
            log.backend    && `Backend: ${log.backend}`,
            log.qa         && `QA: ${log.qa}`,
            log.management && `Management: ${log.management}`,
          ].filter(Boolean).join('\n');
          return `Date: ${log.date.toISOString().split('T')[0]}\n${entries}`;
        }).join('\n\n');

    const chain = weeklyPrompt.pipe(this.model).pipe(this.parser);
    return chain.invoke({ logText });
  }

  async generateMonthlyDoc(summaries: WeeklySummary[], worklogs: WorkLog[]): Promise<string> {
    const summaryText = summaries.length === 0
      ? 'No weekly summaries available.'
      : summaries.map(s =>
          `Week of ${s.weekStart.toISOString().split('T')[0]}:\n${s.content}`
        ).join('\n\n---\n\n');

    const chain = monthlyPrompt.pipe(this.model).pipe(this.parser);
    return chain.invoke({ summaryText, logCount: worklogs.length });
  }
}

const apiKey = process.env.AI_API_KEY;
if (!apiKey) console.warn('[AI] AI_API_KEY not set — generation will fail');

export const aiProvider: IAiProvider = new DeepSeekLangChainProvider(apiKey ?? '');
