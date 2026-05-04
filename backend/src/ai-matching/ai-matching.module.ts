import { Module } from '@nestjs/common';
import { AiMatchingService } from './ai-matching.service';
import { AiMatchingController } from './ai-matching.controller';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ProjectsModule, UsersModule],
  controllers: [AiMatchingController],
  providers: [AiMatchingService],
})
export class AiMatchingModule {}
