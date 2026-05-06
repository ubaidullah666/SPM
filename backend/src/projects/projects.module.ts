import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectEntity } from '../entities/project.entity';
import { NgoEntity } from '../entities/ngo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, NgoEntity])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
