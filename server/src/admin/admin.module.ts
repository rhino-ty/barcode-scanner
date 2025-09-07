import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ScanLogsModule } from '../scan-logs/scan-logs.module'; // 기존 모듈 임포트
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    DatabaseModule,
    ScanLogsModule, // 기존 ScanLogsService 사용을 위해 임포트
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
