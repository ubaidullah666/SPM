import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from '../entities/user.entity';
import { ContributionEntity } from '../entities/contribution.entity';

import { NgosModule } from '../ngos/ngos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ContributionEntity]),
    NgosModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
