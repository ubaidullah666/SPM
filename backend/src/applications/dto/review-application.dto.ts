import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../common/enums/status.enum';

export class ReviewApplicationDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  ngoFeedback?: string;
}
