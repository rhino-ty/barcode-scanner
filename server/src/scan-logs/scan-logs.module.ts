import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ScanLogsController } from './scan-logs.controller';
import { ScanLogsService } from './scan-logs.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ScanLogsController],
  providers: [ScanLogsService],
  exports: [ScanLogsService], // 다른 모듈에서 사용할 수 있도록 export
})
export class ScanLogsModule {}
