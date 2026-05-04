import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ApplicationsModule } from './applications/applications.module';
import { ContributionsModule } from './contributions/contributions.module';
import { RatingsModule } from './ratings/ratings.module';
import { AiMatchingModule } from './ai-matching/ai-matching.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Use forRootAsync so ConfigModule is ready before Mongoose connects
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    ApplicationsModule,
    ContributionsModule,
    RatingsModule,
    AiMatchingModule,
  ],
})
export class AppModule {}
