import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NgosModule } from './ngos/ngos.module';
import { ProjectsModule } from './projects/projects.module';
import { ApplicationsModule } from './applications/applications.module';
import { ContributionsModule } from './contributions/contributions.module';
import { RatingsModule } from './ratings/ratings.module';
import { AiMatchingModule } from './ai-matching/ai-matching.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const host = configService.get<string>('DATABASE_HOST', 'localhost');
        const port = Number.parseInt(configService.get<string>('DATABASE_PORT', '5432'), 10);
        const username = configService.get<string>('DATABASE_USER', 'postgres');
        const password = configService.get<string>('DATABASE_PASSWORD', 'postgres');
        const database = configService.get<string>('DATABASE_NAME', 'social_impact');
        const synchronize =
          configService.get<string>('DATABASE_SYNC', 'true').toLowerCase() === 'true';

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize,
          };
        }

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    NgosModule,
    UsersModule,
    ProjectsModule,
    ApplicationsModule,
    ContributionsModule,
    RatingsModule,
    AiMatchingModule,
  ],
})
export class AppModule {}
