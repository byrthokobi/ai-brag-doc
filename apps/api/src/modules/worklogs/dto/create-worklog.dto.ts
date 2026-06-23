import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateWorklogDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  frontend?: string;

  @IsString()
  @IsOptional()
  backend?: string;

  @IsString()
  @IsOptional()
  qa?: string;

  @IsString()
  @IsOptional()
  management?: string;
}
