export class WorklogResponseDto {
  id: string;
  userId: string;
  date: Date;
  frontend: string | null;
  backend: string | null;
  qa: string | null;
  management: string | null;
  createdAt: Date;

  constructor(partial: Partial<WorklogResponseDto>) {
    Object.assign(this, partial);
  }
}
