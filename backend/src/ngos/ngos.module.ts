import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NgosService } from './ngos.service';
import { NgoEntity } from '../entities/ngo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NgoEntity])],
  providers: [NgosService],
  exports: [NgosService],
})
export class NgosModule {}
