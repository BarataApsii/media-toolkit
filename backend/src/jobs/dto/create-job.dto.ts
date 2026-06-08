import { IsString, IsOptional } from 'class-validator';

export class CreateJobDto {
  @IsString()
  fileId: string;

  @IsOptional()
  @IsString()
  operation?: string;
}
