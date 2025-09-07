import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ScanLogsModule } from './scan-logs/scan-logs.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validate,
    }),
    DatabaseModule,
    HealthModule,
    UserModule,
    AuthModule,
    ScanLogsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
