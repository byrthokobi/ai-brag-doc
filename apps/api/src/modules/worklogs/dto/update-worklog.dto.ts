import { IsOptional, IsString } from 'class-validator';

export class UpdateWorklogDto {
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
