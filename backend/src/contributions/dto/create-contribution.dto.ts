import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, Min } from 'class-validator';

export class CreateContributionDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNumber()
  @Min(0.5)
  hours: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  tasksCompleted?: string[];
}
