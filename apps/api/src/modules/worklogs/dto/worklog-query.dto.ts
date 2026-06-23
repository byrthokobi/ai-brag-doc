import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum Category {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  QA = 'qa',
  MANAGEMENT = 'management',
}

export class WorklogQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsEnum(Category)
  @IsOptional()
  category?: Category;
}
