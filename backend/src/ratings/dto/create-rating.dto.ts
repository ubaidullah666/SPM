import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsOptional()
  @IsString()
  ratedUserId?: string;

  @IsOptional()
  @IsString()
  ratedProjectId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsEnum(['volunteer', 'project'])
  type: string;
}
