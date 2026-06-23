import { IsDateString } from 'class-validator';

export class TriggerWeeklyDto {
  @IsDateString()
  weekStart: string;
}
